import { useEffect, useState, useCallback } from "react";
import { FantasyGame, FantasyDraftPick, TotalPointsWFinish, SimulationRun } from "../../types/types";
import { useAuth } from "react-oidc-context";

declare var SERVICE_URL: string;

type GameState = {
    game: FantasyGame | null;
    draftPicks: FantasyDraftPick[] | null;
    runs: SimulationRun[] | null;
    totalPointsWFinish: TotalPointsWFinish[] | null;    
    connected: boolean;
    loading: boolean;
    error: string | null;
}

export function useGameUpdate(gameId: string) {
    const auth = useAuth();
    const username = auth.user?.profile.email;
    const [gameState, setGameState] = useState<GameState>(
        {
            game: null, 
            draftPicks: null, 
            runs: null,
            totalPointsWFinish: null,
            connected: false, 
            loading: true, 
            error: null
        }
    );
    
    useEffect(() => {
        if (!gameId) return;        
        const events = new EventSource(`${SERVICE_URL}/fantasy/getGameLive/${gameId}?user=${username}`);
        
        events.onopen = () => {
            setGameState(prev => ({ ...prev, connected: true }));
        };
        
        events.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'gameUpdate') {
                    const { game, draftPicks, runs, totalPointsWFinish } = data.data;
                    setGameState(prev => ({ ...prev, game, draftPicks, runs, totalPointsWFinish, loading: false }));
                } else if (data.type === 'error') {
                    setGameState(prev => ({ ...prev, error: data.message, loading: false }));
                }
            } catch (parseError) {
                setGameState(prev => ({ ...prev, error: 'Failed to parse server data', loading: false }));
            }
        };
        
        events.onerror = () => {
            setGameState(prev => ({ ...prev, error: 'Connection failed', loading: false, connected: false }));
        };
        
        return () => {
            events.close();
            setGameState(prev => ({ ...prev, connected: false }));
        };
    }, [gameId]);
    
    return { gameState };
}