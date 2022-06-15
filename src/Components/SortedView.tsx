import * as React from "react";

import { Tournament, Run } from "../types/types"; 

interface ScorecardProp {
    tournament: Tournament;
    runs: Run[]; 
}


export default function Scorecard(props:ScorecardProp) {
    console.log('sort view called')
    const tournament = props.tournament;
    const runs = props.runs; 

    let runsLU:{ [key:string]: Run } = {};
    let totalPointsLU: { [key:string]: number } = {}; 
    runs.forEach(el => {
        let key = el.team + " - " + el.contest; 
        runsLU[key] = el; 
    })
    tournament.contests.forEach((contest, contestIndex) => {
        console.log('totalPointsLU running')
        Object.values(tournament.runningOrder).forEach(team => {
            let key = team + " - " + contest; 
            if(contestIndex == 0) {
                totalPointsLU[key] = runsLU[key]?.points ? runsLU[key]?.points : 0;  
            } else {
                let lastContestKey = team + " - " + tournament.contests[contestIndex-1]; 
                totalPointsLU[key] = runsLU[key]?.points ? runsLU[key]?.points : 0;
                totalPointsLU[key] += totalPointsLU[lastContestKey]; 
            }
            
        })
    })

    let headers = tournament && runs ? generateHeaders(tournament) : <></>;
    let tableRows = tournament && runs ? generateRows(tournament, runsLU, totalPointsLU) : <></>;

    return (
        <div className="">
            <p>sorted view</p>
        </div>
    )
}

function generateHeaders(tournament:Tournament){
}

function generateRows(tournament:Tournament, runsLU:{ [key:string]: Run }, totalPointsLU: { [key:string]: number }){
}

