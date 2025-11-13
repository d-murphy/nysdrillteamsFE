import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { getAuthHeaders } from "../utils/fantasy/getAuthHeaders";


declare var SERVICE_URL: string;

export function useMakePickMutation(username: string, gameId: string) {
    const auth = useAuth();
    return useMutation({
        mutationFn: async ({ contestSummaryKey, draftPick }: { contestSummaryKey: string, draftPick: number }) => {
            const response = await fetch(`${SERVICE_URL}/fantasy/insertDraftPick`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(auth)
                },        
                body: JSON.stringify({ 
                    user: username,
                    gameId: gameId,
                    contestSummaryKey: contestSummaryKey,
                    draftPick: draftPick
                }),
            });
            if(!response.ok){
                throw new Error('Failed to post pick');
            }
            return response.json();
        },
        onSuccess: () => {
            console.log('pick posted successfully');
        },
    });
}
