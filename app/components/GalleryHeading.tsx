/*
 * ----------------------------------------------
 * 相簿大標題元件（統一標題與次標題樣式）
 * 2026-03-17
 * app/components/GalleryHeading.tsx
 * ----------------------------------------------
 */

interface Props {
  /** 次標題內容 */
  subtitle: React.ReactNode
  /** h1 附加 className（如 mt-4） */
  headingClassName?: string
  /** 次標題附加 className（如 mb-8 font-bold） */
  subtitleClassName?: string
}

/**
 * 全站統一大標題：
 *   大標題  — rgb(219, 175, 141)
 *   次標題  — rgb(62, 208, 195)
 *
 * 修改顏色只需改這個元件。
 */
export default function GalleryHeading({
  subtitle,
  headingClassName = '',
  subtitleClassName = 'mb-6 text-sm',
}: Props) {
  return (
    <>
      <h1
        className={`mb-1 text-2xl font-bold text-[rgb(219,175,141)] ${headingClassName}`}
        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
      >
        2026 不間斷讀經接力
      </h1>
      <p className={`text-[rgb(62,208,195)] ${subtitleClassName}`}>{subtitle}</p>
    </>
  )
}
