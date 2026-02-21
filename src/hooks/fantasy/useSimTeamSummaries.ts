import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

export interface SimTeamSummary {
    _id: string, 
    team: string, 
    year: number, 
    contest: string, 
    ct: number, 
    goodCt: number, 
    goodAvg: number, 
    goodSd: number, 
    consistency: number, 
    speedRating: number, 
    overallScore: number, 
    goodRunTimes: string[], 
    key: string, 
}

interface UseSimTeamSummariesReturn {
    data: SimTeamSummary[], 
    isLoading: boolean, 
    isError: boolean, 
    error: Error | null, 
    refetch: () => void, 
}

export function useSimTeamSummaries(
    contests: string, years: string, teams: string, 
    limit: number, offset: number, sortBy: 'consistency' | 'speedRating' | 'overallScore',
    teamContestKeyArrToExclude?: string[],
    teamYearContestKeyArrToExclude?: string[],
    isMyPick?: boolean,
): UseSimTeamSummariesReturn {
    const {
        data = [], 
        isLoading, 
        isError, 
        error, 
        refetch, 
    } = useQuery({
        queryKey: ['simTeamSummaries', contests, years, teams, sortBy, limit, offset, teamContestKeyArrToExclude, teamYearContestKeyArrToExclude], 
        queryFn: async (): Promise<SimTeamSummary[]> => {
            let url = `${SERVICE_URL}/simContSum/getTopSimulationContestSummaries?`;
            if(contests) url += "contests=" + contests;
            if(years) url += "&years=" + years;
            if(teams) url += "&teams=" + teams;
            if(limit) url += "&limit=" + limit;
            if(offset) url += "&offset=" + offset;
            if(sortBy) url += "&sortBy=" + sortBy;
            if(teamContestKeyArrToExclude) url += "&teamContestKeyArrToExclude=" + teamContestKeyArrToExclude.join(',');
            if(teamYearContestKeyArrToExclude) url += "&teamYearContestKeyArrToExclude=" + teamYearContestKeyArrToExclude.join(',');
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch sim team summaries: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        },
        enabled: isMyPick !== undefined ? isMyPick : true,
        
    });
    return {
        data,
        isLoading,
        isError,
        error,
        refetch,
    }
}