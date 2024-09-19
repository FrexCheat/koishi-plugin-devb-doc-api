import { Context } from 'koishi'
import type { } from 'koishi-plugin-puppeteer'

export async function generateInfoImage(ctx: Context, content: string) {
  const htm = `
          <!DOCTYPE html>
          <html lang="zh">
            <head>
              <title>music</title>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                body {
                  margin: 0;
                  font-family: "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", SimSun, sans-serif;
                  font-size: 16px;
                  min-height: 100vh;
                }
                #content-list {
                  padding: 20px;
                  display: inline-block; /* 使div适应内容宽度 */
                  max-width: 100%; /* 防止内容溢出 */
                  white-space: nowrap; /* 防止歌曲名称换行 */
                  transform: scale(0.85);
                  white-space: pre-line;
                }
                s {
                    text-decoration-thickness: 1.5px;
                }
              </style>
            </head>
            <body>
              <div id="content-list">${content}</div>
            </body>
          </html>
        `
  const page = await ctx.puppeteer.page()
  await page.setContent(htm)
  const list = await page.$('#content-list')
  const screenshot = await list.screenshot({})
  page.close()
  return screenshot
}

export async function generateRankImage(ctx: Context, prefix: string) {
  const page = await ctx.puppeteer.page()
  if (prefix === undefined) {
    await page.goto(`http://acm.zzuli.edu.cn/ranklist.php`)
  }
  else {
    await page.goto(`http://acm.zzuli.edu.cn/ranklist.php?prefix=${prefix}&csrf=uaI7R81h8K4sii6le3BHeRDip9GqSTlw`)
  }
  const list = await page.$('table')
  const screenshot = await list.screenshot({})
  page.close()
  return screenshot
}

export async function generateDayRankImage(ctx: Context) {
  const page = await ctx.puppeteer.page()
  await page.goto(`http://acm.zzuli.edu.cn/ranklist.php?scope=d`)
  const list = await page.$('table')
  const screenshot = await list.screenshot({})
  page.close()
  return screenshot
}

export async function generateProblemImage(ctx: Context, id: number) {
  const page = await ctx.puppeteer.page()
  await page.goto(`http://acm.zzuli.edu.cn/problem.php?id=${id}`)
  const list = await page.$('div.panel.panel-default')
  const screenshot = await list.screenshot({})
  page.close()
  return screenshot
}
