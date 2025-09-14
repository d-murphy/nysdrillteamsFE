import { useEffect, useState } from "react";
import { FantasyGame } from "../types/types";


declare var SERVICE_URL: string;

export function useGameSignupUpdate(gameId: string) {
    const [game, setGame] = useState<FantasyGame | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!gameId) return;
        
        setLoading(true);
        setError(null);
        
        // EventSource automatically makes the initial request
        const events = new EventSource(`${SERVICE_URL}/fantasy/getGameLive/${gameId}`);
        
        events.onopen = () => {
            console.log('Connected to game updates');
        };
        
        events.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'gameUpdate') {
                setGame(data.data);
                setLoading(false);
            } else if (data.type === 'error') {
                setError(data.message);
                setLoading(false);
            }
        };
        
        events.onerror = (error) => {
            console.error('SSE connection error:', error);
            setError('Connection failed');
            setLoading(false);
        };
        
        return () => {
            events.close();
        };
    }, [gameId]);
    
    return { game, loading, error };
}