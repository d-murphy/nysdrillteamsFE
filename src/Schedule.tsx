import * as React from "react";
import { useEffect, useState } from "react";
import { Tournament } from "./types/types"; 
import ScheduleEntry from "./ScheduleEntry"; 

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
            data = data.sort((a:Tournament,b:Tournament) => a.date < b.date ? -1 : 1)
            data = data.map((el:Tournament) => {
                return {
                    ...el, 
                    date: new Date(el.date)
                }
            })
            setTournaments(data); 
            setFilteredRows(data); 
            setLoading(false);     
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
        })
    }

    const applyFilter = () => {
        console.log('testttt')
    }

    // const applyFilter = (circuitsArr: string[]) => {
    //     let result = tournaments.filter(el => {
    //         let filterOverlapsTourn = false;
    //         for (let circuit of el.circuits){
    //             if(circuitsArr.includes(circuit)) {
    //                 filterOverlapsTourn = true;
    //                 break; 
    //             }  
    //         }
    //         return filterOverlapsTourn;  
    //     })
    //     setFilteredRows(result); 
    // }

    useEffect(() => {
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


    if(!loading && !errorLoading){
        content = (
            <div className="">
                <div className="d-flex justify-content-between mt-4 mb-3 p-3">
                    <div className="mx-5">&nbsp;</div>
                    <div className="circuit-selected mx-5" onClick={applyFilter}>All Events</div>
                    <div className="circuit-not-selected mx-3">Nassau</div>
                    <div className="circuit-not-selected mx-3">Northern</div>
                    <div className="circuit-not-selected mx-3">Suffolk</div>
                    <div className="circuit-not-selected mx-3">Western</div>
                    <div className="circuit-not-selected mx-5">Old Fashioned</div>
                    <div className="circuit-not-selected mx-5">Juniors</div>
                    <div className="mx-5">&nbsp;</div>
                </div>
                <div className="pb-5">
                    {filteredRows.map(el => {
                        return <ScheduleEntry key={el.id} tournament={el}/>
                    })}
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


