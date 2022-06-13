import * as React from "react";

import { Tournament, Run } from "../types/types"; 

interface ScorecardProp {
    tournament: Tournament;
    runs: Run[]
}


export default function Scorecard(props:ScorecardProp) {
    const tournament = props.tournament;
    const runs = props.runs; 

    let headers = generateHeaders(tournament); 
    // let tableRows = generateRows(tournament);
    let tableRows = <td>test</td>

    return (
        <div className="scorecard-table-wrapper">
            <table className="my-4">
                <thead className="">
                    <tr>
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
        </div>
    )
}

function generateHeaders(tournament:Tournament){
    let buffer: JSX.Element[] = []

    tournament.contests.forEach((el, ind) => {
        if(ind==0){
            buffer.push(<th scope="col" className="scorecard-cell-md scorecard-lineup-header fixed-col">Team Lineup</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-lg scorecard-contest-header text-center">{el}</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-points-header text-center">Points</th>) 
        } else {
            buffer.push(<th scope="col" className="scorecard-cell-lg scorecard-contest-header text-center">{el}</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-points-header text-center">Points</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-totalpoints-header text-center">Total</th>) 
        }
    })
    return buffer; 
}

function generateRows(tournament:Tournament){
    let buffer: JSX.Element[] = []

    let maxPosition = Math.max(...Object.values(tournament.runningOrder)); 

    for(let i=0; i<=maxPosition; i++){

    }

    return buffer; 
}

