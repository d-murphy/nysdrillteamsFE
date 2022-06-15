import * as React from "react";

import { Tournament, Run } from "../types/types"; 

interface ScorecardProp {
    tournament: Tournament;
    runs: Run[]; 
}


export default function Scorecard(props:ScorecardProp) {
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
    console.log('genHeaders running'); 
    let buffer: JSX.Element[] = []

    // turn runs into map with contest - team
    // loop through contests and teams and call array into right spots.  

    tournament.contests.forEach((el, ind) => {
        if(ind==0){
            buffer.push(<th scope="col" className="scorecard-cell-md scorecard-lineup-header fixed-col p-1">Team Lineup</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-lg scorecard-contest-header text-center p-1">{el}</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-points-header text-center p-1">Points</th>) 
        } else {
            buffer.push(<th scope="col" className="scorecard-cell-lg scorecard-contest-header text-center p-1">{el}</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-points-header text-center p-1">Points</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-totalpoints-header text-center p-1">Total</th>) 
        }
    })
    return buffer; 
}

function generateRows(tournament:Tournament, runsLU:{ [key:string]: Run }, totalPointsLU: { [key:string]: number }){
    let buffer: JSX.Element[] = []

    const positions = Object.keys(tournament.runningOrder).map(el => parseInt(el));
    let maxPos = Math.max(...positions)

    for(let i=1; i<=maxPos; i++){
        let rowBuffer: JSX.Element[] = []; 
        tournament.contests.forEach((el, ind) => {
            let key = tournament.runningOrder[i] + " - " + el; 
            if(ind==0){
                rowBuffer.push(<th scope="col" className="scorecard-cell-md scorecard-lineup-cell fixed-col p-1">{tournament.runningOrder[i] ? `${i}. ${tournament.runningOrder[i]}` : `${i}.`}</th>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-lg scorecard-contest-cell text-center p-1">{runsLU[key] ? runsLU[key].time : "" }</td>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-points-cell text-center p-1">{runsLU[key]?.points ? runsLU[key].points : ""}</td>) 
            } else {
                rowBuffer.push(<td scope="col" className="scorecard-cell-lg scorecard-contest-cell text-center p-1">{runsLU[key] ? runsLU[key].time : "" }</td>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-points-cell text-center p-1">{runsLU[key]?.points ? runsLU[key].points : ""}</td>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-totalpoints-cell text-center p-1">{totalPointsLU[key]}</td>) 
            }    
        })
        buffer.push(<tr>{...rowBuffer}</tr>)
    }


    return buffer; 
}

