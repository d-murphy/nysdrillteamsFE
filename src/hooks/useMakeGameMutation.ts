import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";

declare var SERVICE_URL: string;

interface CreateGameParams {
    user: string;
    gameType: 'one-team' | '8-team' | '8-team-no-repeat';
    countAgainstRecord: boolean;
    secondsPerPick: number;
    tournamentSize: 10 | 30 | 50;
    isSeason: boolean;
}

export function useMakeGameMutation(
    onSuccess?: (result: Response) => void,
    onError?: (error: Error) => void
) {
    const auth = useAuth();
    
    return useMutation({
        mutationFn: async (params: CreateGameParams) => {
            const accessToken = auth.user?.access_token;
            const idToken = auth.user?.id_token;

            const body = {
                user: params.user,
                gameType: params.gameType,
                countAgainstRecord: params.countAgainstRecord,
                secondsPerPick: params.secondsPerPick,
                tournamentSize: params.tournamentSize,
                isSeason: params.isSeason
            };

            console.log(body);

            const response = await fetch(`${SERVICE_URL}/fantasy/createGame`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Id-Token': idToken
                },
                body: JSON.stringify(body),
            });
            if(!response.ok){
                throw new Error("Error creating game");
            }
            return response;
        },
        onSuccess: onSuccess, 
        onError: onError, 
    });
}