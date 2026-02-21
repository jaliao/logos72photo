#!/bin/bash
# 本機模擬 Cron：每 5 分鐘自動觸發拍照
# 使用方式：./scripts/cron-local.sh
# 停止：Ctrl+C

INTERVAL=300  # 秒（5 分鐘）
SCRIPT_DIR="$(dirname "$0")"

echo "本機 Cron 啟動（每 ${INTERVAL} 秒觸發一次）"
echo "停止請按 Ctrl+C"
echo "────────────────────────────────"

while true; do
  echo -n "[$(date '+%H:%M:%S')] 觸發拍照... "
  "$SCRIPT_DIR/trigger.sh" 2>&1 | grep -o '"ok":[^,}]*\|"error":[^,}]*' || echo "（無回應）"
  echo "下次觸發：$(date -d "+${INTERVAL} seconds" '+%H:%M:%S' 2>/dev/null || date -v+${INTERVAL}S '+%H:%M:%S')"
  sleep "$INTERVAL"
done
