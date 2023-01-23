export type Tournament = {
    _id: string, 
    id: number, 
    name: string, 
    year: number, 
    date: Date, 
    startTime: Date, 
    nassauPoints: boolean, 
    suffolkPoints: boolean, 
    westernPoints: boolean, 
    northernPoints: boolean, 
    suffolkOfPoints: boolean, 
    nassauOfPoints: boolean, 
    liOfPoints: boolean, 
    juniorPoints: boolean,
    nassauSchedule: boolean, 
    suffolkSchedule: boolean, 
    westernSchedule: boolean, 
    northernSchedule: boolean, 
    liOfSchedule: boolean, 
    juniorSchedule: boolean,
    track: string,
    runningOrder?: { [runningPosition:number]: string },
    sanctioned: boolean, 
    cfp: boolean, 
    top5?: {teamName: string, finishingPosition: string, points: number}[] 
    contests: {name:string, cfp:boolean, sanction:boolean}[],
    liveStreamPlanned?: boolean
    urls?: string[], 
    waterTime?: string, 
    afterMigrate?: true, 
    urlToEntryForm?: string,
    notes?: string
}

export type Run = {
    _id?: string
    id?: number, 
    team: string, 
    hometown?: string, 
    nickname?: string, 
    contest: string,
    year: number, 
    tournament: string,
    tournamentId: string,
    track: string, 
    time: string, 
    timeNum: number,
    runningPosition?: number, 
    nassauPoints?: boolean, 
    suffolkPoints?: boolean, 
    westernPoints?: boolean, 
    northernPoints?: boolean, 
    suffolkOfPoints?: boolean, 
    nassauOfPoints?: boolean, 
    liOfPoints?: boolean, 
    juniorPoints?: boolean,
    date: Date, 
    urls: string[], 
    sanctioned?: boolean, 
    points?: number, 
    rank?: string, 
    notes?: string,
    stateRecord?: boolean,
    currentStateRecord?: boolean, 
    afterMigrate?: true
}

export type Track = {
    _id: string,
    id: number, 
    name: string, 
    address: string, 
    city: string, 
    notes: string,
    imageUrls: string[], 
    archHeightFt: number, 
    archHeightInches: number, 
    distanceToHydrant: 200 | 225 | 999,
    afterMigrate?: boolean, 
    active?:boolean, 
    display?: boolean
}


export type Team = {
    _id: string, 
    id?: number,
    fullName: string,  
    region: string,
    imageUrl?: string, 
    active?: boolean, 
    afterMigrate?: boolean, 
    display?: boolean
    hometown: string, 
    nickname: string, 
    circuit: string, 
    twitter?: string, 
    instagram?: string, 
    tiktok?: string
}

export type Update = {
    _id?: string,
    date: Date, 
    user: string, 
    update: string
}

export type User = {
    username: string, 
    role: string
}
