import React from 'react'
import { useFantasyGame } from '../../hooks/useFantasyGame';
import FantasyGameSignup from '../../Components/fantasy/FantasyGameSignup';
import FantasyGameDraft from '../../Components/fantasy/FantasyGameDraft';


interface FantasyGameProps {
    gameId: string;
}

export default function FantasyGame({ gameId }: FantasyGameProps) {


    const { data, isLoading, isError, refetch } = useFantasyGame({ gameId });

    console.log("data: ", data); 

    const gameStatus = data?.status; 

    const content = 
        !gameStatus ? <div>Game not found</div> :
        gameStatus === 'stage' ? 
            <FantasyGameSignup gameId={gameId} game={data} refetchGame={refetch} /> : 
        gameStatus === 'draft' ? 
            <FantasyGameDraft gameId={gameId} game={data} refetchGame={refetch} /> :
            <div>Game in progress</div>;

    return (
        <div>
            <div>FantasyGame</div>
            <div>test</div>
            <div>{data?.gameId}</div>
            <div>{data?.simulationIndex}</div>
            <div>{data?.users.join(', ')}</div>
            {/* <div>{data?.users}</div> */}

            <div className="mt-3">
                {content}
            </div>
        </div>
    )
}