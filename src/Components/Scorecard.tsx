import * as React from "react";

import { Tournament, Run } from "../types/types"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'


interface ScorecardProp {
    tournament: Tournament;
    runs: Run[]; 
}


export default function Scorecard(props:ScorecardProp) {
    const tournament = props.tournament;
    const runs = props.runs; 

    let runsLU:{ [key:string]: Run } = {};
    let totalPointsLU: { [key:string]: number } = {}; 
    let teamsSetFromRuns:Set<string> = new Set(); 
    runs.forEach(el => {
        let key = el.team + " - " + el.contest; 
        runsLU[key] = el; 
        teamsSetFromRuns.add(el.team); 
    })

    let teamArr:string[] = Object.values(tournament.runningOrder).length ? 
        Object.values(tournament.runningOrder) : 
        Array.from(teamsSetFromRuns).sort((a,b) => a < b ? -1 : 1); 
    let usingAlphaOrder = Object.values(tournament.runningOrder).length == 0 && runs.length; 
    
    tournament.contests.forEach((contest, contestIndex) => {
        teamArr.forEach(team => {
            let key = team + " - " + contest.name; 
            if(contestIndex == 0) {
                totalPointsLU[key] = runsLU[key]?.points ? runsLU[key]?.points : 0;  
            } else {
                let lastContestKey = team + " - " + tournament.contests[contestIndex-1].name; 
                totalPointsLU[key] = runsLU[key]?.points ? runsLU[key]?.points : 0;
                totalPointsLU[key] += totalPointsLU[lastContestKey]; 
            }            
        })
    })

    let headers = tournament && runs ? generateHeaders(tournament) : <></>;
    let tableRows = tournament && runs && !usingAlphaOrder ? generateRows(tournament, runsLU, totalPointsLU) : 
        tournament && runs && usingAlphaOrder ? generateAlphaRows(teamArr, tournament, runsLU, totalPointsLU) : <></>;

    return (
        <>
            {usingAlphaOrder ? <div className="pt-4 ps-4 text-center "><i>Running Order is not available for this drill.  Displaying teams alphabetically.</i></div> : <></>}
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
        </>
    )
}

function generateHeaders(tournament:Tournament){
    let buffer: JSX.Element[] = []

    // turn runs into map with contest - team
    // loop through contests and teams and call array into right spots.  

    tournament.contests.forEach((el, ind) => {
        if(ind==0){
            buffer.push(<th scope="col" className="scorecard-cell-md scorecard-lineup-header fixed-col p-2">Team Lineup</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-lg scorecard-contest-header text-center p-2">{el.name}</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-points-header text-center p-2">Points</th>) 
        } else {
            buffer.push(<th scope="col" className="scorecard-cell-lg scorecard-contest-header text-center p-2">{el.name}</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-points-header text-center p-2">Points</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm scorecard-totalpoints-header text-center p-2">Total</th>) 
        }
    })
    return buffer; 
}

function generateRows(tournament:Tournament, runsLU:{ [key:string]: Run }, totalPointsLU: { [key:string]: number }){
    let buffer: JSX.Element[] = []

    const positions = Object.keys(tournament.runningOrder).map(el => parseInt(el));
    let minPos = Math.min(...positions); 
    let maxPos = Math.max(...positions); 

    let less100 = minPos >= 100; 

    for(let i=minPos; i<=maxPos; i++){
        let rowBuffer: JSX.Element[] = []; 
        tournament.contests.forEach((el, ind) => {
            let key = tournament.runningOrder[i] + " - " + el.name; 
            if(ind==0){
                rowBuffer.push(<th scope="col" className="scorecard-cell-md scorecard-lineup-cell fixed-col p-2">{tournament.runningOrder[i] ? `${less100 ? i-100 : i}. ${tournament.runningOrder[i]}` : `${i}.`}</th>) 
                rowBuffer.push(
                    <td scope="col" className="scorecard-cell-lg scorecard-contest-cell text-center p-2">{runsLU[key] ? 
                        <>
                            <span>{cleanTime(runsLU[key].time)}</span> 
                            { runsLU[key].urls.length ? 
                                <span className="ms-3"><a href={runsLU[key].urls[0]} target="_blank"><FontAwesomeIcon className="video-links" icon={faVideo} size="sm"/></a></span> : "" }
                        </> : "" }
                    </td>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-points-cell text-center p-2">{runsLU[key]?.points ? runsLU[key].points : ""}</td>) 
            } else {
                rowBuffer.push(<td scope="col" className="scorecard-cell-lg scorecard-contest-cell text-center p-2">{runsLU[key] ? 
                    <>
                        <span>{cleanTime(runsLU[key].time)}</span> 
                        { runsLU[key].urls.length ? 
                            <span className="ms-3"><a href={runsLU[key].urls[0]} target="_blank"><FontAwesomeIcon className="video-links" icon={faVideo} size="sm"/></a></span> : "" }
                    </> : "" }
                    </td>)
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-points-cell text-center p-2">{runsLU[key]?.points ? runsLU[key].points : ""}</td>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-totalpoints-cell text-center p-2">{totalPointsLU[key]}</td>) 
            }    
        })
        buffer.push(<tr>{...rowBuffer}</tr>)
    }


    return buffer; 
}

function generateAlphaRows(teamArr:string[], tournament:Tournament, runsLU:{ [key:string]: Run }, totalPointsLU: { [key:string]: number }) {
    let buffer: JSX.Element[] = []

    teamArr.forEach(team => {
        let rowBuffer: JSX.Element[] = []; 
        tournament.contests.forEach((el, ind) => {
            let key = team + " - " + el.name; 
            if(ind==0){
                rowBuffer.push(<th scope="col" className="scorecard-cell-md scorecard-lineup-cell fixed-col p-2">{team}</th>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-lg scorecard-contest-cell text-center p-2">{runsLU[key] ? runsLU[key].time != 'NULL' ? runsLU[key].time : "--" : "--" }</td>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-points-cell text-center p-2">{runsLU[key]?.points ? runsLU[key].points : "--"}</td>) 
            } else {
                rowBuffer.push(<td scope="col" className="scorecard-cell-lg scorecard-contest-cell text-center p-2">{runsLU[key] ? runsLU[key].time != 'NULL' ? runsLU[key].time : "--" : "--" }</td>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-points-cell text-center p-2">{runsLU[key]?.points ? runsLU[key].points : "--"}</td>) 
                rowBuffer.push(<td scope="col" className="scorecard-cell-sm scorecard-totalpoints-cell text-center p-2">{totalPointsLU[key]== 0 ? "--" : totalPointsLU[key]}</td>) 
            }    
        })
        buffer.push(<tr>{...rowBuffer}</tr>)
    })
    return buffer
}

function cleanTime(time:string){
    if(time.toUpperCase() == "NULL") return "--"; 
    return time; 
}
