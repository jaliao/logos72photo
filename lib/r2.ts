/*
 * ----------------------------------------------
 * Cloudflare R2 客戶端（S3 相容 API）
 * 2026-02-21
 * lib/r2.ts
 * ----------------------------------------------
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

/**
 * 刪除 R2 中單一物件
 * @param key 物件路徑，例如 "covers/03152002.jpg"
 */
export async function deleteR2Object(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }),
  )
}

/**
 * 刪除 R2 中指定前綴下的所有物件（最多 1000 個）
 * @param prefix 前綴，例如 "2026-03-08/"
 * @returns 刪除的物件數量
 */
export async function deleteR2ObjectsByPrefix(prefix: string): Promise<number> {
  const bucket = process.env.R2_BUCKET_NAME

  // 列舉指定前綴的所有物件
  const listRes = await r2.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
  )

  const objects = listRes.Contents ?? []
  if (objects.length === 0) return 0

  // 批次刪除
  await r2.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: objects.map((obj) => ({ Key: obj.Key! })),
        Quiet: true,
      },
    }),
  )

  return objects.length
}
