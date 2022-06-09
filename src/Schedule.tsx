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
                console.log(data);
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

    let tableRows = filteredRows.map(el => {
        let circuitsStr = ''; 
        el.circuits.forEach(circ => {
            circuitsStr += circ; 
        })
        el.date = new Date(el.date)
        let timeStr = String(el.date.getHours()) + ":"
        timeStr += String(el.date.getMinutes()).length<2 ? "0" + String(el.date.getMinutes()) : String(el.date.getMinutes()); 
        return (
            <tr>
                <td>{el.name}</td>
                <td>{circuitsStr}</td>
                <td>{`${el.date.getMonth()+1}/${el.date.getDate()}/${el.date.getFullYear()}`}</td>
                <td>{timeStr}</td>
            </tr>
        )
    })


    if(!loading && !errorLoading){
        content = (
            <table>
                <tr>
                    <th>Tournament Name</th>
                    <th>Circuit</th>
                    <th>Date</th>
                    <th>Time</th>
                </tr>
                {tableRows}
            </table>
        
        )
    }

    
    return (
        <div className="container">
            {content}
        </div>
    )
}


