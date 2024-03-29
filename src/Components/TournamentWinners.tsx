import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Tournament } from "../types/types"; 

import getTournamentWinner from "../utils/getTournamentWinners"; 

declare var SERVICE_URL: string;

interface TournamentWinnersProp {
    tournamentName: string;
    numberShown: number;
    yearOfDrill: number;  
}


export default function TournamentWinners(props:TournamentWinnersProp) {
    const tournamentName = props.tournamentName;

    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false);
    const [tournaments, setTournaments] = useState([]); 

    const navigate = useNavigate();   

    const fetchPastTournaments = () => {
        fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?tournaments=${tournamentName}`)
        .then(response => response.json())
        .then(data => {
            data = data.map((el:Tournament) => {
                return {
                    ...el,
                    date: new Date(el.date)
                }
            })
            data = data.sort((a:Tournament,b:Tournament) => a.date < b.date ? 1 : -1); 
            data = data.filter((el:Tournament) => {
                return el.top5 && el.top5.length > 0 && el.date.getFullYear() < props.yearOfDrill; 
            })
            data = data.slice(0,props.numberShown); 
            data = data.map((el:Tournament) => {
                return {
                    ...el, 
                    winnerStr: el.year + ": " +  getTournamentWinner(el, ", ")
                }
            })
            setTournaments(data)
            setLoading(false);
        })
        .catch(err => {
            console.log(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        fetchPastTournaments()
    }, [props.yearOfDrill])


    let content; 
    if(loading){
        content = (
            <div className="">{` `}</div>
        )
    }
    if(errorLoading){
        content = (
            <div className=""></div>
        )
    }


    if(!loading && !errorLoading){
        let list = tournaments.map((el, index) => {
            return <div className="past-tourn-entry mx-2 text-center" onClick={() => navigate(`/Tournament/${el.id}`)}>{el.winnerStr}</div>
        })
        if(tournaments.length){
            content = (
                <div className="font-small d-flex flex-row">
                    {list.length ? <div className="mx-2 text-center"><b>Past Winners:</b> </div> : <div/> }
                    {list}
                </div>        
            )    
        } else {
            content = ''; 
        }
    }

    
    return (
        <div className="">
            {content}
        </div>
    )
}


