import { useQuery } from "@tanstack/react-query";


export default function useTownNames(townSearch: string, limit?: number) {
    const reqLimit = limit || 10; 
    const { data, isLoading, error, refetch } = useQuery<string[]>({
        queryKey: ['townName', townSearch, reqLimit],
        queryFn: () => getTownNames(townSearch, reqLimit),
    });
    return { data, isLoading, error, refetch };
}


declare const SERVICE_URL: string;

async function getTownNames(townSearch: string, limit: number) {
    const searchParams = new URLSearchParams(); 
    searchParams.set("search", townSearch); 
    searchParams.set("limit", limit.toString()); 
    const url = `${SERVICE_URL}/fantasyNames/getFantasyTeamTowns?${searchParams.toString()}`;

    const response = await fetch(url);
    return response.json()
}

export function useRandomTownName() {
    const { data, isLoading, error, refetch } = useQuery<{town: string}>({
        queryKey: ['randomTownName'],
        queryFn: () => getRandomTownName(),
        gcTime: 0,
        staleTime: 0,
    });
    return { data, isLoading, error, refetch };
}

async function getRandomTownName() {
    const url = `${SERVICE_URL}/fantasyNames/getRandomFantasyTeamTown`;
    const response = await fetch(url);
    return response.json()
}