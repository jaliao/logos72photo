/*
 * ----------------------------------------------
 * Cloudflare Worker：每 5 分鐘觸發拍照 API
 * 2026-02-21
 * workers/cron-trigger.ts
 * ----------------------------------------------
 *
 * 部署方式：
 *   1. wrangler deploy workers/cron-trigger.ts
 *
 * wrangler.toml 中需設定：
 *   [triggers]
 *   crons = ["*\/5 * * * *"]   # 每 5 分鐘
 */

export interface Env {
  TRIGGER_API_URL: string
  TRIGGER_API_SECRET: string
}

export default {
  /** Cron 觸發（每 5 分鐘） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async scheduled(_event: any, env: Env, _ctx: any): Promise<void> {
    const res = await fetch(env.TRIGGER_API_URL, {
      method: 'POST',
      headers: {
        'x-trigger-secret': env.TRIGGER_API_SECRET,
      },
    })

    if (!res.ok) {
      console.error(`觸發 API 失敗：${res.status} ${await res.text()}`)
    } else {
      console.log(`拍照觸發成功：${new Date().toISOString()}`)
    }
  },
}
