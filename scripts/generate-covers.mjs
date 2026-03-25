#!/usr/bin/env node
/*
 * ----------------------------------------------
 * 批次封面合成腳本（本機 Node.js）
 * 2026-03-17
 * scripts/generate-covers.mjs
 * ----------------------------------------------
 *
 * 使用方式：
 *   node scripts/generate-covers.mjs [--from MMDD] [--to MMDD]
 *
 * 範例：
 *   node scripts/generate-covers.mjs --from 0325 --to 0331
 *   node scripts/generate-covers.mjs   （處理全部 slotGroup）
 *
 * 前置條件：
 *   1. 根目錄有 .env.local（含 R2 與 Firebase Admin 憑證）
 *   2. 已安裝 sharp：npm install sharp（或 functions/ 目錄已安裝）
 */

import { readFileSync, existsSync } from 'fs'
import { createRequire } from 'module'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// ─── 讀取 .env.local ────────────────────────────────────────────────────────

const envPath = existsSync(join(__dirname, '../.env.local'))
  ? join(__dirname, '../.env.local')
  : join(__dirname, '../.env')
if (!existsSync(envPath)) {
  console.error('找不到 .env.local 或 .env，請在專案根目錄執行此腳本')
  process.exit(1)
}

const env = {}
readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim()
})

const R2_ACCOUNT_ID      = env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID   = env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME     = env.R2_BUCKET_NAME ?? 'logos72photo'
const FIREBASE_PROJECT_ID = env.FIREBASE_ADMIN_PROJECT_ID
const FIREBASE_CLIENT_EMAIL = env.FIREBASE_ADMIN_CLIENT_EMAIL
const FIREBASE_PRIVATE_KEY  = env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('缺少 R2 憑證（R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY）')
  process.exit(1)
}
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('缺少 Firebase Admin 憑證（FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY）')
  process.exit(1)
}

// ─── 載入 sharp（優先 functions/node_modules，其次全域） ───────────────────

let sharp
try {
  sharp = require(join(__dirname, '../functions/node_modules/sharp'))
} catch {
  try {
    sharp = require('sharp')
  } catch {
    console.error('找不到 sharp。請執行：cd functions && npm install  或  npm install -g sharp')
    process.exit(1)
  }
}

// ─── CLI 參數解析 ────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
let fromMMDD = null
let toMMDD = null
let force = false

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from'  && args[i + 1]) fromMMDD = args[++i]
  if (args[i] === '--to'    && args[i + 1]) toMMDD   = args[++i]
  if (args[i] === '--force') force = true
}

console.log('── 封面批次合成 ──────────────────────────────────────')
console.log(`日期範圍：${fromMMDD ?? '（全部）'} ～ ${toMMDD ?? '（全部）'}`)
console.log(`覆蓋模式：${force ? '是（--force）' : '否（已存在跳過）'}`)
console.log(`R2 Bucket：${R2_BUCKET_NAME}`)
console.log(`Firebase Project：${FIREBASE_PROJECT_ID}`)
console.log('─────────────────────────────────────────────────────')

// ─── R2 客戶端 ───────────────────────────────────────────────────────────────

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

// ─── Firebase 認證（Service Account JWT） ────────────────────────────────────

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/\s/g, '')
  const buf = Buffer.from(base64, 'base64')
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

function base64url(data) {
  const bytes = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : new Uint8Array(data)
  let str = ''
  bytes.forEach(b => str += String.fromCharCode(b))
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

let cachedToken = null

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt > now + 30) return cachedToken.value

  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(FIREBASE_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const header  = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({
    iss: FIREBASE_CLIENT_EMAIL,
    sub: FIREBASE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))

  const signingInput = `${header}.${payload}`
  const signature = await globalThis.crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  )

  const jwt = `${signingInput}.${base64url(signature)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) throw new Error(`取得 access token 失敗：${res.status} ${await res.text()}`)
  const data = await res.json()
  cachedToken = { value: data.access_token, expiresAt: now + data.expires_in }
  return cachedToken.value
}

// ─── Firestore：查詢所有 slotGroup 的第一張照片 ──────────────────────────────

async function queryFirstPhotoPerSlotGroup() {
  const token = await getAccessToken()

  // 取得 photos 集合所有文件（只需 slot_group 與 r2_url 與 timestamp）
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'photos' }],
      select: {
        fields: [
          { fieldPath: 'slot_group' },
          { fieldPath: 'r2_url' },
          { fieldPath: 'timestamp' },
        ],
      },
      orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'ASCENDING' }],
      limit: 10000,
    },
  }

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!res.ok) throw new Error(`Firestore 查詢失敗：${res.status} ${await res.text()}`)

  const rows = await res.json()

  // 每個 slotGroup 只保留 timestamp 最小的那筆（first-write-wins）
  const firstByGroup = new Map()

  for (const row of rows) {
    if (!row.document?.fields) continue
    const f = row.document.fields
    const slotGroup = f.slot_group?.stringValue
    const r2Url    = f.r2_url?.stringValue
    const timestamp = Number(f.timestamp?.integerValue ?? f.timestamp?.doubleValue ?? 0)

    if (!slotGroup || !r2Url) continue

    // 日期範圍過濾（slotGroup = MMDDHHSS，前 4 碼為 MMDD）
    const mmdd = slotGroup.slice(0, 4)
    if (fromMMDD && mmdd < fromMMDD) continue
    if (toMMDD   && mmdd > toMMDD)   continue

    if (!firstByGroup.has(slotGroup) || timestamp < firstByGroup.get(slotGroup).timestamp) {
      firstByGroup.set(slotGroup, { r2Url, timestamp })
    }
  }

  return firstByGroup
}

// ─── R2：檢查封面是否已存在 ──────────────────────────────────────────────────

async function coverExists(slotGroup) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: `covers/${slotGroup}.jpg` }))
    return true
  } catch {
    return false
  }
}

// ─── Firestore：寫入 hasCover flag ───────────────────────────────────────────

async function setHasCoverFlag(slotGroup) {
  const token = await getAccessToken()
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/slotGroups/${slotGroup}?updateMask.fieldPaths=hasCover`
  const body = {
    fields: { hasCover: { booleanValue: true } },
  }
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`hasCover flag 寫入失敗：${res.status} ${await res.text()}`)
}

// ─── 圖像合成 ────────────────────────────────────────────────────────────────

const WATERMARK_PATH = join(__dirname, '../functions/assets/watermark2.png')
const watermarkBuffer = readFileSync(WATERMARK_PATH)

async function composeCover(photoBuffer) {
  const cropped = await sharp(photoBuffer)
    .resize(843, 861, { fit: 'cover' })
    .toBuffer()

  return sharp(watermarkBuffer)
    .composite([{ input: cropped, left: 118, top: 229 }])
    .jpeg({ quality: 88 })
    .toBuffer()
}

// ─── 主流程 ──────────────────────────────────────────────────────────────────

async function main() {
  const firstPhotos = await queryFirstPhotoPerSlotGroup()
  const total = firstPhotos.size
  console.log(`找到 ${total} 個 slotGroup\n`)

  let done = 0, skipped = 0, failed = 0

  for (const [slotGroup, { r2Url }] of firstPhotos.entries()) {
    process.stdout.write(`[${done + skipped + failed + 1}/${total}] ${slotGroup} ... `)

    if (!force && await coverExists(slotGroup)) {
      console.log('已存在，跳過')
      skipped++
      continue
    }

    try {
      const res = await fetch(r2Url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const photoBuffer = Buffer.from(await res.arrayBuffer())
      const coverBuffer = await composeCover(photoBuffer)

      await r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: `covers/${slotGroup}.jpg`,
        Body: coverBuffer,
        ContentType: 'image/jpeg',
      }))

      // 寫入 Firestore hasCover flag
      await setHasCoverFlag(slotGroup)

      console.log('✓')
      done++
    } catch (err) {
      console.log(`✗ ${err.message}`)
      failed++
    }
  }

  console.log('\n── 完成 ──────────────────────────────────────────────')
  console.log(`成功：${done}　已存在（跳過）：${skipped}　失敗：${failed}`)
}

main().catch(err => {
  console.error('腳本執行失敗：', err)
  process.exit(1)
})
