import { useQuery } from '@tanstack/react-query';
import { Run } from '../types/types';

declare var SERVICE_URL: string;

interface UseTournamentRunsOptions {
  tournamentId: string;
  enabled?: boolean;
}

interface UseTournamentRunsReturn {
  runs: Run[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTournamentRuns({ tournamentId, enabled = true }: UseTournamentRunsOptions): UseTournamentRunsReturn {
  const {
    data: runs = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['tournamentRuns', tournamentId],
    queryFn: async (): Promise<Run[]> => {
      const response = await fetch(`${SERVICE_URL}/runs/getRunsFromTournament?tournamentId=${tournamentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch runs for tournament ${tournamentId}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format received for tournament runs`);
      }
      
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    runs,
    isLoading,
    isError,
    error,
    refetch
  };
}
