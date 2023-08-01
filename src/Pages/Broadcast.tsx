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

    const showing = params?.showing.toLowerCase(); 
    const tournamentId = params.id; 
    const [searchParams, _] = useSearchParams(); 
    const skipParam = searchParams.get('skip');  
    const limitParam = searchParams.get('limit'); 
    const contestParam = searchParams.get('contest'); 

    if(!tournamentId || !showing || !['all', 'last', 'next', 'top'].includes(showing)) return (
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


    if(['next', 'top'].includes(showing) && !contestOptions.includes(contestParam?.toLowerCase())) return (
        <div className="container">
            <div className="p-2">
                {`This is not a valid contest: ${contestParam}`}
            </div>
            <div className="p-2">
                These are the contest options: {contestOptions.map((el,ind) => `${el}${ind===contestArr.length-1 ? '' : ', '}` )}
            </div>
        </div>
    )
    if(tournLoading || runLoading) return (
        <div className="broadcast font-xxx-large row">
                &nbsp;
        </div>
    )
    if(errorLoading) return (
        <div className="text-center pt-5">Sorry, there's an error loading data.  Check your connection and try again.</div>
    )

    const totalPoints = calculateTotalPoints(tournament, runs); 

    const runsToShow = runs.filter(el => el.contest.toLowerCase() === contestParam?.toLowerCase()); 
    runsToShow.sort((a:Run,b:Run) => {
        let aNum = a.time == "NT" ? 98 : a.time == "OT" ? 97 : parseFloat(a.time) ? parseFloat(a.time) : 99 ;  
        let bNum = b.time == "NT" ? 98 : b.time == "OT" ? 97 : parseFloat(b.time) ? parseFloat(b.time) : 99 ;  
        return aNum < bNum ? -1 : 1; 
    })

    let runningOrder: {position: number, team:string}[] = [];  
    Object.keys(tournament.runningOrder).forEach((key:string) => { 
        runningOrder.push({position: parseInt(key), team: tournament.runningOrder[parseInt(key)]})
    }); 
    const teamsAlreadyRan = runs.filter(el => el.contest.toLowerCase() === contestParam?.toLowerCase()).map(el => el.team); 
    runningOrder = runningOrder.filter(el => { return !teamsAlreadyRan.includes(el.team)}); 

    // const maxRunningPosition = Math.max(...runs.filter(el => el.contest.toLowerCase() === contest).map(el => el?.runningPosition)); 
    // const maxRunningPositionRun = runs.find(el => el.contest.toLowerCase() === contest && el?.runningPosition === maxRunningPosition); 
    const maxRunningPositionId = runs.map(el => el?._id).sort()[runs.length-1]; 
    const maxRunningPositionRun = runs.find(el => el._id === maxRunningPositionId); 


    const skip = parseInt(skipParam) || 0; 
    const limit = parseInt(limitParam) || 5; 

    let content; 

    if(showing === 'all') {
        content = totalPoints.map((el, ind) => {
            return el.finish ? <><div className="col-9 text-end">{el.team}</div><div className="col-3 text-end">{el.points} {el.points===1 ? "pt" : "pts"}</div></> : <></>
        })
    } else if (showing === "top") {
        content = runsToShow.map((el,ind) => {
            return ind < limit || (runsToShow.length > limit && runsToShow[limit - 1].time === el.time) ? <><div className="col-9 text-left">{el.team}</div><div className="col-3 text-left">{niceTime(el.time)}</div></> : <></>
        })
    } else if(showing === 'next'){
        let numToShow = limit; 
        let numToSkip = skip; 
        content = runningOrder.map((el, ind) => {
            return !el.team ? <></> : 
                --numToSkip >= 0 ? <></> : 
                --numToShow >= 0 ? <div className="col-12">{el.position}. {el.team}</div> : <></>
        })
    } else if(showing === 'last'){
        content = maxRunningPositionRun ? <><div className="col-9 text-left">{maxRunningPositionRun?.team}</div><div className="col-3 text-left">{maxRunningPositionRun?.time}</div></> : <></>
    }
    
    return (
        <div className="">
            <div className="broadcast font-xxx-large row">
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
            <p>/Broadcast requires the following URL pattern:  /Broadcast/tournament id/showing?skip=X&limit=Y&contest=Z</p>
            <p>If you're attempting to use /Broadcast, something about your URL isn't right.</p>
            <br/>
            <p>This page is controlled by the URL parameters.  Here's info on each piece:</p>

            <ul>
                <li>Tournament Id:  find this in the url of the scorecard</li>
                <li>Showing:</li>
                <ul>
                    <li>Use all for the tournament top 5.</li>
                        <ul>
                            <li>This is showing points from the run entries, not the tournament.</li>
                        </ul>
                    <li>Use last for the most recent run.</li>
                    <li>Use next for upcoming teams.</li>
                    <ul>
                        <li>specify contest with ?contest=X (required)</li>
                        <li>add ?skip=1 to jump teams (optional)</li>
                        <li>add ?limit=1 to limit the number shown (optional)</li>
                        <li>combine options as follows: ?contest=X&skip=1</li>
                    </ul>
                    <li>Use top for the best runs in a contest</li>
                    <ul>
                        <li>specify contest with ?contest=X (required)</li>
                        <li>add ?limit=1 to limit the number shown (optional)</li>
                    </ul>
                </ul>
            </ul>
        </div>
    )
}