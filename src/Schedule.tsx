import * as React from "react";
import { useEffect, useState } from "react";
import { Tournament } from "./types/types"; 

interface ScheduleProp {
    year: number;
}


export default function Schedule(props:ScheduleProp) {

    const [tournaments, setTournaments] = useState<Tournament[]>([]); 
    const [filteredRows, setFilteredRows ] = useState<Tournament[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 

    const fetchTournaments = () => {
        fetch(`http://localhost:4400/tournaments/getTournaments?years=${props.year}`)
        .then(response => response.json())
        .then(data => {
            setTimeout(() => {
                setTournaments(data); 
                setFilteredRows(data); 
                setLoading(false);     
            }, 2000)
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
        })
    }

    const applyFilter = (circuitsArr: string[]) => {
        let result = tournaments.filter(el => {
            let filterOverlapsTourn = false;
            for (let circuit of el.circuits){
                if(circuitsArr.includes(circuit)) {
                    filterOverlapsTourn = true;
                    break; 
                }  
            }
            return filterOverlapsTourn;  
        })
        setFilteredRows(result); 
    }

    useEffect(() => {
        console.log('hiya')
        fetchTournaments(); 
    }, []); 

    if(loading){
        return(
            <div className="container">
                <div className="spinner-border text-secondary" role="status"></div>
                <span className="sr-only">Loading...</span>   
            </div>
        )
    }
    if(errorLoading){
        return (
            <div className="container">Sorry, there was an error loading the schedule.</div>
        )
    }

    let tableRows = filteredRows.map(el => {
        return (<div>{el.name}</div>)
    })
    
    return (
        <div className="container">
            {tableRows}
        </div>
    )
}


