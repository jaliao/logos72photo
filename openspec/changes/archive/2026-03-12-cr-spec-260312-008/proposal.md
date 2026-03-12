---
title: 幻燈片轉場動畫與點擊背景關閉
type: enhancement
capabilities:
  - photo-lightbox
---

## Why

幻燈片切換照片時為瞬間跳變，缺乏視覺流暢感；且目前只能透過按鈕或 Escape 鍵關閉，不符合直覺操作習慣。

## What Changes

1. **左右滑動轉場動畫**：切換上一張 / 下一張照片時，前景照片以 CSS `translateX` 動畫從左 / 右滑入，搭配前張照片同方向滑出，產生自然的橫向換頁感。
2. **點擊背景關閉幻燈片**：點擊前景照片容器以外的模糊背景區域，關閉幻燈片（等同點擊「← 返回」按鈕效果）。

## Capabilities

- **photo-lightbox**：新增轉場動畫行為與點擊背景關閉行為

## Impact

- 修改 `app/components/PhotoSlideshow.tsx`
- 新增 CSS transition（translateX）於前景照片容器
- 背景 overlay 加上 `onClick` 關閉，前景容器加上 `onClick` stopPropagation 防止誤觸
