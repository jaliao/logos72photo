/*
 * ----------------------------------------------
 * 相簿首頁動態背景（白晝↔黑夜漸層動畫 + 固定背景圖）
 * app/components/GalleryBackground.tsx
 * ----------------------------------------------
 */

export default function GalleryBackground() {
  return (
    <>
      <style>{`
        /* 現在我們不改變顏色，而是改變背景的 X/Y 軸位置 */
        @keyframes dayNightCycle {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
      `}</style>

      {/* 固定全視窗容器 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
        }}
      >
        {/* 背景圖層 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(/bg/1.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* 漸層動畫覆蓋層 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.7,
            /* 1. 將白天、黃昏、黑夜的顏色排布在一條很長的漸層帶上 */
            background: 'linear-gradient(135deg, #fde68a, #7dd3fc, #fed7aa, #312e81, #0f172a, #020617)',
            /* 2. 把背景放大 4 倍，這樣畫面上一次只會顯示一部分的漸層 */
            backgroundSize: '400% 400%',
            /* 3. 加入 alternate 讓動畫 0% -> 100% -> 0% 來回播放（解決倒退播放需求） */
            animation: 'dayNightCycle 15s ease-in-out infinite alternate',
            /* 4. 加上 pointer-events-none 避免這層蓋住滑鼠點擊 */
            pointerEvents: 'none',
            /* 5. 可選：加上 mix-blend-mode 讓漸層和背景圖更自然地融合（視覺調整） */
            mixBlendMode: 'overlay',
            /* 6. 可選：加上 filter 調整整體亮度和對比度，讓動畫效果更明顯（視覺調整） */
            // filter: 'brightness(1.2) contrast(1.1)',
            /* 7. 可選：加上 transition 讓動畫開始/結束時更平滑（視覺調整） */
            transition: 'opacity 1s ease-in-out',
            /* 8. 可選：加上 will-change 提升動畫性能（性能優化） */
            willChange: 'background-position',
            /* 9. 可選：加上 mask-image 讓漸層在底部逐漸淡出，避免畫面下方過於突兀（視覺調整） */
            // -webkit-mask-image: 'linear-gradient(to bottom, black 85%, transparent 100%)',
            // mask-image: 'linear-gradient(to bottom, black 85%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
          }}
        />
      </div>
    </>
  )
}
