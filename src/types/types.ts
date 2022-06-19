export type Tournament = {
    id: number, 
    name: string, 
    year: number, 
    date: Date, 
    circuits: string[], 
    track: string,
    runningOrder?: { [runningPosition:number]: string },
    sanctioned: boolean, 
    top5?: {teamName: string, finishingPosition: string, points: number}[] 
    contests: string[],
    liveStreamPlanned?: boolean
    urls?: string[], 
    waterTime?: string
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
    stateRecord?: boolean,
    currentStateRecord?: boolean,
    finish?:string
}

export type Track = {
    id: number, 
    name: string, 
    address: string, 
    city: string, 
    notes: string,
    imageUrls: string[], 
    archHeight: string | null,
    distanceToHydrant: number | null
}
