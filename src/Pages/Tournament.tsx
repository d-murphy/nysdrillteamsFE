import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Tournament, Run } from "../types/types"; 

import TournamentHeader from "../Components/TournamentHeader";
import Scorecard from "../Components/Scorecard";
import SortedView from "../Components/SortedView";




export default function Schedule() {

    const [tournLoading, setTournLoading] = useState(true); 
    const [runLoading, setRunLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false);
    const [tournament, setTournament] = useState<Tournament>(); 
    const [runs, setRuns] = useState<Run[]>(); 
    const [view, setView] =useState("scorecard")  

    let params = useParams();
    const tournamentId = params.id

    const fetchTournament = () => {
        fetch(`http://localhost:4400/tournaments/getTournament?tournamentId=${tournamentId}`)
            .then(response => response.json())
            .then(data => {
                data.date = new Date(data.date)
                setTournament(data)
                console.log('tourn: ', data)
                setTournLoading(false);
            })
            .catch(err => {
                console.log(err)
                setErrorLoading(true); 
            })
    }

    const fetchRuns = () => {
        fetch(`http://localhost:4400/runs/getRunsFromTournament?tournamentId=${tournamentId}`)
            .then(response => response.json())
            .then(data => {
                setRuns(data)
                console.log('runs: ', data)
                setTimeout(() => {setRunLoading(false)}, 500); 
                // setRunLoading(false);
            })
            .catch(err => {
                console.log(err)
                setErrorLoading(true); 
            })
    }


    useEffect(() => {
            fetchTournament(),
            fetchRuns()     
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
                <div className="row bg-white my-1 shadow-sm rounded p-2">
                    <div className="row">
                        <div className="col-2"></div>
                        <div className={`scorecard-type col-3 text-center p-2 ${view == 'scorecard' ? "border-bottom" : ""} `} onClick={()=>{setView('scorecard')}}>Scorecard View</div>
                        <div className="col-2"></div>
                        <div className={`scorecard-type col-3 text-center p-2 ${view != 'scorecard' ? "border-bottom" : ""}`} onClick={()=>{setView('sorted')}}>Sorted View</div>
                        <div className="col-2"></div>
                    </div>
                    {view == "scorecard" ? 
                        <div className="">
                            <Scorecard tournament={tournament} runs={runs}/>
                        </div> : 
                        <div className="row">
                            <SortedView tournament={tournament} runs={runs}/>
                        </div>
                    }
                </div>
            </div>        
        )
    }

    
    return (
        <div className="container">
            {content}
        </div>
    )
}


