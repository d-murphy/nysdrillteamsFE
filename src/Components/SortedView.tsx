import * as React from "react";
import { useState, useEffect } from "react";
import { SizedImage } from "./SizedImage";
import getImgLocation from "../utils/imgLU";

import { Tournament, Run } from "../types/types"; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import { niceTime } from "../utils/timeUtils";

interface SortedViewProp {
    tournament: Tournament;
    runs: Run[]; 
}


export default function SortedView(props:SortedViewProp) {
    const tournament = props.tournament;
    const runs = props.runs; 
    const [contestSelected, setContestSelected] = useState(tournament.contests.length ? tournament.contests[0] : {name:''})
    const [showBeyondTop5, setShowBeyondTop5] = useState(false)
    const [less100, setLess100] = useState(false); 

    let runsLU:{ [key:string]: Run } = {};
    runs.forEach(el => {
        let key = el.team + " - " + el.contest; 
        runsLU[key] = el; 
    })

    useEffect(() => {
        let positions = Object.keys(tournament.runningOrder).map(el => parseInt(el))
        let minPos = Math.min(...positions); 
        if (minPos >= 100) setLess100(true); 
    }, [])



    const totalPoints:calculatingTotalPoints[] = calculateTotalPoints(tournament, runs); 
    const totalPointsTable = generateTotalPointsTable(totalPoints, runsLU, tournament, showBeyondTop5, setShowBeyondTop5, less100); 
    const contestTable = generateContestSection(tournament, runs, contestSelected.name, setContestSelected, less100 )

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
    let totalPtsLu: { [team:string]:  calculatingTotalPoints} = {}; 
    let positions = Object.keys(tournament.runningOrder).map(el => parseInt(el))
    if(positions.length){
        positions.forEach(el => {
            let team = tournament.runningOrder[el]; 
            totalPtsLu[team] = {runningPos: el, team: team, points:0}
        })    
    } else {
        let teamsSet:Set<string> = new Set(); 
        runs.forEach(run => teamsSet.add(run.team)); 
        Array.from(teamsSet).forEach(team => {
            totalPtsLu[team] = {runningPos: null, team: team, points:0}
        })
    }
    runs.forEach(run => {
        if(totalPtsLu[run.team] ) {
            totalPtsLu[run.team].points += run?.points ? run.points : 0; 
        }
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

function generateTotalPointsTable(totalPoints: calculatingTotalPoints[], runsLU:{ [key:string]: Run }, tournament:Tournament, showBeyondTop5:boolean, setShowBeyondTop5:Function, less100:boolean ): JSX.Element {
    let totalPointsBuffer: JSX.Element[] = []; 
    totalPointsBuffer.push(
        <div className="row ">
            <div className="col-12 text-center font-x-large mt-4 mb-2">
                Total Points
            </div>
        </div>
    )
    totalPoints.forEach((el, ind) => {
        if((!showBeyondTop5 && el.finish) || showBeyondTop5){
            totalPointsBuffer.push(
                <div className="row py-4 border bg-light rounded my-1 mx-4">
                    <div className="col-12 col-sm-2">
                        <div className="font-large d-flex justify-content-center align-items-center p-3 h-100">
                            {el.finish ? el.finish : ''}
                        </div>
                    </div>
                    <div className="col-12 col-sm-8 px-4">
                        <div className="">
                            <div className=" border-bottom d-flex align-items-center justify-content-center flex-wrap pb-1">
                                <div className="">
                                    <SizedImage imageSrc={getImgLocation(el.team)} size="sm"/>
                                </div>
                                <div className="font-large ms-2 text-nowrap text-truncate">{`${el.team}`}</div>
                                <div className="ms-2 font-small text-secondary">
                                    {el.runningPos ? <span className="">{`#${less100 ? el.runningPos-100 : el.runningPos}`}</span> : <></>}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {
                                tournament.contests.map(contest => {
                                    let key:string = el.team + " - " + contest.name
                                    return (
                                        <div className="col-6 col-sm-3">
                                            <div className="d-flex flex-column justify-content-center align-items-center">
                                                <div className="text-secondary font-x-small text-nowrap text-truncate text-center">{contest.name}</div>
                                                <div className="font-small text-center">
                                                    {
                                                        runsLU[key]?.urls.length ? 
                                                            <span className="me-2">
                                                                <a className="video-links" href={`${ runsLU[key]?.urls.length ? runsLU[key]?.urls[0] : "" }`} target="_blank"> <FontAwesomeIcon icon={faVideo} size="sm"/></a>
                                                            </span> : <></>
                                                    }
                                                    { runsLU[key]?.time ? niceTime(runsLU[key].time) : "--" } / 
                                                    { runsLU[key]?.points ? runsLU[key].points : "" } 
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="col-12 col-sm-2 font-large p-2  d-flex flex-column justify-content-center align-items-center">
                        <span >{el?.points ? el.points : ''}</span>
                        <span className=" font-small ">{ el?.points ? el?.points > 1 ? "Points" : "Point" : ''}</span>
                    </div>
                </div>
            )    
        }
    })
    totalPointsBuffer.push(
        <div className="d-flex justify-content-center align-items-center my-3">
            {showBeyondTop5 ? 
                <div className="btn btn-outline-secondary" onClick={() => setShowBeyondTop5(false)}>Show Top 5 Only</div>: 
                <div className="btn btn-outline-secondary" onClick={() => setShowBeyondTop5(true)}>Show All Scoring Teams</div>
            } 
        </div>
    )

    return (
        <div className="border rounded border-shadow pb-4 mt-4">
            {...totalPointsBuffer}
        </div>
    )
}

function generateContestSection(tournament:Tournament, runs:Run[], contestSelected:string, setContestSelected:Function, less100:boolean ){

    let runsToShow = runs.filter(el => {
        return el.contest == contestSelected; 
    })
    runsToShow = runsToShow.sort((a:Run,b:Run) => {
        let aNum = a.time == "NT" ? 98 : a.time == "OT" ? 97 : parseFloat(a.time) ? parseFloat(a.time) : 99 ;  
        let bNum = b.time == "NT" ? 98 : b.time == "OT" ? 97 : parseFloat(b.time) ? parseFloat(b.time) : 99 ;  
        return aNum < bNum ? -1 : 1; 
    })

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
                    return <div className={`${contestSelected == contest.name ? "contest-selected" : "contest-not-selected" } m-1 px-3 py-2 rounded`} onClick={() => setContestSelected(contest)}>{contest.name}</div>
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
                            <div className="col-6 text-center font-large text-nowrap text-truncate">
                                {`${run.team}`}
                                {run.runningPosition ? <span className="ms-2 font-medium text-secondary">{`#${less100 ? run.runningPosition - 100 : run.runningPosition}`}</span>  : <></>} 
                            </div>
                            <div className="col-3 font-large d-flex justify-content-center">
                                    <div className="">
                                        {run.time ? niceTime(run.time) : '--'}
                                        <span className="ms-2">
                                            {
                                                run?.urls.length ? 
                                                    <span>
                                                        <a className="video-links" href={`${ run.urls.length ? run.urls[0] : "" }`} target="_blank"> <FontAwesomeIcon icon={faVideo} /></a>
                                                    </span> : <></>
                                            }
                                        </span>
                                    </div>
                            </div>
                            <div className="col-3 text-center font-large">{run?.points ? run.points : "" }</div>
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

