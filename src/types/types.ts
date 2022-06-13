export type Tournament = {
    id: number, 
    name: string, 
    year: number, 
    date: Date, 
    circuits: string[], 
    track: string,
    runningOrder?: { [teamName: string]: number },
    sanctioned: boolean, 
    top5?: [ {teamName: string, finishingPosition: string} ] 
    contests: string[],
    liveStreamPlanned?: boolean
    urls?: string[]
}

export type Run = {
    id?: number, 
    team: string, 
    contest: string,
    year?: number, 
    tournament?: string
    tournamentId: number,
    track: string, 
    time: string, 
    runningPosition?: number, 
    circuit?: string, 
    date: Date, 
    urls: string[], 
    sanctioned: boolean
    points?: number, 
    notes?: string,
    stateRecord?: boolean
}

