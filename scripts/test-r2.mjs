#!/usr/bin/env node
// R2 連線診斷腳本
// 使用方式：node scripts/test-r2.mjs

import { readFileSync } from 'fs'
import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3'

// 讀取 .env.local
const env = {}
try {
  readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#')) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('找不到 .env.local')
  process.exit(1)
}

const accountId = env.R2_ACCOUNT_ID
const accessKey = env.R2_ACCESS_KEY_ID
const secretKey = env.R2_SECRET_ACCESS_KEY
const bucket    = env.R2_BUCKET_NAME

console.log('── R2 診斷 ──────────────────────────')
console.log(`Account ID  : ${accountId} (${accountId?.length} 字元，應為 32)`)
console.log(`Access Key  : ${accessKey?.slice(0,6)}***`)
console.log(`Bucket      : ${bucket}`)
console.log(`Endpoint    : https://${accountId}.r2.cloudflarestorage.com`)
console.log('─────────────────────────────────────')

if (accountId?.length !== 32) {
  console.error('\n⚠️  R2_ACCOUNT_ID 長度不對！')
  console.error('   → 請到 Cloudflare Dashboard 右上角「帳戶 ID」複製（32 個英數字）')
  process.exit(1)
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
})

console.log('\n正在測試上傳一個小檔案...')
try {
  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: '_test/connection-check.txt',
    Body: Buffer.from('R2 連線測試 OK'),
    ContentType: 'text/plain',
  }))
  console.log('✅ 上傳成功！R2 連線正常。')
} catch (err) {
  console.error('❌ 上傳失敗：', err.message)
  if (err.message.includes('EPROTO') || err.message.includes('SSL')) {
    console.error('\n→ SSL 錯誤通常代表 Account ID 有誤，請再次確認。')
  } else if (err.Code === 'InvalidAccessKeyId') {
    console.error('\n→ Access Key 無效，請重新產生 R2 API 權杖。')
  } else if (err.Code === 'SignatureDoesNotMatch') {
    console.error('\n→ Secret Key 錯誤。')
  } else if (err.Code === 'NoSuchBucket') {
    console.error(`\n→ Bucket "${bucket}" 不存在，請先在 Cloudflare Dashboard 建立。`)
  }
}
