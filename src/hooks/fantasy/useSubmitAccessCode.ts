import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { getAuthHeaders } from "../../utils/fantasy/getAuthHeaders";

declare var SERVICE_URL: string;

interface EditTeamNameParams {
    accessCode: string; 
}

export function useSubmitAccessCode(
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
        
            const body = {
                email, 
                accessCode: params.accessCode,
            };

            const response = await fetch(`${SERVICE_URL}/fantasyNames/setCodeUsed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(auth)
                },
                body: JSON.stringify(body),
            });
            if(!response.ok){
                const result = await response.json();
                throw new Error(result?.message || "Error submitting access code");
            }
            return response;
        },
        onSuccess: onSuccess, 
        onError: onError, 
    });
}