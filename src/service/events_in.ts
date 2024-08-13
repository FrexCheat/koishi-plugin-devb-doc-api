import { InnerEvent, innerCol } from '../types'
import { Context } from 'koishi'
import { Config } from '..'

export class InnerEvents {
    constructor(private ctx: Context, private config: Config) { }

    private generateSumStr(source: InnerEvent[]) {
        let res: string = `共找到 ${source.length} 场校内比赛：\n`
        source.forEach((obj) => {
            res = res.concat('------------------\n')
            res = res.concat(`比赛UID：${obj.uid}\n`)
            res = res.concat(`比赛名称：${obj.name}\n`)
            res = res.concat(`比赛简介：${obj.summary}\n`)
            res = res.concat(`比赛时间：${obj.startAt}\n`)
        })
        res = res.concat('------------------')
        return res
    }

    async getEvents(release: boolean) {
        let apiURL = release ? '/api/event/inner/get?release=true' : '/api/event/inner/get?release=false'
        let temp = await this.ctx.http.get(this.config.baseURL + apiURL)
        if (temp !== null) {
            if ('status' in temp) {
                if (temp['status'] === 'error') {
                    return `获取失败! ${temp['message']}`
                }
            }
            let data: InnerEvent[] = temp
            return this.generateSumStr(data)
        }
        else {
            return '暂无校内比赛信息。'
        }
    }

    async uploadEvent(data: InnerEvent) {
        if (data.name === undefined || data.name.length < 5) {
            return '比赛名称格式错误或不存在!'
        }
        let resp = await this.ctx.http.post(this.config.baseURL + `/api/event/inner/create`, data)
        if ('status' in resp) {
            if (resp['status'] === 'error') {
                return `上传失败! ${resp['message']}`
            }
        }
        let msg: string = `有新校内比赛待审核：\n`
        msg = msg.concat('------------------\n')
        msg = msg.concat(`比赛名称：${data.name}\n`)
        msg = msg.concat(`比赛简介：${data.summary}\n`)
        msg = msg.concat(`比赛说明：${data.notes}\n`)
        msg = msg.concat(`比赛时间：${data.startAt}\n`)
        msg = msg.concat('------------------\n')
        msg = msg.concat('使用 devb-unine 命令查看未审核的校内比赛列表。')
        this.config.groups.forEach(obj => {
            this.ctx.broadcast([`${obj.platform}:${obj.uid}`], msg)
        })
        return '上传成功! 请等待管理员审核。'
    }

    async updateEvent(uid: string, column: string, cont: any) {
        if (uid === undefined) {
            return '比赛UID不能为空!'
        }
        let data = { content: cont }
        if (innerCol.includes(column)) {
            if (column === 'release') {
                if (cont != 'true' && cont != 'false') {
                    return '字段值错误! 请输入 true 或 false'
                }
                else {
                    cont === 'true' ? data = { content: true } : data = { content: false }
                }
            }
            let resp = await this.ctx.http.post(this.config.baseURL + `/api/event/inner/update?uid=${uid}&column=${column}`, data)
            if ('status' in resp) {
                if (resp['status'] === 'error') {
                    return `修改失败! ${resp['message']}`
                }
            }
            return '修改成功, 详情见: https://newbie.frexlink.cn/main.html'
        }
        else {
            return '字段名不存在，请重试。'
        }
    }

    async deleteEvent(uid: string) {
        if (uid === undefined) {
            return '比赛UID不能为空!'
        }
        let resp = await this.ctx.http.post(this.config.baseURL + `/api/event/inner/delete?uid=${uid}`)
        if ('status' in resp) {
            if (resp['status'] === 'error') {
                return `删除失败! ${resp['message']}`
            }
        }
        return '删除成功!'
    }
}
