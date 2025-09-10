import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

interface SimTeamSummary {
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
    goodRunTimes: string[], 
}

interface UseSimTeamSummariesReturn {
    simTeamSummaries: SimTeamSummary[], 
    isLoading: boolean, 
    isError: boolean, 
    error: Error | null, 
    refetch: () => void, 
}

export function useSimTeamSummaries(contests: string, years: string, teams: string, limit: number, offset: number, sortBy: 'consistency' | 'speedRating'): UseSimTeamSummariesReturn {
    const {
        data: simTeamSummaries = [], 
        isLoading, 
        isError, 
        error, 
        refetch, 
    } = useQuery({
        queryKey: ['simTeamSummaries', contests, years, teams, sortBy, limit, offset], 
        queryFn: async (): Promise<SimTeamSummary[]> => {
            let url = `${SERVICE_URL}/simContSum/getTopSimulationContestSummaries?`;
            if(contests) url += "contests=" + contests;
            if(years) url += "&years=" + years;
            if(teams) url += "&teams=" + teams;
            if(limit) url += "&limit=" + limit;
            if(offset) url += "&offset=" + offset;
            if(sortBy) url += "&sortBy=" + sortBy;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch sim team summaries: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        },
    });
    return {
        simTeamSummaries,
        isLoading,
        isError,
        error,
        refetch,
    }
}