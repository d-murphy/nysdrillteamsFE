import useFantasySimulationRuns from "../../hooks/useFantasySimulationRuns";
import { FantasyGame, FantasyDraftPick, TotalPointsWFinish, SimulationRun } from "../../types/types";
import React from "react";
import FantasyScorecard from "./FantasyScorecard";

interface FantasyGameResultProps {
    game: FantasyGame;
    draftPicks: FantasyDraftPick[];
    runs: SimulationRun[];
    totalPointsWFinish: TotalPointsWFinish[];
    animate?: boolean; 
}

export default function FantasyGameResult({ game, draftPicks, animate = false, runs, totalPointsWFinish }: FantasyGameResultProps) {

    return (
        <div className="container bg-white rounded shadow-sm p-4">
            <h3 className="mb-4">Fantasy Game Results</h3>
            <FantasyScorecard 
                game={game} 
                draftPicks={draftPicks} 
                simulationRuns={runs} 
                animate={animate} 
                totalPointsWFinish={totalPointsWFinish} 
            />
        </div>
    );
}