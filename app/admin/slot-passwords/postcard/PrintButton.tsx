'use client'

export default function PrintButton() {
  return (
    <button
      className="print-btn"
      onClick={() => window.print()}
    >
      列印 / 儲存為 PDF
    </button>
  )
}
