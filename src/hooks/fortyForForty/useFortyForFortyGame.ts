import { useQuery } from "@tanstack/react-query";
import { FortyForFortyGame } from "../../types/types";

declare var SERVICE_URL: string;

export function useFortyForFortyGame(gameId: string) {
    return useQuery({
        queryKey: ['fortyForFortyGame', gameId],
        queryFn: async (): Promise<FortyForFortyGame> => {
            const response = await fetch(`${SERVICE_URL}/fortyForForty/getGame/${gameId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch game');
            }
            return response.json();
        },
        enabled: !!gameId,
    });
}
