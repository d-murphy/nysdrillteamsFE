import React, { useEffect, useState } from 'react';
import { FantasyGame } from '../../types/types';
import { useGameSignupUpdate } from '../../hooks/useGameSignupUpdate';
import { useAuth } from 'react-oidc-context';
import Button from '../Button';
import { useMutation } from '@tanstack/react-query';

interface FantasyGameSignupProps {
    gameId: string;
    game: FantasyGame;
    refetchGame: () => void;
}

declare var SERVICE_URL: string;

export default function FantasyGameSignup({ gameId, game, refetchGame }: FantasyGameSignupProps) {

    const { game: gameData, loading, error } = useGameSignupUpdate(gameId);

    const auth = useAuth(); 
    const username = auth.user?.profile.email; 
    const isMyGame = gameData?.users[0] === username; 
    const inGame = gameData?.users.includes(username); 
    const humanUsers = gameData?.users.filter(user => user !== 'autodraft');
    if(gameData?.status === 'draft') refetchGame();

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
                body: JSON.stringify({ state: 'draft', users: gameData?.users }),
            });
            return response.json();
        },
        onSuccess: () => {
            console.log('started draft - success function');
            refetchGame();
        },
    });



    return (
        <div>
            <div>FantasyGameSignup</div>
            <div>{gameId}</div>

            {
                loading ? <div>Loading...</div> : 
                error ? <div>Error: {error}</div> : 
                <>
                <div>
                    Current Users: 
                    {humanUsers.map(el => el).join(', ')}
                </div>
                <div>
                    {!inGame && <Button text="Join Game" onClick={() => {joinDraftMutation.mutate()}} />}
                </div>
                <div>
                    {isMyGame && <Button text="Start Draft" onClick={() => {startDraftMutation.mutate()}} />}
                    {humanUsers.length === 1 ? "Multiple players required for results to count towards user record." : ""}
                </div>
                </>
            }
        </div>
    )
}