import * as React from "react";
import { useState } from "react";
import { RuntimeGlobals } from "webpack";

import { Tournament, Run } from "../types/types"; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'

interface SortedViewProp {
    tournament: Tournament;
    runs: Run[]; 
}


export default function SortedView(props:SortedViewProp) {
    const tournament = props.tournament;
    const runs = props.runs; 
    const [contestSelected, setContestSelected] = useState(tournament.contests.length ? tournament.contests[0] : "")

    let runsLU:{ [key:string]: Run } = {};
    runs.forEach(el => {
        let key = el.team + " - " + el.contest; 
        runsLU[key] = el; 
    })


    const totalPoints:calculatingTotalPoints[] = calculateTotalPoints(tournament, runs); 
    const totalPointsTable = generateTotalPointsTable(totalPoints, runsLU, tournament); 
    const contestTable = generateContestSection(tournament, runs, contestSelected, setContestSelected )

    return (
        <div>
            <div>
                {totalPointsTable}
            </div>
            <div>
                {contestTable}
            </div>
        </div>
    )
}






interface calculatingTotalPoints {
    runningPos:number, 
    team:string, 
    points:number, 
    finish?:string
}

function calculateTotalPoints(tournament:Tournament, runs: Run[]):calculatingTotalPoints[]{
    let positions = Object.keys(tournament.runningOrder).map(el => parseInt(el))
    let totalPtsLu: { [team:string]:  calculatingTotalPoints} = {}; 
    positions.forEach(el => {
        let team = tournament.runningOrder[el]; 
        totalPtsLu[team] = {runningPos: el, team: team, points:0}
    })
    runs.forEach(run => {
        totalPtsLu[run.team].points += run.points ? run.points : 0; 
    })
    let totalPtsArr = Object.values(totalPtsLu).sort((a:calculatingTotalPoints,b:calculatingTotalPoints) => {
        return a.points > b.points ? -1 : 1; 
    })
    let finishes: string[] = ["1st Place", "2nd Place", "3rd Place", "4th Place", "5th Place"]; 
    totalPtsArr.forEach((el, index) => {
        if(index == 0) el.finish = finishes.shift(); 
        if(index > 0) {
            if(el.points == totalPtsArr[index-1].points && totalPtsArr[index-1].finish){
                el.finish = totalPtsArr[index-1].finish; 
                if(totalPtsArr.length) finishes.shift(); 
            } else {
                if(totalPtsArr.length) el.finish = finishes.shift(); 
            }
        }
    })
    totalPtsArr = totalPtsArr.filter(el => el.points)
    return totalPtsArr; 
}

function generateTotalPointsTable(totalPoints: calculatingTotalPoints[], runsLU:{ [key:string]: Run }, tournament:Tournament ): JSX.Element {
    let totalPointsBuffer: JSX.Element[] = []; 
    totalPointsBuffer.push(
        <div className="row ">
            <div className="col-12 text-center font-x-large mt-4 mb-2">
                Total Points
            </div>
        </div>
    )
    totalPoints.forEach(el => {
        totalPointsBuffer.push(
            <div className="row py-4 border bg-light rounded my-1 mx-4">
                <div className="team col-1 font-large d-flex justify-content-center align-items-center p-3 ">{el.finish ? el.finish : ''}</div>
                <div className="col-10 px-4">
                    <div className="row">
                        <div className="font-large border-bottom ">
                            {`${el.team}`}
                            <span className="ms-2 font-small text-secondary ">{`# ${el.runningPos}`}</span>
                        </div>
                    </div>
                    <div className="row">
                        {
                            tournament.contests.map(contest => {
                                let key:string = el.team + " - " + contest
                                return (
                                    <div className="col">
                                        <div className="row text-secondary font-x-small">{contest}</div>
                                        <div className="row font-small">{ runsLU[key]?.time ? runsLU[key].time : "" } / { runsLU[key]?.points ? runsLU[key].points : "" } </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="col-1 font-large p-2  d-flex flex-column justify-content-center align-items-center">
                    <span >{el?.points ? el.points : ''}</span>
                    <span className=" font-small ">{ el?.points ? el?.points > 1 ? "Points" : "Point" : ''}</span>
                </div>
            </div>
        )
    })

    return (
        <div className="border rounded border-shadow pb-4 mt-4">
            {...totalPointsBuffer}
        </div>
    )
}

function generateContestSection(tournament:Tournament, runs:Run[], contestSelected:string, setContestSelected:Function ){

    let runsToShow = runs.filter(el => {
        return el.contest == contestSelected; 
    })
    runsToShow = runsToShow.sort((a:Run,b:Run) => {
        let aNum = a.time == "NT" ? 99 : a.time == "OT" ? 98 : parseFloat(a.time);  
        let bNum = b.time == "NT" ? 99 : b.time == "OT" ? 98 : parseFloat(b.time);  
        console.log(aNum, bNum, aNum < bNum ? -1 : 1); 
        return aNum < bNum ? -1 : 1; 
    })
    console.log('runsToShow', runsToShow)


    let contestBuffer = []; 
    contestBuffer.push(
        <div className="col-12 text-center font-x-large mt-4 mb-2">
            Contest Results
        </div>
    )
    contestBuffer.push(
        <div className="d-flex justify-content-center flex-wrap align-content-center mt-4 mb-3 px-5">
            {
                tournament.contests.map(contest => {
                    return <div className={`${contestSelected == contest ? "contest-selected" : "contest-not-selected" } mx-1 px-3 py-2 rounded`} onClick={() => setContestSelected(contest)}>{contest}</div>
                })
            }
        </div>
    )
    contestBuffer.push(
        runsToShow.length ? 
            <div className="border bg-light rounded pt-2 pb-3">
                <div className="row py-3">
                    <div className="col-6 font-x-large text-center">Team</div>
                    <div className="col-3 font-x-large text-center">Time</div>
                    <div className="col-3 font-x-large text-center">Points</div>
                </div>

                {runsToShow.map(run => {
                    return (
                        <div className="row pb-1">
                            <div className="col-6 text-center font-large">{`${run.team}`}<span className="ms-2 font-medium text-secondary">{`#${run.runningPosition}`}</span></div>
                            <div className="col-3 font-large d-flex justify-content-center">
                                    <div className="scorecard-video-link-parent">
                                        {run.time}
                                        <span className="scorecard-video-link">
                                            {
                                                run.urls.length ? 
                                                    <span>
                                                        <a className="video-links" href={`${ run.urls.length ? run.urls[0] : "" }`} target="_blank"> <FontAwesomeIcon icon={faVideo} /></a>
                                                    </span> : <></>
                                            }
                                        </span>
                                    </div>
                            </div>
                            <div className="col-3 text-center font-large">{run?.points && run.points == 0 ? "" : run.points}</div>
                        </div>
                    )
                })}
            </div> : 
            <div className="border bg-light rounded p-5 m-5 text-center">
                No runs have been recorded for this event.                
            </div>
    )

    return (
        <div className="border rounded border-shadow my-4 p-4 ">
            {...contestBuffer}
        </div>

    )
}

