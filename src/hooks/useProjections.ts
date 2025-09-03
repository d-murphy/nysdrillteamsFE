import { useQuery } from '@tanstack/react-query';
import { Projection } from '../types/types';

declare var SERVICE_URL: string;

interface UseProjectionsOptions {
  year: string;
  enabled?: boolean;
}

interface UseProjectionsReturn {
  projections: Projection[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProjections({ year, enabled = true }: UseProjectionsOptions): UseProjectionsReturn {
  const {
    data: projections = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['projections', year],
    queryFn: async (): Promise<Projection[]> => {
      const response = await fetch(`${SERVICE_URL}/projections/getProjections?year=${year}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch projections for year ${year}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format received for projections`);
      }
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    projections,
    isLoading,
    isError,
    error,
    refetch
  };
}
