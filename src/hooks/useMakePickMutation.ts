import { useMutation } from "@tanstack/react-query";

declare var SERVICE_URL: string;

export function useMakePickMutation(username: string, gameId: string) {
    return useMutation({
        mutationFn: async ({ contestSummaryKey, draftPick }: { contestSummaryKey: string, draftPick: number }) => {
            const response = await fetch(`${SERVICE_URL}/fantasy/insertDraftPick`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },        
                body: JSON.stringify({ 
                    user: username,
                    gameId: gameId,
                    contestSummaryKey: contestSummaryKey,
                    draftPick: draftPick
                }),
            });
            return response.json();
        },
        onSuccess: () => {
            console.log('pick posted successfully');
        },
    });
}
