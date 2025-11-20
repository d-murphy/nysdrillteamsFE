import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "../../utils/fantasy/getAuthHeaders";
import { useAuth } from "react-oidc-context";


interface TeamInfo {
    email: string;
    town: string;
    name: string;
    codeUsed?: boolean;
}

export default function useAssureTeamName(email: string) {
    const { data, isLoading, error, refetch } = useQuery<TeamInfo>({
        queryKey: ['teamName', email],
        queryFn: getTeamName(email),
        enabled: !!email
    });
    return { data, isLoading, error, refetch };
}

declare const SERVICE_URL: string;

function getTeamName(email: string) {
    const auth = useAuth();
    return async () => {

        const body = {
            email: email,
        };

        const response = await fetch(`${SERVICE_URL}/fantasyNames/getFantasyTeamNamePossiblyNew`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(auth)
            },
            body: JSON.stringify(body),
        });
        if(!response.ok){
            throw new Error("Error creating game");
        }
        return response.json();
    }


}