import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

export type FantasyWinPercentageRow = {
    _id: string;
    /** Win rate as 0–100 or 0–1 depending on API; see `getWinPercentageValue`. */
    winPercentage?: number;
    winPercent?: number;
};

export type UseFantasyHighestWinPercentagesOptions = {
    limit?: number;
    offset?: number;
    minGamesPlayed?: number;
};

export function getWinPercentageValue(row: FantasyWinPercentageRow): number | undefined {
    return row.winPercentage ?? row.winPercent;
}

export default function useFantasyHighestWinPercentages(
    options: UseFantasyHighestWinPercentagesOptions = {}
) {
    const limit = options.limit ?? 5;
    const offset = options.offset ?? 0;
    const minGamesPlayed = options.minGamesPlayed ?? 5;

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["fantasyHighestWinPercentages", limit, offset, minGamesPlayed],
        queryFn: async (): Promise<FantasyWinPercentageRow[]> => {
            const params = new URLSearchParams({
                limit: String(limit),
                offset: String(offset),
                minGamesPlayed: String(minGamesPlayed),
            });
            const response = await fetch(
                `${SERVICE_URL}/fantasy/getHighestWinPercentages?${params.toString()}`
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch highest win percentages: ${response.statusText}`);
            }
            return response.json();
        },
    });

    return {
        rows: data,
        isLoading,
        isError,
        error,
        refetch,
    };
}
