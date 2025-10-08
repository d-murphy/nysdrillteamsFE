import * as React from "react";
import { useAuth } from "react-oidc-context";
import useOpenGames from "../../hooks/useOpenGames";
import { FantasyGame } from "../../types/types";
import { useNavigate } from "react-router-dom";



export default function Welcome() {
    const auth = useAuth();
    const navigate = useNavigate();
    return (
        <div className="p-4 bg-white rounded shadow-sm d-flex flex-column align-items-center justify-content-center h-100">
            <CurrentOpenGames />
            <div className="w-100 mt-4">
                {!auth.isAuthenticated ? (
                    <div className="text-center">
                        <div className="font-large">Login to get started.</div>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="font-large">Welcome to Fantasy Drill Teams!</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CurrentOpenGames() {
    const auth = useAuth();
    const { data, isLoading, isError, error, refetch } = useOpenGames();
    var navigate = useNavigate();
    if(!auth.isAuthenticated) navigate = () => {};


    if(isError) throw error;

    return (
        <div className="w-100 mt-4">
            <div className='h6'>Current Open Games</div>
            {
                isLoading ? (                
                    <div className="overflow-scroll text-nowrap pb-3">
                        {[1, 2, 3].map((i) => (
                            <div 
                                key={i}  
                                className='d-inline-block m-1 p-3 bg-light rounded' 
                            >
                                <div className="placeholder-glow">
                                    <span className="placeholder col-8"></span>
                                </div>
                                <div className="placeholder-glow mt-1">
                                    <span className="placeholder col-6"></span>
                                </div>
                                <div className="placeholder-glow mt-1">
                                    <span className="placeholder col-10"></span>
                                </div>
                            </div>
                        ))}
                    </div>                
                ) : (
                    <div className="overflow-scroll text-nowrap pb-3 d-flex flex-row gap-2 pt-2">
                        {data.map((game: FantasyGame) => {

                            const draftTypeText = game.gameType === 'one-team' ? "1 team" : 
                                game.gameType === '8-team-no-repeat' ? "8 teams" : 
                                "8 teams - no repeats"; 

                            return (
                                <div 
                                    key={game._id}  
                                    className='d-flex flex-column p-3 bg-light rounded pointer fantasy-game-card-w text-wrap' 
                                    onClick={() => navigate(`/simulation/fantasy/game/${game.gameId}`)}
                                >
                                    <div className="font-large">{game.name}</div>
                                    <div className="flex-grow-1"/>
                                    <div className='grayText font-small'>Draft Type: {draftTypeText}</div>
                                    <div className='grayText font-small mt-1'>{game.users.length} spots, {game.users.filter(user => user.startsWith("autodraft")).length} available</div>
                                </div>
                            )
                        })}
                        <div key={"new-game"}
                            className='d-inline-block p-3 rounded pointer fantasy-game-card-w text-wrap fantasy-game-card' 
                            onClick={() => navigate("newgame")}
                        >
                            <div className="font-large">Start a New Game</div>
                        </div>
                    </div>
                )}
            </div>
        );
    }