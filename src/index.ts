import { Context, Schema, h } from 'koishi'
import { Events } from './service/events'
import { InnerEvents } from './service/events_in'
import { Labs } from './service/labs'
import { InnerEvent, Lab } from './types'

export const name = 'devb-doc-api'

export const inject = ['http', 'database']

interface Group {
  platform: string,
  uid: string
}

export interface Config {
  baseURL: string,
  checker: string,
  groups: Group[]
}

export const Config: Schema<Config> = Schema.object({
  baseURL: Schema.string().required().description('API请求地址'),
  checker: Schema.string().description('接收审核信息的账号'),
  groups: Schema.array(Schema.object({
    platform: Schema.string().required(),
    uid: Schema.string().required()
  })).description('接收审核信息的群组').role('table')
})

export function apply(ctx: Context, config: Config) {
  let events = new Events(ctx, config)
  let inner = new InnerEvents(ctx, config)
  let labs = new Labs(ctx, config)

  ctx.command('devb-e [plat:text]', '查询校外比赛信息').action(async (_, plat) => {
    let res = await events.getEvents(plat)
    return res
  })

  ctx.command('devb-ine', '查询校内比赛信息').action(async () => {
    let res = await inner.getEvents(true)
    return res
  })

  ctx.command('devb-unine', '查询未审核的校内比赛信息').action(async () => {
    let res = await inner.getEvents(false)
    return res
  })

  ctx.command('devb-upine', '上传校内比赛信息')
    .option('name', '-n <比赛名称>')
    .option('summary', '-s [比赛简介]', { fallback: '暂无' })
    .option('notes', '-e [比赛说明]', { fallback: '暂无' })
    .option('time', '-t [比赛时间]', { fallback: '暂无' })
    .action(async ({ session, options }) => {
      let data: InnerEvent = {
        uid: null,
        name: options.name,
        summary: options.summary,
        notes: options.notes,
        startAt: options.time,
        release: false
      }
      let res = await inner.uploadEvent(data)
      session.send(h('message', h.quote(session.messageId), res))
    })

  ctx.command('devb-updine <uid:string> <column:string> <content:string>', '更新校内比赛信息')
    .action(async ({ session }, uid, column, content) => {
      if (uid === undefined || column === undefined || content === undefined) {
        session.send(h('message', h.quote(session.messageId), '参数不足，请补充参数!'))
      }
      let res = await inner.updateEvent(uid, column, content)
      session.send(h('message', h.quote(session.messageId), res))
    })

  ctx.command('devb-deine', '删除校内比赛信息')
    .option('uid', '-u <比赛UID>')
    .action(async ({ session, options }) => {
      let res = await inner.deleteEvent(options.uid)
      session.send(h('message', h.quote(session.messageId), res))
    })

  ctx.command('devb-lab', '查询校内实验室信息').action(async () => {
    let res = await labs.getLabs(true)
    return res
  })

  ctx.command('devb-unlab', '查询未审核实验室信息').action(async () => {
    let res = await labs.getLabs(false)
    return res
  })

  ctx.command('devb-uplab', '上传校内实验室信息')
    .option('name', '-n <实验室名称>')
    .option('summary', '-s [实验室简介]', { fallback: '暂无' })
    .option('college', '-c [实验室学院]', { fallback: '待上传' })
    .option('position', '-p [实验室位置]', { fallback: '待上传' })
    .option('limit', '-l [招新范围]', { fallback: '暂无' })
    .option('group', '-g [招新交流群]', { fallback: '暂无' })
    .option('time', '-t [招新时间]', { fallback: '暂无' })
    .action(async ({ session, options }) => {
      let data: Lab = {
        uid: null,
        name: options.name,
        summary: options.summary,
        college: options.college,
        position: options.position,
        limit: options.limit,
        group: options.group,
        time: options.time,
        release: false
      }
      let res = await labs.uploadLab(data)
      session.send(h('message', h.quote(session.messageId), res))
    })

  ctx.command('devb-updlab <uid:string> <column:string> <content:string>', '更新实验室信息')
    .action(async ({ session }, uid, column, content) => {
      if (uid === undefined || column === undefined || content === undefined) {
        session.send(h('message', h.quote(session.messageId), '参数不足，请补充参数!'))
      }
      let res = await labs.updateLab(uid, column, content)
      session.send(h('message', h.quote(session.messageId), res))
    })

  ctx.command('devb-delab', '删除实验室信息')
    .option('uid', '-u <实验室UID>')
    .action(async ({ session, options }) => {
      let res = await labs.deleteLab(options.uid)
      session.send(h('message', h.quote(session.messageId), res))
    })
}
