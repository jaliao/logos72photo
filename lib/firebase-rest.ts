/*
 * ----------------------------------------------
 * Firebase REST API 客戶端（Edge Runtime 相容）
 * 2026-02-21
 * lib/firebase-rest.ts
 * ----------------------------------------------
 *
 * 以 Web Crypto API（SubtleCrypto）簽署 Service Account JWT，
 * 取得 Google OAuth2 access token 後呼叫 Firestore / RTDB REST API。
 * 不依賴任何 Node.js 原生模組，可在 Cloudflare Workers Edge Runtime 執行。
 */

/** 模組層級 access token 快取（每個 Worker instance 內有效） */
let cachedToken: { value: string; expiresAt: number } | null = null

// ─── 內部工具函式 ───────────────────────────────────────────────────────────

/** 將 PEM 私鑰字串轉換為 ArrayBuffer（接受 PKCS#8 格式） */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/-----END (?:RSA )?PRIVATE KEY-----/g, '')
    .replace(/\s/g, '')
  const binary = atob(base64)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i)
  }
  return buffer.buffer
}

/** Base64URL 編碼（不含 padding） */
function base64url(data: ArrayBuffer | string): string {
  let bytes: Uint8Array
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data)
  } else {
    bytes = new Uint8Array(data)
  }
  let str = ''
  bytes.forEach((b) => (str += String.fromCharCode(b)))
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ─── Access Token ─────────────────────────────────────────────────────────

/**
 * 以 Service Account 私鑰產生 Google OAuth2 access token。
 * token 快取於模組層級，提前 30 秒判定過期以避免邊界情況。
 */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  if (cachedToken && cachedToken.expiresAt > now + 30) {
    return cachedToken.value
  }

  const privateKeyPem =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? ''
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? ''

  // 匯入 PKCS#8 私鑰
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  // 建立 JWT header + payload
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      scope: [
        'https://www.googleapis.com/auth/datastore',
        'https://www.googleapis.com/auth/firebase.database',
      ].join(' '),
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  )

  const signingInput = `${header}.${payload}`
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  )

  const jwt = `${signingInput}.${base64url(signature)}`

  // 交換 access token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    throw new Error(`取得 access token 失敗：${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { value: data.access_token, expiresAt: now + data.expires_in }
  return cachedToken.value
}

// ─── Firestore REST ────────────────────────────────────────────────────────

/** 將 JS 值轉換為 Firestore REST API Value 格式 */
function toFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value }
  }
  if (typeof value === 'string') return { stringValue: value }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } }
  }
  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([k, v]) => [
            k,
            toFirestoreValue(v),
          ]),
        ),
      },
    }
  }
  return { stringValue: String(value) }
}

/** 將 JS 物件頂層 key 轉換為 Firestore fields map */
function toFirestoreFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, toFirestoreValue(v)]),
  )
}

/**
 * Firestore REST：新增文件（自動產生 ID）
 * @param collection 集合路徑，例如 "photos"
 * @param data       要寫入的資料物件
 */
export async function addDoc(
  collection: string,
  data: Record<string, unknown>,
): Promise<void> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()
  const fields = toFirestoreFields(data)

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    },
  )

  if (!res.ok) {
    throw new Error(`Firestore addDoc 失敗：${res.status} ${await res.text()}`)
  }
}

/**
 * Firestore REST：建立或合併文件（PATCH with updateMask）
 * @param collection 集合路徑，例如 "devices"
 * @param docId      文件 ID
 * @param data       要寫入的資料物件
 * @param merge      true = 只更新指定欄位；false = 完整覆寫
 */
export async function setDoc(
  collection: string,
  docId: string,
  data: Record<string, unknown>,
  merge = true,
): Promise<void> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()
  const fields = toFirestoreFields(data)

  let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`
  if (merge) {
    const mask = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join('&')
    url = `${url}?${mask}`
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })

  if (!res.ok) {
    throw new Error(`Firestore setDoc 失敗：${res.status} ${await res.text()}`)
  }
}

/**
 * Firestore REST：讀取集合所有文件
 * @param collectionPath 集合路徑，例如 "devices"
 * @returns 文件資料陣列（已解析為 JS 物件）
 */
export async function listDocs<T = Record<string, unknown>>(
  collectionPath: string,
): Promise<T[]> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const token = await getAccessToken()

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!res.ok) {
    throw new Error(`Firestore listDocs 失敗：${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { documents?: { fields: Record<string, unknown> }[] }
  if (!data.documents) return []

  return data.documents.map((doc) => parseFirestoreFields(doc.fields) as T)
}

/** 將 Firestore fields map 還原為 JS 物件 */
function parseFirestoreFields(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, parseFirestoreValue(v as Record<string, unknown>)]),
  )
}

/** 將 Firestore Value 格式還原為 JS 值 */
function parseFirestoreValue(value: Record<string, unknown>): unknown {
  if ('nullValue' in value) return null
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('stringValue' in value) return value.stringValue
  if ('timestampValue' in value) return new Date(value.timestampValue as string).getTime()
  if ('arrayValue' in value) {
    const arr = value.arrayValue as { values?: Record<string, unknown>[] }
    return (arr.values ?? []).map(parseFirestoreValue)
  }
  if ('mapValue' in value) {
    const map = value.mapValue as { fields?: Record<string, unknown> }
    return parseFirestoreFields((map.fields ?? {}) as Record<string, unknown>)
  }
  return null
}

// ─── RTDB REST ─────────────────────────────────────────────────────────────

/**
 * RTDB REST：寫入節點（PUT 完整覆寫）
 * @param path  節點路徑，例如 "trigger/last_shot"
 * @param value 要寫入的值
 */
export async function rtdbSet(path: string, value: unknown): Promise<void> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.replace(/\/$/, '')

  // trigger/last_shot 為公開寫入節點（RTDB 規則 .write: true），不需要 access token
  // 安全性由 /api/trigger 的 x-trigger-secret 驗證保障
  const res = await fetch(`${dbUrl}/${path}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })

  if (!res.ok) {
    throw new Error(`RTDB rtdbSet 失敗：${res.status} ${await res.text()}`)
  }
}
