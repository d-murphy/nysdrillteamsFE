import * as React from "react";
import { useEffect, useState } from "react";
import { Tournament } from "./types/types"; 



export default function Schedule() {

    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 

    const fetchTournaments = () => {
        fetch(`http://google.com`)
        .then(response => response.json())
        .then(data => {
            data = data.sort((a:Tournament,b:Tournament) => a.date < b.date ? -1 : 1)
            data = data.map((el:Tournament) => {
                return {
                    ...el, 
                    date: new Date(el.date)
                }
            })
            setLoading(false);
        })
        .catch(err => {
            setErrorLoading(true); 
        })
    }

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
            <div className="container">Sorry, there was an error loading the schedule.</div>
        )
    }


    if(!loading && !errorLoading){
        content = (
            <div className="">
                new hiya test, trying to move on
            </div>        
        )
    }

    
    return (
        <div className="container">
            {content}
        </div>
    )
}


