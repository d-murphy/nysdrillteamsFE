import * as React from "react";
import { useAuth } from "react-oidc-context";
import useOpenGames from "../../hooks/fantasy/useOpenGames";
import { FantasyGame } from "../../types/types";
import { useNavigate } from "react-router-dom";
import useFantasyGames from "../../hooks/fantasy/useFantasyGames";
import { faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



export default function Welcome() {
    return (
        <div className="p-4 bg-white rounded shadow-sm d-flex flex-column align-items-start justify-content-center h-100">
            <CurrentOpenGames />
            <ActiveGames />
            <RecentGames myGamesOnly={true} />
            <RecentGames myGamesOnly={false} />
        </div>
    );
}

interface RecentGamesProps {
    myGamesOnly?: boolean;
}
function RecentGames({ myGamesOnly }: RecentGamesProps) {
    const auth = useAuth();
    const username = auth.user?.profile.email;
    const { data, isLoading, isError, error, refetch } = useFantasyGames(myGamesOnly ? username : null, ['complete'], new Date(Date.now() - 1000 * 60 * 60 * 24 * 7));
    const navigate = useNavigate();
    if(isError) throw error;
    const title = myGamesOnly ? "My Recent Games" : "Recent Games - All Players";

    return (
        <div className="w-100 mt-4">
            <div className='h6'>{title}</div>
            {
                isLoading ? (
                    <div className="overflow-scroll text-nowrap pb-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='d-inline-block m-1 p-3 bg-light rounded draft-grid-cell'></div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-scroll text-nowrap pb-3 pointer">
                        {data
                        .filter((game: FantasyGame) => game?.name?.length > 0)
                        .map((game: FantasyGame) => (
                            <div 
                                key={game._id} 
                                className='d-inline-block m-1 p-3 bg-lightgray rounded'
                                onClick={() => navigate(`/simulation/fantasy/game/${game.gameId}`)}
                                >
                                    {game.name}
                            </div>
                        ))}
                    </div>
                )
            }
        </div>
    );
}

function ActiveGames() {
    const auth = useAuth();
    const username = auth.user?.profile.email;

    const { data, isLoading, isError, error, refetch } = useFantasyGames(username, ['stage', 'stage-draft', 'draft'], new Date(Date.now() - 1000 * 60 * 60 * 3), true);

    const navigate = useNavigate();
    if(isError) throw error;

    return (
        <div className="w-100 mt-4">
            <div className='h6'>Active Drafts</div>
            {
                isLoading ? (
                    <div className="overflow-scroll text-nowrap pb-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='d-inline-block m-1 p-3 bg-light rounded draft-grid-cell'></div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-scroll text-nowrap pb-3 pointer">
                        {
                        data.length > 0 ? data
                            .filter((game: FantasyGame) => game?.name?.length > 0)
                            .map((game: FantasyGame) => (
                                <div 
                                    key={game._id} 
                                    className='d-inline-block m-1 p-3 bg-lightgray rounded'
                                    onClick={() => navigate(`/simulation/fantasy/game/${game.gameId}`)}
                                    >
                                        {game.name}
                                </div>
                            )) : 
                            <div className="font-medium text-start grayText">No active drafts</div>
                        }
                    </div>
                )
            }
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
            <div className='h6'>Games Accepting Players</div>
            {
                isLoading ? (                
                    <div className="overflow-scroll text-nowrap pb-3">
                        {[1, 2, 3].map((i) => (
                            <div 
                                key={i}  
                                className='d-inline-block m-1 p-3 bg-light rounded draft-grid-cell' 
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

                        {
                            data?.length !== 0 ? <></> : 
                                !auth.isAuthenticated ? 
                                    <div className="font-large text-center grayText">No open games - login to start your own!</div> 
                                    : <></>
                        }
                        {
                            data?.map((game: FantasyGame) => <GameDisplay game={game} />)
                        }
                        { 
                            auth.isAuthenticated &&
                                <div key={"new-game"}
                                    className='d-flex flex-column align-items-center justify-content-center p-3 rounded pointer fantasy-game-card-w text-wrap fantasy-game-card font-large text-center' 
                                    onClick={() => navigate("newgame")}
                                >
                                    {
                                        data.length === 0 && <div className="my-1">No Open Games</div>
                                    }
                                    <div className="mb-2">Start a New Game</div>
                                    <FontAwesomeIcon icon={faPlusCircle} className="my-1" />
                                </div>
                        }
                    </div>
                )}
            </div>
        );
    }



    interface GameDisplayProps {
        game: FantasyGame;
    }

function GameDisplay({ game }: GameDisplayProps) {
    const navigate = useNavigate();
    const auth = useAuth();
    const clickHandler = () => {
        if(auth.isAuthenticated) {
            navigate(`/simulation/fantasy/game/${game.gameId}`);
        } else {
            auth.signinRedirect(); 
        }
    }
    return (
        <div 
            key={game._id}  
            className='d-flex flex-column p-3 bg-lightgray rounded pointer fantasy-game-card-w text-wrap' 
            onClick={clickHandler}
        >
            <div className="font-large">{game.name}</div>
            <div className="flex-grow-1"/>
            <div className='grayText font-small mt-1'>{game.users.length} spots, {game.users.filter(user => user.startsWith("autodraft")).length} available</div>
        </div>
    );
}