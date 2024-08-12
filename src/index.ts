import { Context, Schema } from 'koishi'
import { Events } from './service/events'

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

  ctx.command('devb-e [plat:text]').action(async (_, plat) => {
    let res = await events.getEvents(plat)
    return res
  })
}
