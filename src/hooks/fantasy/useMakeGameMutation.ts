import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { getAuthHeaders } from "../../utils/fantasy/getAuthHeaders";

declare var SERVICE_URL: string;

interface CreateGameParams {
    gameType: 'decade' | '8-team' | '8-team-no-repeat';
    secondsPerPick: number;
    tournamentSize: 10 | 30 | 50;
    name: string;
}

export function useMakeGameMutation(
    onSuccess?: (result: Response) => void,
    onError?: (error: Error) => void
) {
    const auth = useAuth();
    
    return useMutation({
        mutationFn: async (params: CreateGameParams) => {

            const body = {
                gameType: params.gameType,
                countAgainstRecord: true,
                secondsPerPick: params.secondsPerPick,
                tournamentSize: params.tournamentSize,
                isSeason: false,
                name: params.name
            };

            const response = await fetch(`${SERVICE_URL}/fantasy/createGame`, {
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
            return response;
        },
        onSuccess: onSuccess, 
        onError: onError, 
    });
}