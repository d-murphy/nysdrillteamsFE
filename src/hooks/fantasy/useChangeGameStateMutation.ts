import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";

declare var SERVICE_URL: string;    

export function useChangeGameStateMutation(gameId: string) {
    const auth = useAuth();
    
    return useMutation({
        mutationFn: async (newState: 'complete' | 'draft') => {
            const accessToken = auth.user?.access_token;
            const idToken = auth.user?.id_token;

            const response = await fetch(`${SERVICE_URL}/fantasy/updateGameState/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Id-Token': idToken
                },
                body: JSON.stringify({ state: newState }),
            });
            return response.json();
        },
        onSuccess: () => {
            console.log('game stage change');
        },
    });
}
