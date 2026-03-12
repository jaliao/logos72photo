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
          }}
        />
      </div>
    </>
  )
}
