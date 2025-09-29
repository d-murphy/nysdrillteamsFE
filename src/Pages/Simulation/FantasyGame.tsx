import React from 'react'
import FantasyGameSignup from '../../Components/fantasy/FantasyGameSignup';
import FantasyGameDraft from '../../Components/fantasy/FantasyGameDraft';
import { useGameUpdate } from '../../hooks/useGameUpdate';


interface FantasyGameProps {
    gameId: string;
}

function FantasyGame({ gameId }: FantasyGameProps) {
    console.log(`FantasyGame component rendered for gameId: ${gameId}`);

    const { gameState } = useGameUpdate(gameId);
    const { game, draftPicks, loading, error, connected } = gameState;
    
    // Debug: Log what changed to cause re-render
    console.log('FantasyGame render state:', { 
        gameId, 
        gameStatus: game?.status, 
        loading, 
        error, 
        connected,
        draftPicksLength: draftPicks?.length 
    });

    const gameStatus = game?.status; 

    // Memoize the content to prevent unnecessary re-renders
    const content = !connected ? 
     <div>Disconnected, please refresh the page and try again.</div> :
     !gameStatus ? <div>Game not found</div> :
     gameStatus === 'stage' ? <FantasyGameSignup game={game} draftPicks={draftPicks} loading={loading} error={error} /> :
     gameStatus === 'draft' || gameStatus === 'stage-draft' ? <FantasyGameDraft draftPicks={draftPicks} game={game} loading={loading} error={error} /> :
     <div>Game in progress</div>;

    return (
        <div>
            <div>FantasyGame</div>
            <div>{gameStatus}</div>

            <div className="mt-3">
                {content}
            </div>
        </div>
    )
}

export default React.memo(FantasyGame);