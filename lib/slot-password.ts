/*
 * ----------------------------------------------
 * 個人時段相簿帳密工具
 * 2026-03-15
 * lib/slot-password.ts
 * ----------------------------------------------
 */

/**
 * 以 HMAC-SHA256 派生 8 碼數字密碼
 * 公式：HMAC(SLOT_PASSWORD_SECRET, slotGroup) → 前 10 hex → BigInt % 100_000_000 → 8 碼零填補
 */
export async function derivePassword(slotGroup: string): Promise<string> {
  const secret = process.env.SLOT_PASSWORD_SECRET ?? ''
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(slotGroup))
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  // 取前 8 hex（32-bit uint，最大 4,294,967,295）對 100,000,000 取模，精度安全
  const num = parseInt(hex.slice(0, 8), 16) % 100000000
  return String(num).padStart(8, '0')
}

/**
 * 列舉指定日期範圍（含首尾）所有 slotGroup（MMDDHHSS）
 * 每日 24h × 4 = 96 筆
 */
export function generateAllSlotGroups(startDate: string, endDate: string): string[] {
  const groups: string[] = []
  const start = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T00:00:00Z')

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    for (let hh = 0; hh < 24; hh++) {
      const hhStr = String(hh).padStart(2, '0')
      for (let ss = 1; ss <= 4; ss++) {
        groups.push(`${mm}${dd}${hhStr}0${ss}`)
      }
    }
  }
  return groups
}

/**
 * 將 slotGroup（MMDDHHSS）轉為可讀時段說明
 * 例：03150103 → "03/15 01:30–01:44"
 */
export function formatSlotGroupLabel(sg: string): string {
  const mm = sg.slice(0, 2)
  const dd = sg.slice(2, 4)
  const hh = parseInt(sg.slice(4, 6), 10)
  const ss = parseInt(sg.slice(6, 8), 10)
  const startMin = (ss - 1) * 15
  const endMin = startMin + 14
  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return `${mm}/${dd} ${fmt(hh, startMin)}–${fmt(hh, endMin)}`
}

/**
 * 計算 album_session cookie 的驗簽 token（前 16 hex）
 */
export async function signSlotGroup(slotGroup: string): Promise<string> {
  const secret = process.env.SLOT_PASSWORD_SECRET ?? ''
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret + ':session'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(slotGroup))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

/**
 * 驗證 album_session cookie 值，回傳 slotGroup 或 null
 * cookie 格式：{slotGroup}:{signature}
 */
export async function verifyAlbumSession(cookieValue: string): Promise<string | null> {
  const parts = cookieValue.split(':')
  if (parts.length !== 2) return null
  const [slotGroup, sig] = parts
  if (!/^\d{8}$/.test(slotGroup)) return null
  const expected = await signSlotGroup(slotGroup)
  if (sig !== expected) return null
  return slotGroup
}
