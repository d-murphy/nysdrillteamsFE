import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { contestArr } from "../Components/adminTournamentsComps/ContestOptions";
import { calculateTotalPoints } from "../Components/SortedView";

import { Tournament, Run } from "../types/types"; 

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
    const topornext = params?.topornext.toLowerCase(); 
    const contest = params?.contest.toLowerCase(); 
    const tournamentId = params.id; 
    const [searchParams, _] = useSearchParams(); 
    const skipToParam = searchParams.get('skipto');  
    const limitParam = searchParams.get('limit'); 

    if(!topornext || !['top', 'next'].includes(topornext) || !tournamentId || !contest ) return (
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
    console.log('teamsAlreadyRan: ', teamsAlreadyRan)
    runningOrder = runningOrder.filter(el => { return !teamsAlreadyRan.includes(el.team)}); 
    console.log('runningOrder: ', runningOrder); 

    // finish this, using skip
    // add limit to total points (remove finish)
    // add limit to top runs
    // add instructions to Broadcast

    const skipTo = parseInt(skipToParam) || 0; 
    const limit = parseInt(limitParam) || 5; 

    let content; 

    if(contest === 'all') {
        content = totalPoints.map((el, ind) => {
            return el.finish ? <div>{el.team} - {el.points} {el.points===1 ? "pt" : "pts"}</div> : <></>
        })
    } else if (topornext === "top") {
        content = runsToShow.map((el,ind) => {
            return ind < limit || (runsToShow.length > limit && runsToShow[limit - 1].time === el.time) ? <div>{el.team} - {el.time}</div> : <></>
        })
    } else if(topornext === 'next'){
        let numToShow = limit; 
        content = runningOrder.map((el) => {
            return skipTo <= el.position && el.team && --numToShow >= 0 ? <div>{el.position}. {el.team}</div> : <></>
        })
    }

    
    return (
        <div className="text-center pt-5">
            {content}
        </div>
    )
}


export function BroadcastInstructions(){
    return (
        <div className="p-5">
            <p><i>This page is intended for use by the media committee on tournament day.</i></p>
            <br/>
            <p>/Broadcast requires the following URL pattern:  /Broadcast/tournament id/top or next/contest or all?skipto=X&limit=Y</p>
            <p>If you're attempting to use /Broadcast, something about your URL isn't right.</p>
            <br/>
            <p>This page is controlled by the URL parameters.  Here's info on each piece:</p>
            <ul>
                <li>Tournament Id:  find this in the url of the scorecard</li>
                <li>Top or next:  Use top for the best runs of the contest.  Use next to see upcoming teams</li>
                <ul>
                    <li>For next: you can add ?skipto=15 if you want to jump over teams.  </li>
                    <li>For next and top: you can add ?limit=2 if you want to control how many teams appear</li>
                    <li>For next, you can combine both with:  ?skipto=15&limit=3</li>
                    <li>skipto and limit are optional.  You can omit the question mark and everything that follows.</li>
                </ul>
                <li>Contest or all: enter a contest name or 'all'</li>
                <ul>
                    <li>Enter a contest name.  It'll be replaced with an encoded version of the name where spaces are replaced with character codes.  This is okay - you can keep entering with spaces.</li>
                    <li>Enter 'all' instead of a contest name to see the tournament top 5 (sums run points - not the entry on the tournament page.)</li>
                    <li>'Next' or 'top' changes what appears for contest.  For 'all', next or top displays the same thing:  the top 5 for the drill</li>
                </ul>
            </ul>
        </div>
    )
}