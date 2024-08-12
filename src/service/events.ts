import { supportPlat, Event } from '../types'
import { Context } from 'koishi'
import { Config } from '..'

export class Events {
    constructor(private ctx: Context, private config: Config) { }

    private getStatus(st: string): string {
        if (st === 'Public') {
            return '已发布'
        }
        else if (st === 'Register') {
            return '报名中'
        }
        else {
            return '进行中'
        }
    }
    async getEvents(platform: string) {
        if (supportPlat.includes(platform) || platform === undefined) {
            let param: string = platform === undefined ? 'all' : platform
            let temp = await this.ctx.http.get(this.config.baseURL + `/api/event/get?platform=${param}`)
            if ('status' in temp) {
                if (temp['status'] === 'error') {
                    return `获取失败! ${temp['message']}`
                }
            }
            let data: Event[] = temp
            let res: string = `共找到 ${data.length} 场校外比赛：\n`
            data.forEach((obj) => {
                res = res.concat('------------------\n')
                res = res.concat(`比赛名称：${obj.name}\n`)
                res = res.concat(`比赛平台：${obj.platform}\n`)
                res = res.concat(`比赛状态：${this.getStatus(obj.status)}\n`)
                res = res.concat(`比赛时间：${obj.startAt}\n`)
                res = res.concat(`比赛链接：${obj.link}\n`)
            })
            res = res.concat('------------------')
            return res
        }
        else {
            return '目前支持平台：\ncf(Codeforces)\nnc(NowCoder)'
        }
    }
}
