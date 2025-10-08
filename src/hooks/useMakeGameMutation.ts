import { useMutation } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { getAuthHeaders } from "../utils/getAuthHeaders";

declare var SERVICE_URL: string;

interface CreateGameParams {
    gameType: 'one-team' | '8-team' | '8-team-no-repeat';
    countAgainstRecord: boolean;
    secondsPerPick: number;
    tournamentSize: 10 | 30 | 50;
    isSeason: boolean;
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
                countAgainstRecord: params.countAgainstRecord,
                secondsPerPick: params.secondsPerPick,
                tournamentSize: params.tournamentSize,
                isSeason: params.isSeason,
                name: params.name
            };

            console.log(body);

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