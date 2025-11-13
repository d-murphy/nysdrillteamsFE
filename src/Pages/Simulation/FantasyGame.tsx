import React, { useState } from 'react'
import FantasyGameSignup from '../../Components/fantasy/FantasyGameSignup';
import FantasyGameDraft from '../../Components/fantasy/FantasyGameDraft';
import { useGameUpdate } from '../../hooks/useGameUpdate';
import FantasyGameResult from '../../Components/fantasy/FantasyGameResult';
import FantasyGameAnimation from '../../Components/fantasy/FantasyGameAnimation';


interface FantasyGameProps {
    gameId: string;
}

function FantasyGame({ gameId }: FantasyGameProps) {
    const [animationComplete, setAnimationComplete] = useState(false); 
    console.log(`FantasyGame component rendered for gameId: ${gameId}`);

    const { gameState } = useGameUpdate(gameId);
    const { game, draftPicks, loading, error, connected, runs, totalPointsWFinish } = gameState;
    
    // Debug: Log what changed to cause re-render
    console.log('FantasyGame render state:', { 
        game,
        gameId, 
        gameStatus: game?.status, 
        loading, 
        error, 
        connected,
        draftPicksLength: draftPicks?.length 
    });

    const gameStatus = game?.status; 
    const gameCompletedDate = game?.completed ? new Date(game.completed) : null;
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const skipAnimation = gameStatus === 'complete' && gameCompletedDate && gameCompletedDate < tenMinutesAgo;

    const content = !connected ? 
     <div className="text-center mt-5">Disconnected, please refresh the page and try again.</div> :
     !gameStatus ? <div className="text-center mt-5">Game not found</div> :
     gameStatus === 'stage' ? <FantasyGameSignup game={game} loading={loading} error={error} /> :
     gameStatus === 'draft' || gameStatus === 'stage-draft' ? <FantasyGameDraft draftPicks={draftPicks} game={game} loading={loading} error={error} /> :
     gameStatus === 'complete' ? 
        !animationComplete && !skipAnimation ?
            <FantasyGameAnimation setAnimationComplete={setAnimationComplete} /> :  
            <FantasyGameResult game={game} draftPicks={draftPicks} animate={true} runs={runs} totalPointsWFinish={totalPointsWFinish} /> :
     <div>Please, refresh the page and try again.</div>;

    return (
        <div>
            {content}
        </div>
    )
}

export default React.memo(FantasyGame);