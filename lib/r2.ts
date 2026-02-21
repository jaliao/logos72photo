/*
 * ----------------------------------------------
 * Cloudflare R2 客戶端（S3 相容 API）
 * 2026-02-21
 * lib/r2.ts
 * ----------------------------------------------
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

/** R2 S3 相容客戶端 */
export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
})

/**
 * 上傳圖片至 R2
 * @param key  儲存路徑，例如 "2026-02-21/iphone-1_1708481234567.jpg"
 * @param body 圖片二進位資料（Uint8Array，Edge Runtime 相容）
 */
export async function uploadToR2(key: string, body: Uint8Array): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: 'image/jpeg',
    }),
  )

  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
  return `${publicUrl}/${key}`
}
