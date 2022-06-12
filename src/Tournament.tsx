import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Tournament } from "./types/types"; 

import TournamentHeader from "./TournamentHeader";




export default function Schedule() {

    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false);
    const [tournament, setTournament] = useState<Tournament>();   

    let params = useParams();
    const tournamentId = params.id

    const fetchTournament = () => {
        console.log("ft called for id: ", tournamentId);  
        fetch(`http://localhost:4400/tournaments/getTournament?tournamentId=${tournamentId}`)
        .then(response => response.json())
        .then(data => {
            data.date = new Date(data.date)
            setTournament(data)
            console.log(data)
            setLoading(false);
        })
        .catch(err => {
            console.log(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        fetchTournament()
    }, [])

    let content; 
    if(loading){
        content = (
            <div className="container">
                <div className="spinner-border text-secondary" role="status"></div>
                <span className="sr-only">Loading...</span>   
            </div>
        )
    }
    if(errorLoading){
        content = (
            <div className="container">Sorry, there was an error loading the tournament.</div>
        )
    }


    if(!loading && !errorLoading){
        content = (
            <div className="">
                <div className="row">
                    <TournamentHeader tournament={tournament} />
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


