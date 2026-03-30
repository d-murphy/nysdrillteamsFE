import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { getAuthHeaders } from "../../utils/fantasy/getAuthHeaders";

declare var SERVICE_URL: string;

export interface EditTeamNameParams {
    town: string;
    name: string;
    /** Include only when changed from saved values (caller responsibility). */
    insideColor?: string;
    outsideColor?: string;
}

export function useEditTeamName(
    onSuccess?: (result: Response) => void,
    onError?: (error: Error) => void
) {
    const auth = useAuth();
    const email = auth.user?.profile.email; 

    
    return useMutation({
        mutationFn: async (params: EditTeamNameParams) => {
            if(!email){
                throw new Error("Email not found");
            }        
            const body: Record<string, string> = {
                email,
                town: params.town,
                name: params.name,
            };
            if (params.insideColor !== undefined) {
                body.insideColor = params.insideColor;
            }
            if (params.outsideColor !== undefined) {
                body.outsideColor = params.outsideColor;
            }

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