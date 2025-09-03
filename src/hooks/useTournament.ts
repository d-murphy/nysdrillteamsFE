import { useQuery } from '@tanstack/react-query';
import { Tournament } from '../types/types';

declare var SERVICE_URL: string;

interface UseTournamentOptions {
  tournamentId: string;
  enabled?: boolean;
}

interface UseTournamentReturn {
  tournament: Tournament | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTournament({ tournamentId, enabled = true }: UseTournamentOptions): UseTournamentReturn {
  const {
    data: tournament,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async (): Promise<Tournament> => {
      const response = await fetch(`${SERVICE_URL}/tournaments/getTournament?tournamentId=${tournamentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tournament ${tournamentId}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Convert date string to Date object
      if (data.date) {
        data.date = new Date(data.date);
      }
      
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    tournament,
    isLoading,
    isError,
    error,
    refetch
  };
}

interface useTournamentByNameYearReturn {
  tournaments: Tournament[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTournamentByNameYear(name: string, year: string): useTournamentByNameYearReturn {
  const {
    data: tournaments,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['tournamentByNameYear', name, year],
    queryFn: async (): Promise<Tournament[]> => {
      const response = await fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?tournaments=${name}&years=${year}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tournament ${name} ${year}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    },
  });
  return {
    tournaments,
    isLoading,
    isError,
    error,
    refetch
  };
}
