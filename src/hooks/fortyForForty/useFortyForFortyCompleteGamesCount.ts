import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

export function useFortyForFortyCompleteGamesCount() {
    return useQuery({
        queryKey: ['fortyForFortyCompleteGamesCount'],
        queryFn: async (): Promise<number> => {
            const response = await fetch(`${SERVICE_URL}/fortyForForty/countCompleteGames`);
            if (!response.ok) {
                throw new Error('Failed to fetch completed games count');
            }
            const data = await response.json() as { count: number };
            return data.count;
        },
    });
}

/** Floors a count to the nearest 100 for display (e.g. 4271 → 4200). */
export function floorToNearestHundred(count: number): number {
    return Math.floor(count / 100) * 100;
}
