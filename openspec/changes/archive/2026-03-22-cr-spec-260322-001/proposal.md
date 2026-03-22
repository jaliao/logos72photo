## Why

個人相簿展開模式的授權說明文字過於簡短且語氣生硬，不符合活動的溫馨氛圍，需要更新為更完整、更友善的版本，以清楚告知家人照片用途並引導自主刪除。

## What Changes

- 更新 `AlbumPhotoViewer` expand 模式的授權說明文字，替換為以下內容：
  > 各位家人平安！
  > 本相簿記錄了活動的精彩點滴，照片將用於後續回顧與宣傳。
  > 若您不希望個人影像被公開使用，歡迎您直接點選該照片並執行「刪除」。再次感謝家人們的參與與配合。
- 在 grid 模式（相簿首頁、照片列表上方）同步顯示相同的授權說明橫幅，讓家人在瀏覽縮圖前即可看到說明

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `album-photo-viewer`：授權說明文字從單行簡述更新為完整多段文字；新增 grid 模式頂部橫幅

## Impact

- `app/components/AlbumPhotoViewer.tsx`：expand 模式通知文字 + grid 模式頂部橫幅
- 無 API、資料庫異動
