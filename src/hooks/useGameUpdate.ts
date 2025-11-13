import { useEffect, useState } from "react";
import { FantasyGame, FantasyDraftPick, TotalPointsWFinish, SimulationRun } from "../types/types";

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
        
        console.log(`Setting up EventSource for gameId: ${gameId}`);
        
        const events = new EventSource(`${SERVICE_URL}/fantasy/getGameLive/${gameId}`);
        
        events.onopen = () => {
            console.log(`Connected to game updates for gameId: ${gameId}`);
            setGameState(prev => ({ ...prev, connected: true }));
        };
        
        events.onmessage = (event) => {
            console.log("Received SSE event:", event);
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'gameUpdate') {
                    const { game, draftPicks, runs, totalPointsWFinish } = data.data;
                    console.log('runs', runs);
                    console.log('totalPointsWFinish', totalPointsWFinish);
                    setGameState(prev => ({ ...prev, game: game, draftPicks, runs, totalPointsWFinish, loading: false }));
                } else if (data.type === 'error') {
                    setGameState(prev => ({ ...prev, error: data.message, loading: false }));
                }
            } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError);
                setGameState(prev => ({ ...prev, error: 'Failed to parse server data', loading: false }));
            }
        };
        
        events.onerror = (error) => {
            console.error(`SSE connection error for gameId ${gameId}:`, error);
            setGameState(prev => ({ ...prev, error: 'Connection failed', loading: false, connected: false }));
        };
        
        return () => {
            console.log(`Cleaning up EventSource for gameId: ${gameId}`);
            events.close();
            setGameState(prev => ({ ...prev, connected: false }));
        };
    }, [gameId]);
    
    return { gameState };
}