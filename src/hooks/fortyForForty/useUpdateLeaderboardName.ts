import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FortyForFortyGame } from "../../types/types";

declare var SERVICE_URL: string;

interface UpdateLeaderboardNameParams {
    gameId: string;
    leaderboardName: string;
}

export function useUpdateLeaderboardName() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ gameId, leaderboardName }: UpdateLeaderboardNameParams) => {
            const response = await fetch(
                `${SERVICE_URL}/fortyForForty/updateLeaderboardName/${gameId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leaderboardName }),
                }
            );
            if (!response.ok) {
                const message = (await response.text()).trim();
                throw new Error(message || 'Failed to update leaderboard name');
            }
            return response.json() as Promise<{ success: boolean }>;
        },
        onSuccess: (_data, { gameId, leaderboardName }) => {
            queryClient.setQueryData(
                ['fortyForFortyGame', gameId],
                (old: FortyForFortyGame | undefined) =>
                    old ? { ...old, leaderboardName } : old
            );
        },
    });
}
