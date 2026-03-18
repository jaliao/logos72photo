/*
 * ----------------------------------------------
 * 後台：密碼明信片列印頁
 * 2026-03-19
 * app/admin/slot-passwords/postcard/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
import { generateAllSlotGroups, derivePassword } from '@/lib/slot-password'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

/** slotGroup → "3/25/2026" */
function getPostcardDate(sg: string): string {
  const mm = parseInt(sg.slice(0, 2), 10)
  const dd = parseInt(sg.slice(2, 4), 10)
  return `${mm}/${dd}/2026`
}

/** slotGroup → "18:30" */
function getPostcardTime(sg: string): string {
  const hh = sg.slice(4, 6)
  const ss = parseInt(sg.slice(6, 8), 10)
  const min = String((ss - 1) * 15).padStart(2, '0')
  return `${hh}:${min}`
}

export default async function SlotPasswordsPostcardPage() {
  const allGroups = generateAllSlotGroups('2026-03-25', '2026-03-28')
  // 從 03/25 18:30（slotGroup 03251803）至 03/28 23:59
  const groups = allGroups.filter((sg) => sg >= '03251803')

  // 批次派生所有密碼
  const BATCH = 96
  const passwords: string[] = []
  for (let i = 0; i < groups.length; i += BATCH) {
    const batch = await Promise.all(groups.slice(i, i + BATCH).map(derivePassword))
    passwords.push(...batch)
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: sans-serif; background: #e4e4e7; }

        /* ── 工具列 ── */
        .toolbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          background: #18181b;
          color: #fff;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          gap: 12px;
        }
        .toolbar h1 { font-size: 14px; font-weight: 600; margin: 0; }
        .toolbar span { font-size: 12px; color: #a1a1aa; }
        .print-btn {
          background: #fff;
          color: #18181b;
          border: none;
          border-radius: 6px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .print-btn:hover { background: #e4e4e7; }

        /* ── 卡片清單 ── */
        .cards {
          margin-top: 52px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        /* ── 單張明信片 ── */
        /* Grid 疊層：img 自然撐開容器高度，overlay 疊在同一格，螢幕與列印 Y 一致 */
        .postcard-wrapper {
          display: grid;
          width: 100%;
          max-width: 800px;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }
        .postcard-wrapper > * { grid-area: 1 / 1; }
        .postcard-wrapper img {
          display: block;
          width: 100%;
          height: auto;
        }

        /* ── 疊印文字 ── */
        /* 座標系：原圖 1748×1240 px，以百分比換算支援響應式縮放 */
        .overlay {
          position: relative;
          pointer-events: none;
          container-type: inline-size;
        }
        .field {
          position: absolute;
          font-family: 'Geist Mono', monospace;
          font-size: larger;
          color: #1a1a1a;
          white-space: nowrap;
          line-height: 1;
        }

        /* Date:  x=220 → 12.59%  y=27.50% */
        .field-date    { top: 27.50%; left: 12.59%; }
        .field-time    { top: 36.00%; left: 12.59%; }
        .field-account { top: 48.00%; left: 20%; letter-spacing: 0.02em; }

        /* ── 列印媒體查詢 ── */
        @page { size: 1748px 1240px; margin: 0; }
        @media print {
          body { background: #fff; }
          .toolbar { display: none; }
          .field { font-size: 38px; }
          .cards {
            margin-top: 0;
            padding: 0;
            gap: 0;
            display: block;
          }
          .postcard-wrapper {
            width: 1748px;
            max-width: none;
            border-radius: 0;
            box-shadow: none;
            break-after: page;
          }
          .postcard-wrapper:last-child {
            break-after: avoid;
          }
        }
      `}</style>

      {/* 工具列（列印時隱藏） */}
      <div className="toolbar">
        <div>
          <h1>密碼明信片列印</h1>
          <span>共 {groups.length} 張　2026/03/25 18:30–03/28 23:59</span>
        </div>
        <PrintButton />
      </div>

      <div className="cards">
        {groups.map((sg, i) => (
          <div key={sg} className="postcard-wrapper">
            {/* 底圖 */}
            <img src="/postcard/2.png" alt="" />

            {/* 疊印文字 */}
            <div className="overlay">
              <span className="field field-date">{getPostcardDate(sg)}</span>
              <span className="field field-time">{getPostcardTime(sg)}</span>
              <span className="field field-account">{sg}/{passwords[i]}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
