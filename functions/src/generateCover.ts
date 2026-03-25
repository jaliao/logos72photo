/*
 * ----------------------------------------------
 * Firebase Cloud Function：slotGroup 封面自動合成
 * 2026-03-17
 * functions/src/generateCover.ts
 * ----------------------------------------------
 *
 * Firestore `photos/{docId}` onCreate 觸發：
 * 若為該 slotGroup 的第一張照片，自動合成封面並上傳至 R2。
 *
 * 封面規格：
 *   底圖：functions/assets/watermark2.png（1080×1440）
 *   照片嵌入：cover-crop 至 844×861，位置 x=117, y=229
 *   輸出：covers/{slotGroup}.jpg（JPEG quality 88）
 */

import * as path from 'path'
import * as fs from 'fs'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import * as admin from 'firebase-admin'
import sharp from 'sharp'

// ─── R2 客戶端 ─────────────────────────────────────────────────────────────

function createR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  })
}

// ─── 工具函式 ──────────────────────────────────────────────────────────────

/** 查詢 R2 中 `covers/{slotGroup}.jpg` 是否已存在（冪等保護） */
async function coverExists(r2: S3Client, slotGroup: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `covers/${slotGroup}.jpg`,
    }))
    return true
  } catch {
    return false
  }
}

/** 從 URL 下載圖片 buffer */
async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`下載照片失敗：${url} → HTTP ${res.status}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/** 合成封面圖：將照片 cover-crop 後嵌入底圖，輸出 JPEG buffer */
async function composeCover(photoBuffer: Buffer): Promise<Buffer> {
  const watermarkPath = path.join(__dirname, '../assets/watermark2.png')
  const watermarkBuffer = fs.readFileSync(watermarkPath)

  // 將照片 cover-crop 至 844×861（取中央，不變形）
  const croppedBuffer = await sharp(photoBuffer)
    .resize(843, 861, { fit: 'cover' })
    .toBuffer()

  // 合成至底圖（1080×1440），照片置於 x=118, y=229
  const result = await sharp(watermarkBuffer)
    .composite([{ input: croppedBuffer, left: 118, top: 229 }])
    .jpeg({ quality: 88 })
    .toBuffer()

  return result
}

/**
 * 預熱縮圖快取：呼叫 Image Service 觸發 640w/80q 與 1280w/85q L2 寫入
 * fire-and-forget，失敗不影響主流程
 */
async function warmThumbnails(r2Url: string): Promise<void> {
  const imageServiceUrl = (process.env.IMAGE_SERVICE_URL ?? '').replace(/\/$/, '')
  if (!imageServiceUrl) return
  const r2PublicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
  const r2Key = r2Url.replace(r2PublicUrl + '/', '')
  await Promise.all([
    fetch(`${imageServiceUrl}/resizing/640/80/${r2Key}`),
    fetch(`${imageServiceUrl}/resizing/1280/85/${r2Key}`),
  ])
}

/** 上傳封面 buffer 至 R2 `covers/{slotGroup}.jpg` */
async function uploadCover(r2: S3Client, slotGroup: string, buffer: Buffer): Promise<void> {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `covers/${slotGroup}.jpg`,
    Body: buffer,
    ContentType: 'image/jpeg',
  }))
}

/**
 * 在 Firestore slotGroups/{slotGroup} 寫入封面存在 flag
 * fire-and-forget，失敗不影響主流程
 */
async function setCoverFlag(slotGroup: string): Promise<void> {
  const db = admin.firestore()
  await db.collection('slotGroups').doc(slotGroup).set({ hasCover: true }, { merge: true })
}

// ─── Cloud Function ─────────────────────────────────────────────────────────

/**
 * Firestore `photos/{docId}` onCreate 觸發器。
 * 條件：device_id === 'iphone2' 且封面尚未存在 → 合成封面並上傳 R2。
 */
export const generateCover = onDocumentCreated({ document: 'photos/{docId}', region: 'asia-east1', secrets: ['IMAGE_SERVICE_URL'] }, async (event) => {
  const data = event.data?.data()
  if (!data) return

  const slotGroup: string | undefined = data['slot_group']
  const r2Url: string | undefined = data['r2_url']
  const deviceId: string | undefined = data['device_id']

  if (!slotGroup || !r2Url) {
    console.log('generateCover: 缺少 slot_group 或 r2_url，跳過')
    return
  }

  // 僅使用 iphone-2 的照片產生封面
  if (deviceId !== 'iphone-2') {
    console.log(`generateCover: device_id=${deviceId}，非 iphone-2，跳過`)
    return
  }

  const r2 = createR2Client()

  // 冪等保護：封面已存在則跳過
  // 注意：不使用 photo count 判斷，避免多裝置同時上傳造成 race condition
  //（兩個 trigger 同時執行時 count 已 ≥ 2，導致封面永遠跳過）
  if (await coverExists(r2, slotGroup)) {
    console.log(`generateCover: covers/${slotGroup}.jpg 已存在，跳過`)
    return
  }

  console.log(`generateCover: 開始合成 slotGroup ${slotGroup} 封面`)

  // 下載原圖、合成、上傳
  try {
    const photoBuffer = await fetchImageBuffer(r2Url)
    const coverBuffer = await composeCover(photoBuffer)
    await uploadCover(r2, slotGroup, coverBuffer)
    console.log(`generateCover: covers/${slotGroup}.jpg 上傳完成`)
    // 預熱縮圖快取 + 寫入封面 flag（平行 fire-and-forget）
    Promise.all([warmThumbnails(r2Url), setCoverFlag(slotGroup)]).catch((err) =>
      console.warn('generateCover: 預熱或 flag 寫入失敗：', err),
    )
  } catch (err) {
    // 下載或合成失敗：記錄錯誤，不拋出例外（避免重試風暴）
    console.error(`generateCover: 合成失敗（slotGroup=${slotGroup}）：`, err)
  }
})
