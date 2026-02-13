import { useQuery } from "@tanstack/react-query";

declare const SERVICE_URL: string;

interface IsTeamNameAvailableResponse {
    available: boolean;
}

export default function useIsTeamNameAvailable(town: string, name: string) {

    const { data, isLoading, error } = useQuery<IsTeamNameAvailableResponse>({
        queryKey: ['isTeamNameAvailable', town, name],
        queryFn: () => checkTeamNameAvailability(town, name),
        enabled: town.length > 0 && name.length > 0,
        gcTime: 0,
        staleTime: 0,
    });
    return { 
        isAvailable: data?.available ?? false, 
        isLoading, 
        error 
    };
}

async function checkTeamNameAvailability(town: string, name: string): Promise<IsTeamNameAvailableResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("town", town);
    searchParams.set("name", name);
    const url = `${SERVICE_URL}/fantasyNames/isFantasyTeamNameAvailable?${searchParams.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Error checking team name availability");
    }
    return response.json();
}
