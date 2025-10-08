import React from "react";
import useFantasyMostGames from "../../hooks/useFantasyMostGames";


export default function Leaderboard() {

    const { mostGames, isLoading, isError, error, refetch } = useFantasyMostGames();

    return (
        <div className="p-5 bg-white rounded shadow-sm d-flex flex-column align-items-center justify-content-start leaderboard-bg">
            <div className="text-center font-large w-100"><b>Leaderboard</b></div>

            <div className="mt-3">

                {isLoading && <div className="spinner-border text-secondary" role="status"></div>}
                {isError && <div className="text-danger">Error loading leaderboard</div>}
                {error && <div className="text-danger">{error.message}</div>}
                {mostGames && mostGames.map((game) => (
                    <div   key={game.user}>{game.user} - {game.gameCount}</div>
                ))}
                {mostGames && mostGames.length === 0 && <div className="text-muted align-self-center text-center">No games played yet</div>}
            </div>

        </div>
    )
}