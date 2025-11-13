import React from "react";
import useFantasyMostGames from "../../hooks/useFantasyMostGames";
import useTeamNames from "../../hooks/useTeamNames";


export default function Leaderboard() {

    const { mostGames, isLoading, isError, error, refetch } = useFantasyMostGames();
    const emails = mostGames?.map((game) => game._id) || [];
    const { data: teamNamesData, isLoading: isLoadingTeamNames, error: errorTeamNames } = useTeamNames(emails);

    return (
        <div className="p-5 bg-white rounded shadow-sm d-flex flex-column align-items-center justify-content-start leaderboard-bg" key={"leaderboard"}>
            <div className="text-center font-large w-100"><b>Most Games Played</b></div>
            <div className="mt-3">
                {(isLoading || isLoadingTeamNames) && <div className="spinner-border text-secondary" role="status"></div>}
                {(isError || isLoadingTeamNames) && <div className="text-danger">Error loading leaderboard</div>}
                {(error || errorTeamNames) && <div className="text-danger">{error?.message || errorTeamNames?.message}</div>}
                {mostGames && teamNamesData && mostGames.map((game) => {
                    const teamName = teamNamesData.find((team) => team.email === game._id)
                    const teamNameStr = `${teamName?.town} ${teamName?.name}`; 
                    return (
                        <div key={game._id}>{teamNameStr} - {game.gameCount}</div>
                    )
                })}
                {mostGames && mostGames.length === 0 && <div className="text-muted align-self-center text-center">No games played yet</div>}
            </div>

        </div>
    )
}