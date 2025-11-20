import { useQuery } from "@tanstack/react-query";

export default function useTeamNamesSuggestions(town: string) {
    const { data, isLoading, error, refetch } = useQuery<string[]>({
        queryKey: ['teamNameSuggestions', town],
        queryFn: () => getTeamNameSuggestions(town),
        enabled: town.length > 0,
    });
    return { data, isLoading, error, refetch };
}


declare const SERVICE_URL: string;

async function getTeamNameSuggestions(town: string) {

    const searchParams = new URLSearchParams(); 
    searchParams.set("town", town); 
    searchParams.set("limit", "4");
    const url = `${SERVICE_URL}/fantasyNames/getTeamNameSuggestions?${searchParams.toString()}`;

    const response = await fetch(url);
    return response.json()
}