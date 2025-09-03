import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Tournament, Run } from "../types/types";
import TournamentHeader from "../Components/TournamentHeader";
import Scorecard from "../Components/Scorecard";
import SortedView from "../Components/SortedView";
import useWindowDimensions from "../utils/windowDimensions";
import { useTournament } from "../hooks/useTournament";
import { useTournamentRuns } from "../hooks/useTournamentRuns";


export default function Tournament() {
    const [view, setView] = useState("scorecard");
    const { width } = useWindowDimensions();

    const params = useParams<{ id: string }>();
    const tournamentId = params.id;

    // Use the new hooks
    const { 
        tournament, 
        isLoading: tournLoading, 
        isError: tournError 
    } = useTournament({ 
        tournamentId: tournamentId || '', 
        enabled: !!tournamentId 
    });

    const { 
        runs, 
        isLoading: runLoading, 
        isError: runError 
    } = useTournamentRuns({ 
        tournamentId: tournamentId || '', 
        enabled: !!tournamentId 
    });

    const isLoading = tournLoading || runLoading;
    const isError = tournError || runError;

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
    if(isError){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="">Sorry, there was an error loading the tournament.</div>
                </div>
            </div>
        )
    }


    if((!tournLoading && !runLoading) && !isError){
        content = (
            <div className="mx-2">
                <div className="row">
                    <TournamentHeader tournament={tournament} />
                </div>
                {
                tournament?.cancelled ? 
                    <div className="row bg-white my-1 shadow-sm rounded p-5 d-flex justify-content-center shadow-sm">This event has been cancelled.</div> :
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


