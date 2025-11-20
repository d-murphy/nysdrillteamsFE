import { useQuery } from "@tanstack/react-query";



declare var SERVICE_URL: string;

export default function useOpenGames() {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['openGames'],
        queryFn: () => fetch(`${SERVICE_URL}/fantasy/getOpenFantasyGames?state=stage&limit=10&offset=0`).then(res => res.json()), 
        staleTime: 0,
        gcTime: 0,
        refetchInterval: 10000
    });

    return { data, isLoading, isError, error, refetch };
}