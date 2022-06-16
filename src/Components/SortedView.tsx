import * as React from "react";

import { Tournament, Run } from "../types/types"; 

interface SortedViewProp {
    tournament: Tournament;
    runs: Run[]; 
}


export default function SortedView(props:SortedViewProp) {
    console.log('sort view called')
    const tournament = props.tournament;
    const runs = props.runs; 
    let runsLU:{ [key:string]: Run } = {};
    runs.forEach(el => {
        let key = el.team + " - " + el.contest; 
        runsLU[key] = el; 
    })


    const totalPoints:calculatingTotalPoints[] = calculateTotalPoints(tournament, runs); 
    const totalPointsTable = generateTotalPointsTable(totalPoints, runsLU, tournament); 

    return (
        totalPointsTable
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
    console.log(totalPtsArr)
    return totalPtsArr; 
}

function generateTotalPointsTable(totalPoints: calculatingTotalPoints[], runsLU:{ [key:string]: Run }, tournament:Tournament ){
    let buffer: JSX.Element[] = []; 
    buffer.push(
        <div className="sorted-view-result-row row">
            <div className="col-11 text-center font-x-large my-4">
                Total Points
            </div>
            <div className="col-1 custom-control custom-switch">
                <input type="checkbox" className="custom-control-input" id="customSwitch1" />
                <label className="custom-control-label" htmlFor="customSwitch1">Top 5 Only?</label>
            </div>
        </div>
    )
    totalPoints.forEach(el => {
        buffer.push(
            <div className="row py-4 border-bottom bg-light my-1 mx-4">
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
        <div className="">
            {...buffer}
        </div>
    )
}

