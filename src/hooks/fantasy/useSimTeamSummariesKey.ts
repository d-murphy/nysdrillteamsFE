import { useQuery } from "@tanstack/react-query";
import { SimTeamSummary } from "./useSimTeamSummaries";
declare var SERVICE_URL: string;

interface UseSimTeamSummariesKeyReturn {
    data: SimTeamSummary[], 
    isLoading: boolean, 
    isError: boolean, 
    error: Error | null, 
    refetch: () => void, 
}

export function useSimTeamSummariesKey(keys: string[]): UseSimTeamSummariesKeyReturn {
    const {
        data = [], 
        isLoading, 
        isError, 
        error, 
        refetch, 
    } = useQuery({
        queryKey: ['simTeamSummariesKeys', keys], 
        queryFn: async (): Promise<SimTeamSummary[]> => {
            let url = `${SERVICE_URL}/simContSum/getSimulationContestSummariesByKeys`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keys: keys }),
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch sim team summaries: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        },
    });
    return {
        data,
        isLoading,
        isError,
        error,
        refetch,
    }
}