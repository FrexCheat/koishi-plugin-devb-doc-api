import { Lab, labCol } from '../types'
import { Context } from 'koishi'
import { Config } from '..'

export class Labs {
    constructor(private ctx: Context, private config: Config) { }

    async getLabs(release: boolean) {
        let apiURL = release ? '/api/lab/get?release=true' : '/api/lab/get?release=false'
        let temp = await this.ctx.http.get(this.config.baseURL + apiURL)
        if (temp !== null) {
            if ('status' in temp) {
                if (temp['status'] === 'error') {
                    return `获取失败! ${temp['message']}`
                }
            }
            let data: Lab[] = temp
            let res: string = `共找到 ${data.length} 个校内实验室：\n`
            data.forEach((obj) => {
                res = res.concat('------------------\n')
                res = res.concat(`实验室UID：${obj.uid}\n`)
                res = res.concat(`实验室名称：${obj.name}\n`)
                res = res.concat(`实验室简介：${obj.summary}\n`)
            })
            res = res.concat('------------------\n')
            res = res.concat('信息详情: https://newbie.frexlink.cn/main.html')
            return res
        }
        else {
            return '暂无实验室信息。'
        }
    }

    async uploadLab(data: Lab) {
        if (data.name === undefined || data.name.length < 5) {
            return '实验室名称格式错误或不存在!'
        }
        let resp = await this.ctx.http.post(this.config.baseURL + `/api/lab/create`, data)
        if ('status' in resp) {
            if (resp['status'] === 'error') {
                return `上传失败! ${resp['message']}`
            }
        }
        let msg: string = `有新校内实验室信息待审核：\n`
        msg = msg.concat('------------------\n')
        msg = msg.concat(`实验室名称：${data.name}\n`)
        msg = msg.concat(`实验室简介：${data.summary}\n`)
        msg = msg.concat(`实验室学院：${data.college}\n`)
        msg = msg.concat(`实验室位置：${data.position}\n`)
        msg = msg.concat(`招新范围：${data.limit}\n`)
        msg = msg.concat(`招新交流群：${data.group}\n`)
        msg = msg.concat(`招新时间：${data.time}\n`)
        msg = msg.concat('------------------\n')
        msg = msg.concat('使用 devb-unlab 命令查看未审核的校内比赛列表。')
        this.config.groups.forEach(obj => {
            this.ctx.broadcast([`${obj.platform}:${obj.uid}`], msg)
        })
        return '上传成功! 请等待管理员审核。'
    }

    async updateLab(uid: string, column: string, cont: any) {
        if (uid === undefined) {
            return '实验室UID不能为空!'
        }
        let data = { content: cont }
        if (labCol.includes(column)) {
            if (column === 'release') {
                if (cont != 'true' && cont != 'false') {
                    return '字段值错误! 请输入 true 或 false'
                }
                else {
                    cont === 'true' ? data = { content: true } : data = { content: false }
                }
            }
            let resp = await this.ctx.http.post(this.config.baseURL + `/api/lab/update?uid=${uid}&column=${column}`, data)
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

    async deleteLab(uid: string) {
        if (uid === undefined) {
            return '实验室UID不能为空!'
        }
        let resp = await this.ctx.http.post(this.config.baseURL + `/api/lab/delete?uid=${uid}`)
        if ('status' in resp) {
            if (resp['status'] === 'error') {
                return `删除失败! ${resp['message']}`
            }
        }
        return '删除成功!'
    }
}