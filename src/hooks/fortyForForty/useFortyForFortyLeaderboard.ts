import { useQuery } from "@tanstack/react-query";
import { FortyForFortyGame } from "../../types/types";

declare var SERVICE_URL: string;

export type FortyForFortyLeaderboardKind =
    | 'recentNamedGames'
    | 'topGamesThisWeek'
    | 'topGamesAllTime';

export type FortyForFortyModeFilter = 'classic' | 'lifer' | 'both';

interface UseFortyForFortyLeaderboardOptions {
    kind: FortyForFortyLeaderboardKind;
    gameMode?: FortyForFortyModeFilter;
    limit?: number;
    offset?: number;
}

function buildUrl({
    kind,
    gameMode = 'both',
    limit = 10,
    offset = 0,
}: UseFortyForFortyLeaderboardOptions): string {
    const params = new URLSearchParams();
    if (gameMode !== 'both') {
        params.set('gameMode', gameMode);
    }
    if (limit !== 10) {
        params.set('limit', String(limit));
    }
    if (offset !== 0) {
        params.set('offset', String(offset));
    }
    const qs = params.toString();
    return `${SERVICE_URL}/fortyForForty/${kind}${qs ? `?${qs}` : ''}`;
}

export function useFortyForFortyLeaderboard(options: UseFortyForFortyLeaderboardOptions) {
    const { kind, gameMode = 'both', limit = 10, offset = 0 } = options;

    return useQuery({
        queryKey: ['fortyForFortyLeaderboard', kind, gameMode, limit, offset],
        queryFn: async (): Promise<FortyForFortyGame[]> => {
            const response = await fetch(buildUrl(options));
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            return response.json();
        },
    });
}

/** Extract created-at ms from gameId: game_${Date.now()}_... */
export function parseGameCreatedAt(gameId: string): Date | null {
    const match = /^game_(\d+)_/.exec(gameId);
    if (!match) return null;
    const ms = Number(match[1]);
    if (!Number.isFinite(ms)) return null;
    return new Date(ms);
}
