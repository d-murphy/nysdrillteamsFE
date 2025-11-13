import { useQuery } from "@tanstack/react-query";

declare const SERVICE_URL: string;

export default function useFantasyGames(user: string | null, state: string | null) {
    if(!user) user = ''; 
    if(!state) state = ''; 

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['fantasyGames'],
        queryFn: () => getFantasyGames(user, state)
    })
    return { data, isLoading, isError, error, refetch }
}


async function getFantasyGames(user: string, state: string) {
    const params = new URLSearchParams(); 
    if(user) params.set('user', user); 
    if(state) params.set('state', state); 


    const response = await fetch(`${SERVICE_URL}/fantasy/getGames?${params.toString()}`)
    return response.json()
}