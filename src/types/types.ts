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
    urls?: []
}
