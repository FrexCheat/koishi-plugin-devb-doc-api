export const supportPlat = ['cf', 'nc']

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