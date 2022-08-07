import * as React from "react";
import { useEffect, useState } from "react";
import { Tournament } from "../types/types"; 
import dateUtil from "../utils/dateUtils"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 

interface ScheduleProp {
    year: number;
}


export default function Schedule(props:ScheduleProp) {

    const [tournaments, setTournaments] = useState<Tournament[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 

    const fetchTournaments = () => {
        fetch(`http://localhost:4400/tournaments/getFilteredTournaments?years=${props.year}`)
        .then(response => response.json())
        .then(data => {
            data = data.map((el:Tournament) => {
                return {
                    ...el, 
                    date: new Date(el.date)
                }
            })
            .filter((el:Tournament) => {
                return new Date(el.date) > new Date()
            })
            .sort((a:Tournament,b:Tournament) => a.date < b.date ? -1 : 1)
            .filter((el:Tournament, ind:number) => {return ind < 5})
            setTournaments(data); 
            setLoading(false);
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        fetchTournaments(); 
    }, []); 

    let content; 
    if(loading){
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
                    <div className="">Sorry, there was an error loading the schedule.</div>
                </div>
            </div>
        )
    }


    if(!loading && !errorLoading){
        content = (
            <div className="">
            {tournaments.length ? 
                tournaments.map((el:Tournament) => {  
                    return (
                    <div className="my-2 d-flex flex-row align-items-center"> 
                        {Math.random() <.7 ? <div className="video-icon-nolink font-x-large"><FontAwesomeIcon icon={faVideo} /></div> : <div></div>}              
                        <div><>{el.name} @ {el.track} - {dateUtil.getMMDDYYYY(el.date)}, {el.startTime}</></div>  
                    </div>
                    )
                }) : 
                <div>"No additional events schedule this year."</div>
            }
        </div>
        )
    }

    
    return ( content )
}