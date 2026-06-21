import { useMutation } from "@tanstack/react-query";

declare var SERVICE_URL: string;

interface InsertFortyForFortyParams {
    contestSummaryKeys: string[];
    user?: string;
    gameMode?: 'classic' | 'lifer';
}

export function useInsertFortyForForty(
    onSuccess?: (gameId: string) => void,
    onError?: (error: Error) => void
) {
    return useMutation({
        mutationFn: async (params: InsertFortyForFortyParams) => {
            const response = await fetch(`${SERVICE_URL}/fortyForForty/insert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            if (!response.ok) {
                throw new Error('Failed to create game');
            }
            const data = await response.json();
            return data.gameId as string;
        },
        onSuccess,
        onError,
    });
}
