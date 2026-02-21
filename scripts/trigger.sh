#!/bin/bash
# 手動觸發拍照（測試用）

# 從 .env.local 讀取 secret
SECRET=$(grep TRIGGER_API_SECRET "$(dirname "$0")/../.env.local" | cut -d= -f2)
URL="${1:-https://logos72photo.pages.dev}/api/trigger"

if [ -z "$SECRET" ]; then
  echo "錯誤：找不到 TRIGGER_API_SECRET（請確認 .env.local 存在）"
  exit 1
fi

echo "觸發拍照：$URL"
curl -s -X POST "$URL" \
  -H "x-trigger-secret: $SECRET" | \
  python3 -m json.tool 2>/dev/null || cat
