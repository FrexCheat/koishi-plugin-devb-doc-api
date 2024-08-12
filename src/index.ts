import { Context, Schema } from 'koishi'
import { Events } from './service/events'
import { InnerEvents } from './service/events_in'
import { InnerEvent } from './types'

export const name = 'devb-doc-api'

export const inject = ['http']

export interface Config {
  baseURL: string,
  checker: string,
}

export const Config: Schema<Config> = Schema.object({
  baseURL: Schema.string().required().description('API请求地址'),
  checker: Schema.string().description('审核者账号')
})

export function apply(ctx: Context, config: Config) {
  let events = new Events(ctx, config)
  let inner = new InnerEvents(ctx, config)

  ctx.command('devb-e [plat:text]', '查询校外比赛信息').action(async (_, plat) => {
    let res = await events.getEvents(plat)
    return res
  })

  ctx.command('devb-ine', '查询校内比赛信息').action(async () => {
    let res = await inner.getEvents(true)
    return res
  })

  ctx.command('devb-unine', '查询未审核比赛信息').action(async () => {
    let res = await inner.getEvents(false)
    return res
  })

  ctx.command('devb-upine', '上传校内比赛信息')
    .option('name', '-n <比赛名称>')
    .option('summary', '-s [比赛简介]', { fallback: '暂无' })
    .option('notes', '-e [比赛说明]', { fallback: '暂无' })
    .option('time', '-t [比赛时间]', { fallback: '暂无' })
    .action(async ({ options }) => {
      let data: InnerEvent = {
        uid: null,
        name: options.name,
        summary: options.summary,
        notes: options.notes,
        startAt: options.time,
        release: false
      }
      let res = await inner.uploadEvent(data)
      return res
    })

  ctx.command('devb-deine', '删除比赛信息')
    .option('uid', '-u <比赛UID>')
    .action(async ({ options }) => {
      let res = await inner.deleteEvent(options.uid)
      return res
    })
}
