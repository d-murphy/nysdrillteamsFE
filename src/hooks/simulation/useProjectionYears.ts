import { useQuery } from "@tanstack/react-query";


declare var SERVICE_URL: string;

export default function useProjectionYears () {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['projectionYears'],
        queryFn: async (): Promise<number[]> => {
            const response = await fetch(`${SERVICE_URL}/projections/getAvailableYears`);
            if (!response.ok) {
              throw new Error(`Failed to fetch projections years: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
          },
    });

    return { data, isLoading, isError, error };
}
