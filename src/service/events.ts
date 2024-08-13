import { supportPlat, Event } from '../types'
import { Context } from 'koishi'
import { Config } from '..'

export class Events {
    constructor(private ctx: Context, private config: Config) { }

    private generateSumStr(source: Event[]) {
        let res: string = `共找到 ${source.length} 场校外比赛：\n`
        source.forEach((obj) => {
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

    private generatePartStr(source: Event[]) {
        let res: string = `最近 1 场比赛：\n`
        res = res.concat('------------------\n')
        res = res.concat(`比赛名称：${source[0].name}\n`)
        res = res.concat(`比赛状态：${this.getStatus(source[0].status)}\n`)
        res = res.concat(`比赛时间：${source[0].startAt}\n`)
        res = res.concat(`比赛链接：${source[0].link}\n`)
        res = res.concat('------------------')
        return res
    }

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
    async getEvents(platform: string): Promise<{ sum: string; part: string }> {
        if (supportPlat.includes(platform) || platform === undefined) {
            let param: string = platform === undefined ? 'all' : platform
            let temp = await this.ctx.http.get(this.config.baseURL + `/api/event/get?platform=${param}`)
            if ('status' in temp) {
                if (temp['status'] === 'error') {
                    return { sum: `获取失败! ${temp['message']}`, part: null }
                }
            }
            let data: Event[] = temp
            return { sum: this.generateSumStr(data), part: this.generatePartStr(data) }
        }
        else {
            return { sum: '目前支持平台：\ncf(Codeforces)\nnc(NowCoder)', part: null }
        }
    }
}
