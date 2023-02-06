import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Tournament, Run } from "../types/types"; 

import TournamentHeader from "../Components/TournamentHeader";
import Scorecard from "../Components/Scorecard";
import SortedView from "../Components/SortedView";
import useWindowDimensions from "../utils/windowDimensions";

declare var SERVICE_URL: string;


export default function Schedule() {

    const [tournLoading, setTournLoading] = useState(true); 
    const [runLoading, setRunLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false);
    const [tournament, setTournament] = useState<Tournament>(); 
    const [runs, setRuns] = useState<Run[]>([]); 
    const [view, setView] =useState("scorecard")  
    const { width } = useWindowDimensions();

    let params = useParams();
    const tournamentId = params.id

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

    useEffect(() => {
        if(width < 750) setView('sortedview'); 
    }, [])

    let content; 
    if(tournLoading || runLoading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                </div>
            </div>
        )
    }
    if(errorLoading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="">Sorry, there was an error loading the tournament.</div>
                </div>
            </div>
        )
    }


    if((!tournLoading && !runLoading) && !errorLoading){
        content = (
            <div className="">
                <div className="row">
                    <TournamentHeader tournament={tournament} />
                </div>
                {
                !Object.keys(tournament.runningOrder).length  && !runs.length? 
                    <div className="row bg-white my-1 shadow-sm rounded p-5 d-flex justify-content-center shadow-sm">The lineup for the drill is not yet available.</div> : 
                    <div className="row bg-white my-1 shadow-sm rounded p-2 shadow-sm">
                        <div className="row">
                            <div className="col-1"></div>
                            <div className={`scorecard-type col-4 text-center p-2 ${view == 'scorecard' ? "border-bottom" : ""} `} onClick={()=>{setView('scorecard')}}>Scorecard View</div>
                            <div className="col-2"></div>
                            <div className={`scorecard-type col-4 text-center p-2 ${view != 'scorecard' ? "border-bottom" : ""}`} onClick={()=>{setView('sorted')}}>Sorted View</div>
                            <div className="col-1"></div>
                        </div>
                        <div className="d-flex justify-content-center">
                            {view == "scorecard" ? 
                                <div className="w-100">
                                    <Scorecard tournament={tournament} runs={runs}/>
                                </div> : 
                                <div className="row w-100 ">
                                    <SortedView tournament={tournament} runs={runs}/>
                                </div>
                            }                            
                        </div>
                    </div>
                }
            </div>        
        )
    }

    
    return (
        <div className="container">
            {content}
        </div>
    )
}


