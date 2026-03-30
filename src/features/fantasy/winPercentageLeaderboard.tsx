import React from "react";
import useFantasyHighestWinPercentages, { getWinPercentageValue } from "../../hooks/fantasy/useFantasyHighestWinPercentages";
import useTeamNames from "../../hooks/fantasy/useTeamNames";
import { FantasyPlayerKindIcon } from "./FantasyPlayerKindIcon";

/** Format API value whether it is stored as 0–1 or 0–100. */
function formatWinPercentage(value: number | undefined): string {
    if (value === undefined || Number.isNaN(value)) {
        return "—";
    }
    const n = Number(value);
    const pct = n <= 1 && n >= 0 ? n * 100 : n;
    const rounded = Math.round(pct * 10) / 10;
    return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}

export default function WinPercentageLeaderboard() {
    const { rows, isLoading, isError, error } = useFantasyHighestWinPercentages();
    const emails = rows?.map((r) => r._id) || [];
    const { data: teamNamesData, isLoading: isLoadingTeamNames, error: errorTeamNames } =
        useTeamNames(emails);


    return (
        <div
            className="p-4 d-flex flex-column align-items-center justify-content-start"
            key="win-percentage-leaderboard"
        >
            <div className="text-center fs-5 w-100">
                <b>Highest Win %</b>
            </div>
            <div className="text-muted text-center fs-6 w-100">Minimum 5 games played</div>
            <div className="mt-3 w-100">
                {(isLoading || isLoadingTeamNames) && (
                    <div className="spinner-border text-secondary" role="status" />
                )}
                {rows &&
                    teamNamesData &&
                    rows.map((row) => {
                        const teamName = teamNamesData.find((team) => team.email === row._id);
                        const teamNameStr = `${teamName?.town} ${teamName?.name}`;
                        const pct = getWinPercentageValue(row);
                        const isAuto = row._id.startsWith("autodraft");
                        return (
                            <div
                                key={row._id}
                                className="d-flex flex-row align-items-end justify-content-between w-100 gap-2 py-1"
                            >
                                <FantasyPlayerKindIcon
                                    isAutodraft={isAuto}
                                    className="text-secondary flex-shrink-0"
                                    userEmail={row._id}
                                    users={emails}
                                />
                                <div className="text-truncate">{teamNameStr}</div>
                                <div className="flex-grow-1" />
                                <div className="badge rounded-pill bg-secondary flex-shrink-0">
                                    {formatWinPercentage(pct)}
                                </div>
                            </div>
                        );
                    })}
                {rows && rows.length === 0 && (
                    <div className="text-muted align-self-center text-center">No qualifying games yet</div>
                )}
            </div>
        </div>
    );
}
