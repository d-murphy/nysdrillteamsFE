import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { contestArr } from "../Components/adminTournamentsComps/ContestOptions";
import { calculateTotalPoints } from "../Components/SortedView";

import { Tournament, Run } from "../types/types"; 
import { niceTime } from "../utils/timeUtils";

declare var SERVICE_URL: string;


export default function Broadcast() {

    const [tournLoading, setTournLoading] = useState(true); 
    const [runLoading, setRunLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false);
    const [tournament, setTournament] = useState<Tournament>(); 
    const [runs, setRuns] = useState<Run[]>([]); 

    let contestOptions = [...contestArr, 'all'].map(el => el.toLowerCase()); 
    contestOptions = contestOptions.filter(el => !['motor hose no. 2 target and barrel', 'jr division - junior eff. replacement', 'booster no. 1'].includes(el))

    let params = useParams();
    const topnextorlast = params?.topnextorlast.toLowerCase(); 
    const contest = params?.contest.toLowerCase(); 
    const tournamentId = params.id; 
    const [searchParams, _] = useSearchParams(); 
    const skipToParam = searchParams.get('skipto');  
    const limitParam = searchParams.get('limit'); 

    if(!topnextorlast || !['top', 'next', 'last'].includes(topnextorlast) || !tournamentId || !contest ) return (
        <div className="p-5">
            <BroadcastInstructions />
        </div>
    )

    async function getTournAndRuns(){
        let response = await fetch(`${SERVICE_URL}/tournaments/getTournament?tournamentId=${tournamentId}`); 
        let data = await response.json(); 
        data.date = new Date(data.date); 
        setTournament(data); 
        setTournLoading(false);
        let response2 = await fetch(`${SERVICE_URL}/runs/getRunsFromTournament?tournamentId=${data.id}`)
        let runs = await response2.json(); 
        setRuns(runs)
        setRunLoading(false); 
    }

    useEffect(() => {
        getTournAndRuns().catch(e => {
            console.log(e)
            setErrorLoading(true); 
        })
    }, [tournamentId])


    if(!contestOptions.includes(contest)) return (
        <div className="container">
            <div>
                {`This is not a valid contest: ${contest}`}
            </div>
            <div>
                These are the options: {contestOptions.map((el,ind) => `${el}${ind===contestArr.length-1 ? '' : ', '}` )}
            </div>
        </div>
    )
    if(tournLoading || runLoading) return (
        <div className="text-center pt-5">
                Loading...
        </div>
    )
    if(errorLoading) return (
        <div className="text-center pt-5">Sorry, there's an error loading data.  Check your connection and try again.</div>
    )

    const totalPoints = calculateTotalPoints(tournament, runs); 

    const runsToShow = runs.filter(el => el.contest.toLowerCase() === contest); 
    runsToShow.sort((a:Run,b:Run) => {
        let aNum = a.time == "NT" ? 98 : a.time == "OT" ? 97 : parseFloat(a.time) ? parseFloat(a.time) : 99 ;  
        let bNum = b.time == "NT" ? 98 : b.time == "OT" ? 97 : parseFloat(b.time) ? parseFloat(b.time) : 99 ;  
        return aNum < bNum ? -1 : 1; 
    })

    let runningOrder: {position: number, team:string}[] = [];  
    Object.keys(tournament.runningOrder).forEach((key:string) => { 
        runningOrder.push({position: parseInt(key), team: tournament.runningOrder[parseInt(key)]})
    }); 
    const teamsAlreadyRan = runs.filter(el => el.contest.toLowerCase() === contest).map(el => el.team); 
    runningOrder = runningOrder.filter(el => { return !teamsAlreadyRan.includes(el.team)}); 

    const maxRunningPosition = Math.max(...runs.filter(el => el.contest.toLowerCase() === contest).map(el => el?.runningPosition)); 
    const maxRunningPositionRun = runs.find(el => el.contest.toLowerCase() === contest && el?.runningPosition === maxRunningPosition); 

    const skipTo = parseInt(skipToParam) || 0; 
    const limit = parseInt(limitParam) || 5; 

    let content; 

    if(contest === 'all') {
        content = totalPoints.map((el, ind) => {
            return el.finish ? <><div className="col-9 text-end">{el.team}</div><div className="col-3 text-end">{el.points} {el.points===1 ? "pt" : "pts"}</div></> : <></>
        })
    } else if (topnextorlast === "top") {
        content = runsToShow.map((el,ind) => {
            return ind < limit || (runsToShow.length > limit && runsToShow[limit - 1].time === el.time) ? <><div className="col-6 text-left">{el.team}</div><div className="col-6 text-left">{niceTime(el.time)}</div></> : <></>
        })
    } else if(topnextorlast === 'next'){
        let numToShow = limit; 
        content = runningOrder.map((el) => {
            return skipTo <= el.position && el.team && --numToShow >= 0 ?<div className="col-12">{el.position}. {el.team}</div> : <></>
        })
    } else if(topnextorlast === 'last'){
        content = maxRunningPositionRun ? <><div className="col-6 text-left">{maxRunningPositionRun?.team}</div><div className="col-6 text-left">{maxRunningPositionRun?.time}</div></> : <></>
    }
    
    return (
        <div className="">
            <div className="broadcast font-x-large row">
                {content}
            </div>
        </div>
    )
}


export function BroadcastInstructions(){
    return (
        <div className="p-5">
            <p><i>This page is intended for use by the media committee on tournament day.</i></p>
            <br/>
            <p>/Broadcast requires the following URL pattern:  /Broadcast/tournament id/top, next or last/contest or all?skipto=X&limit=Y</p>
            <p>If you're attempting to use /Broadcast, something about your URL isn't right.</p>
            <br/>
            <p>This page is controlled by the URL parameters.  Here's info on each piece:</p>
            <ul>
                <li>Tournament Id:  find this in the url of the scorecard</li>
                <li>Top, next or last:  Use top for the best runs of the contest.  Use next to see upcoming teams. Use last for the most recent run.</li>
                <ul>
                    <li>For next: you can add ?skipto=15 if you want to jump over teams.  </li>
                    <li>For next and top: you can add ?limit=2 if you want to control how many teams appear</li>
                    <li>For next, you can combine both with:  ?skipto=15&limit=3</li>
                    <li>skipto and limit are optional.  You can omit the question mark and everything that follows.</li>
                    <li>skipto and limit won't affect last.</li>
                </ul>
                <li>Contest or all: enter a contest name or 'all'</li>
                <ul>
                    <li>Enter a contest name.  It'll be replaced with an encoded version of the name where spaces are replaced with character codes.  This is okay - you can keep entering with spaces.</li>
                    <li>Enter 'all' instead of a contest name to see the tournament top 5 (sums run points - not the entry on the tournament page.)</li>
                    <li>'Next', 'top' or 'last' changes what appears for contest.  For 'all', next, top or last displays the same thing:  the top 5 for the drill</li>
                </ul>
            </ul>
        </div>
    )
}