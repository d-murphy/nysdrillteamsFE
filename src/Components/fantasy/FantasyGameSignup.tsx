import React from 'react';
import { FantasyGame } from '../../types/types';
import { useAuth } from 'react-oidc-context';
import { Button, Placeholder } from 'react-bootstrap';
import { useMutation } from '@tanstack/react-query';
import { getAuthHeaders } from '../../utils/fantasy/getAuthHeaders';
import useTeamNames from '../../hooks/useTeamNames';

interface FantasyGameSignupProps {
    game: FantasyGame;
    loading: boolean;
    error: string | null;
}

declare var SERVICE_URL: string;

function FantasyGameSignup({ game: gameData, loading: liveUpdateLoading, error: liveUpdateError }: FantasyGameSignupProps) {

    const auth = useAuth(); 
    const username = auth.user?.profile.email; 
    const isMyGame = gameData?.users[0] === username; 
    const inGame = gameData?.users.includes(username); 
    const humanUsers = gameData?.users.filter(user => !user.startsWith('autodraft'));
    const autodraftUsers = gameData?.users.filter(user => user.startsWith('autodraft'));
    const hasRoom = autodraftUsers.length > 0; 
    const gameId = gameData?.gameId;
    const { data: teamNamesData, isLoading: isLoadingTeamNames, error: errorTeamNames } = useTeamNames(humanUsers);

    

    const joinDraftMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${SERVICE_URL}/fantasy/addUsers/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(auth)
                },        
                body: JSON.stringify({ users: [username] }),
            });
            if(!response.ok){
                throw new Error('Failed to join draft');
            }
            return response.json();
        },
        onSuccess: () => {
            console.log('joined draft');
        },
        onError: (error) => {
            console.log('join draft error', error);
        },
    });

    const startDraftMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${SERVICE_URL}/fantasy/updateGameState/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(auth)
                },
                body: JSON.stringify({ state: 'stage-draft', users: gameData?.users }),
            });
            if(!response.ok){
                throw new Error('Failed to start draft');
            }
            return response.json();
        },
        onSuccess: () => {
            console.log('started draft - success function');
        },
        onError: (error) => {
            console.log('start draft error', error);
        },
    });

    const spotsAvailableMsg = autodraftUsers.length > 0 ? `(${autodraftUsers.length} spot${autodraftUsers.length > 1 ? "s" : ""} available)` : "";

    return (
        <div className="p-5 bg-white rounded shadow-sm h-100">
            <div className="d-flex flex-column">
                <div className="d-flex flex-row align-items-start justify-content-between w-100">
                    <div className="d-flex flex-column flex-grow-1">
                        <div className="font-large">{gameData?.name}</div>
                        <div className="font-small text-secondary">Game Created - waiting for players {spotsAvailableMsg}</div>
                        <div className="mt-4">
                            Current Teams: 
                        </div>
                        <div className="">
                            {
                                isLoadingTeamNames ? 
                                    <Placeholder animation="glow" className="p-0 text-center">
                                        <Placeholder xs={10} className="rounded" size="lg" bg="secondary"/>
                                    </Placeholder> : 
                                    errorTeamNames ? <div>Error loading team names</div> :
                                    teamNamesData?.map(team => team.town + ' ' + team.name).sort().join(', ')
                            }
                        </div>
                        <div className="font-small text-secondary">
                            {humanUsers.length === 1 && hasRoom ? "Multiple players required for results to count towards user records." : ""}
                        </div>
                    </div>
                    <div>
                        {
                            !auth.isAuthenticated ? <></> :
                            isMyGame ? 
                                <Button className="pointer" onClick={() => {startDraftMutation.mutate()}}>Start Game</Button> : 
                            !inGame && hasRoom  && <Button className="pointer" disabled={!hasRoom} onClick={() => {joinDraftMutation.mutate()}}>Join Game</Button>
                        }
                    </div>
                </div>
                <div className="mt-5 w-100 text-center">
                    {liveUpdateLoading || joinDraftMutation.isPending || startDraftMutation.isPending ? (
                        <div>Loading...</div>
                    ) : liveUpdateError ? (
                        <div>Game Error: {liveUpdateError}</div>
                    ) : joinDraftMutation.isError || startDraftMutation.isError ? (
                        <div>Error: {joinDraftMutation.error?.message || startDraftMutation.error?.message}</div>
                    ) : (
                        isMyGame ? 
                            <div>You're the game owner.  When you're ready, click the button to start the game.</div> :
                            !inGame && hasRoom && !auth.isAuthenticated ? <div>You're not logged in.  Please login to join the game.</div> :
                            !inGame && hasRoom ? <div>You're not in the lineup.  Click the button to join the game.</div> :
                            !inGame && !hasRoom ? <div>Sorry, the game is full. Please start a new game.</div> :
                            !isMyGame && inGame ? <div>You're in the lineup!  The game owner will start the game when they're ready.</div> :
                            ""
                    )}
                </div>
            </div>
        </div>
    )
}

export default React.memo(FantasyGameSignup);