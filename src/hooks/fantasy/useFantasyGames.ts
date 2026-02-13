import { useQuery } from "@tanstack/react-query";

declare const SERVICE_URL: string;

export default function useFantasyGames(user: string | null, stateArr: string[] | null, created?: Date, noCache?: boolean) {
    if(!user) user = ''; 

    const dateStartOfHour = created ? new Date(created?.setHours(0, 0, 0, 0)) : null;

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['fantasyGames', user, stateArr],
        queryFn: () => getFantasyGames(user, stateArr, dateStartOfHour),
        staleTime: noCache ? 0 : 1000 * 60 * 60 * 24,
        gcTime: noCache ? 0 : 1000 * 60 * 60 * 24
    })
    return { data, isLoading, isError, error, refetch }
}


async function getFantasyGames(user: string, state: string[], created: Date | null) {
    const params = new URLSearchParams(); 
    if(user) params.set('user', user); 
    if(state) params.set('state', state.join(',')); 
    if(created) params.set('created', created.toISOString()); 

    const response = await fetch(`${SERVICE_URL}/fantasy/getGames?${params.toString()}`)
    return response.json()
}