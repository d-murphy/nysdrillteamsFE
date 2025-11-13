import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { getAuthHeaders } from "../utils/fantasy/getAuthHeaders";

declare var SERVICE_URL: string;

interface EditTeamNameParams {
    town: string; 
    name: string; 
}

export function useEditTeamName(
    onSuccess?: (result: Response) => void,
    onError?: (error: Error) => void
) {
    const auth = useAuth();
    const email = auth.user?.profile.email; 

    if(!email){
        throw new Error("Email not found");
    }
    
    return useMutation({
        mutationFn: async (params: EditTeamNameParams) => {

            const body = {
                email, 
                town: params.town,
                name: params.name,
            };

            const response = await fetch(`${SERVICE_URL}/fantasyNames/upsertFantasyTeamName`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(auth)
                },
                body: JSON.stringify(body),
            });
            if(!response.ok){
                throw new Error("Error changing team name");
            }
            return response;
        },
        onSuccess: onSuccess, 
        onError: onError, 
    });
}