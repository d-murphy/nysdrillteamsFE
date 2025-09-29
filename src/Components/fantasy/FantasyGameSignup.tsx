import React, { useEffect, useState } from 'react';
import { FantasyGame, FantasyDraftPick } from '../../types/types';
import { useAuth } from 'react-oidc-context';
import Button from '../Button';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface FantasyGameSignupProps {
    game: FantasyGame;
    draftPicks: FantasyDraftPick[];
    loading: boolean;
    error: string | null;
}

declare var SERVICE_URL: string;

function FantasyGameSignup({ game: gameData, draftPicks, loading, error }: FantasyGameSignupProps) {

    const auth = useAuth(); 
    const username = auth.user?.profile.email; 
    const isMyGame = gameData?.users[0] === username; 
    const inGame = gameData?.users.includes(username); 
    const humanUsers = gameData?.users.filter(user => user !== 'autodraft');
    const gameId = gameData?.gameId;

    const joinDraftMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${SERVICE_URL}/fantasy/addUsers/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },        
                body: JSON.stringify({ users: [username] }),
            });
            return response.json();
        },
        onSuccess: () => {
            console.log('joined draft');
        },
    });

    const startDraftMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${SERVICE_URL}/fantasy/updateGameState/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state: 'stage-draft', users: gameData?.users }),
            });
            return response.json();
        },
        onSuccess: () => {
            console.log('started draft - success function');
        },
    });



    return (
        <div>
            <div>FantasyGameSignup</div>
            <div>{gameId}</div>

            {
                loading ? <div>Loading...</div> : 
                error ? <div>SignupError: {error}</div> : 
                <>
                <div>
                    Current Users: 
                    {humanUsers.map(el => el).join(', ')}
                </div>
                <div>
                    {!inGame && <Button text="Join Game" onClick={() => {joinDraftMutation.mutate()}} />}
                </div>
                <div>
                    {isMyGame && <Button text="Start Game" onClick={() => {startDraftMutation.mutate()}} />}
                    {humanUsers.length === 1 ? "Multiple players required for results to count towards user record." : ""}
                </div>
                </>
            }
        </div>
    )
}

export default React.memo(FantasyGameSignup);