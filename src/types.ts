export const supportPlat = ['cf', 'nc']

export interface Lab {
    uid: number
    name: string
    summary: string
    college: string
    position: string
    limit: string
    group: string
    time: string
    release: boolean
}

export interface Event {
    name: string
    platform: string
    link: string
    startAt: string
    status: string
}

export interface InnerEvent {
    uid: number
    name: string
    summary: string
    notes: string
    startAt: string
    release: boolean
}

export const innerCol = ['name', 'summary', 'notes', 'startAt', 'release']
export const labCol = ['name', 'summary', 'college', 'position', 'limit', 'group', 'time', 'release']
