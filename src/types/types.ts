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
    notes?: string, 
    host?: string, 
    isParade?: boolean
    cancelled?: boolean
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
    afterMigrate?: true,
    totalPointsOverride?: number
}

export type Track = {
    _id: string,
    id: number, 
    name: string, 
    address: string, 
    city: string, 
    notes: string,
    archHeightFt: number, 
    archHeightInches: number, 
    distanceToHydrant: 200 | 225 | 999,
    afterMigrate?: boolean, 
    active?:boolean, 
    display?: boolean, 
    longitude: string,
    latitude: string
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

export type SimilarTeam = {
    _id: string, 
    team: string, 
    year: number, 
    otherTeam: string, 
    otherYear: number, 
    distance: number
}

export type FinishesReturn = {
    _id: string,
    id: number, 
    name: string, 
    year: number, 
    date: string, 
    track: string, 
    top5: {
        teamName: string,
        points: number,
        finishingPosition: string
    }, 
    host: string
}

export type TeamTournHistory = {
    name: string, 
    id: number, 
    date: Date, 
    track: string, 
    runningOrderPos?: number, 
    finishingPosition?: string, 
    points?: number
    stateRecordCount?: number, 
    runCount?: number
    videoCount?: number
}

export type ImageDbEntry = {
    fileName: string, 
    url: string, 
    thumbnailUrl: string,
    track?: string, 
    sortOrder?: number, 
    imageName: string, 
    imageCaption: string
}

export type Projection = {
    _id: string, 
    team: string, 
    year: number, 
    "Three Man Ladder Wins": number,
    "Three Man Ladder Top5": number,
    "B Ladder Wins": number,
    "B Ladder Top5": number,
    "C Ladder Wins": number,
    "C Ladder Top5": number,
    "C Hose Wins": number,
    "C Hose Top5": number,
    "B Hose Wins": number,
    "B Hose Top5": number,
    "Efficiency Wins": number,
    "Efficiency Top5": number,
    "Motor Pump Wins": number,
    "Motor Pump Top5": number,
    "Buckets Wins": number,
    "Buckets Top5": number,
    "Overall Wins": number,
    "Overall Top5": number
}



export type FantasyGame = {
    _id: string,
    gameId: string, 
    status: 'stage' | 'draft' | 'complete' | 'stage-draft', 
    gameType: 'one-team' | '8-team' | '8-team-no-repeat'
    countAgainstRecord: boolean, 
    users: string[], 
    simulationIndex: number[], 
    secondsPerPick: number, 
    name: string
}

export type FantasyDraftPick = {
    _id: string,
    gameId: string, 
    user: string, 
    contestSummaryKey: string,
    draftPick: number, 
}

export type FantasyGameHistory = {
    _id: string,
    gameId: string, 
    user: string, 
    teamName: string, 
    contestSummaryKeys: string[]
    gameType: 'one-team' | '8-team' | '8-team-no-repeat'
    win: boolean, 
    top5: boolean, 
    finish: number, 
    participantCount: number, 
}