//http://localhost:4400/tournaments/getTournamentsByName?name=Central Islip Invitational

import * as React from "react";
import { useEffect, useState } from "react";

import { Tournament } from "../types/types"; 

import getTournamentWinner from "../utils/getTournamentWinners"; 

interface TournamentWinnersProp {
    tournamentName: string;
    numberShown: number; 
}


export default function TournamentWinners(props:TournamentWinnersProp) {
    const tournamentName = props.tournamentName;

    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false);
    const [tournaments, setTournaments] = useState([]); 
   

    const fetchPastTournaments = () => {
        console.log("ft called for id: ", tournamentName);  
        fetch(`http://localhost:4400/tournaments/getTournamentsByName?name=${tournamentName}`)
        .then(response => response.json())
        .then(data => {
            console.log('gtbn', data)
            data = data.map((el:Tournament) => {
                return {
                    ...el,
                    date: new Date(el.date)
                }
            })
            data = data.sort((a:Tournament,b:Tournament) => a.date < b.date ? 1 : -1); 
            data = data.filter((el:Tournament) => {
                return el.top5 && el.top5.length > 0; 
            })
            data = data.slice(0,props.numberShown); 
            data = data.map((el:Tournament) => {
                return {
                    ...el, 
                    winnerStr: el.year + ": " +  getTournamentWinner(el, ", ")
                }
            })
            setTournaments(data)
            console.log(data)
            setLoading(false);
        })
        .catch(err => {
            console.log(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        fetchPastTournaments()
    }, [])


    let content; 
    if(loading){
        content = (
            <div className="">
                <div className="spinner-border text-secondary" role="status"></div>
                <span className="sr-only">Loading...</span>   
            </div>
        )
    }
    if(errorLoading){
        content = (
            <div className=""></div>
        )
    }


    if(!loading && !errorLoading){
        let list = tournaments.map(el => {
            return <div>{el.winnerStr}</div>
        })
        content = (
            <div className="font-small ">
                {list.length ? <div><b>Past Winners:</b> </div> : <div/> }
                {list}
            </div>        
        )
    }

    
    return (
        <div className="">
            {content}
        </div>
    )
}


