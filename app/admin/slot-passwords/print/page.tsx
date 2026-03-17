/*
 * ----------------------------------------------
 * 後台：時段帳密列印頁
 * 2026-03-16
 * app/admin/slot-passwords/print/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
import { generateAllSlotGroups, derivePassword, formatSlotGroupLabel } from '@/lib/slot-password'
import PrintButton from './PrintButton'

export const dynamic = 'force-dynamic'

export default async function SlotPasswordsPrintPage() {
  const allGroups = generateAllSlotGroups('2026-03-25', '2026-03-30')
  // 從 03/25 18:30（slotGroup 03251803）開始
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
        body { margin: 0; font-family: sans-serif; }

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

        .content {
          margin-top: 52px;
          padding: 20px 28px;
        }

        .page-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #18181b;
        }
        .page-sub {
          font-size: 11px;
          color: #71717a;
          margin-bottom: 16px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th {
          background: #f4f4f5;
          padding: 5px 8px;
          text-align: left;
          font-weight: 600;
          color: #52525b;
          border-bottom: 1px solid #e4e4e7;
        }
        td {
          padding: 4px 8px;
          border-bottom: 1px solid #f4f4f5;
          font-family: monospace;
          color: #18181b;
        }
        td:nth-child(2) { font-family: sans-serif; color: #52525b; }
        tr:nth-child(even) td { background: #fafafa; }

        @media print {
          .toolbar { display: none; }
          .content { margin-top: 0; padding: 8mm 12mm; }
          .page-title { font-size: 13pt; }
          .page-sub { font-size: 8pt; margin-bottom: 8pt; }
          table { font-size: 8pt; }
          th { padding: 3pt 5pt; }
          td { padding: 2.5pt 5pt; border-bottom: 0.3pt solid #ddd; }
          tr:nth-child(even) td { background: #f9f9f9; }
        }
      `}</style>

      {/* 列印工具列（列印時隱藏） */}
      <div className="toolbar">
        <div>
          <h1>時段相簿帳密清單</h1>
          <span>共 {groups.length} 組　2026/03/25 18:30–03/30</span>
        </div>
        <PrintButton />
      </div>

      <div className="content">
        <div className="page-title">2026 不間斷讀經接力　時段相簿帳密</div>
        <div className="page-sub">產生範圍：2026/03/25 18:30 – 2026/03/30 23:45　共 {groups.length} 組</div>

        <table>
          <thead>
            <tr>
              <th>時段</th>
              <th>帳號</th>
              <th>密碼</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((sg, i) => (
              <tr key={sg}>
                <td>{formatSlotGroupLabel(sg)}</td>
                <td>{sg}</td>
                <td>{passwords[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
