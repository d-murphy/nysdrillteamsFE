import { useQuery } from "@tanstack/react-query";

type TeamName = {
    email: string, 
    town: string, 
    name: string
}

export default function useTeamNames(emails: string[]) {
    const { data, isLoading, error, refetch } = useQuery<TeamName[]>({
        queryKey: ['teamNames', emails],
        queryFn: () => getTeamNames(emails),
        enabled: emails.length > 0,
    });
    return { data, isLoading, error, refetch };
}


declare const SERVICE_URL: string;

async function getTeamNames(emails: string[]) {
    const body = {
        emails: emails,
    };

    const response = await fetch(`${SERVICE_URL}/fantasyNames/getFantasyTeamNames`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return response.json()
}