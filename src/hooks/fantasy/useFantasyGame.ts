import { useQuery } from "@tanstack/react-query";
import { FantasyGame } from "../../types/types";

declare var SERVICE_URL: string;

export function useFantasyGame({ gameId }: { gameId: string }) {
    return useQuery<FantasyGame>({
        queryKey: ['fantasyGame', gameId],
        queryFn: () => getFantasyGame(gameId),
    });
}

function getFantasyGame(gameId: string) {
    return fetch(`${SERVICE_URL}/fantasy/getGame/${gameId}`)
        .then(res => res.json())
        .then(data => data as FantasyGame);
}