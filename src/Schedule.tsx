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
    const [regionsSelection, setRegionsSelected ] = useState<string[]>([]); 
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
            console.log('how often is this running?')     
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
        })
    }

    const selectRegion = function(region:string) {
        if(region == 'All Events') setRegionsSelected([]); 
        if(["Nassau", "Northern", "Western", "Suffolk"].includes(region)){
            if(regionsSelection.includes(region)){
                console.log('region was included')
                removeRegion(region); 
            } else {
                console.log('region was not included')
                let currentSelected = regionsSelection; 
                currentSelected.push(region); 
                console.log('setting regions to: ', currentSelected)
                setRegionsSelected([...currentSelected]); 
                if(regionsSelection.includes("Old Fashioned")) removeRegion("Old Fashioned"); 
                if(regionsSelection.includes("Junior")) removeRegion("Junior"); 
            }
        }
        if(["Old Fashioned", "Junior"].includes(region)){
            if(regionsSelection.includes(region)){
                setRegionsSelected([]); 
            } else {
                setRegionsSelected([region]); 
            }
        }
    }

    function removeRegion(region:string){
        let currentSelected = regionsSelection; 
        let ind = currentSelected.findIndex(el => el == region); 
        if(ind>=0) currentSelected.splice(ind,1);
        console.log('setting regions to: ', currentSelected)
        setRegionsSelected([...currentSelected]); 
    }

    function filterTournaments(){
        if(!regionsSelection.length) {
            setFilteredRows(tournaments); 
            return; 
        }
        let result = tournaments.filter(el => {
            let overlapFound = false; 
            regionsSelection.forEach(region => {
                if(el.circuits.includes(region)) overlapFound = true; 
            })
            return overlapFound; 
        })
        setFilteredRows(result); 
    }


    useEffect(() => {
        fetchTournaments(); 
    }, []); 

    useEffect(() => {
        console.log('calling filtered tournaments')
        filterTournaments(); 
    }, [regionsSelection]); 


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
                <div className="d-flex justify-content-between flex-wrap mt-4 mb-3 px-5">
                    <div className={`${!regionsSelection.length ? "circuit-selected" : "circuit-not-selected" } mx-5 px-3 py-2 rounded`} onClick={() => selectRegion("All Events")}>All Events</div>
                    <div className={`${regionsSelection.includes("Nassau") ? "circuit-selected" : "circuit-not-selected" } mx-3 px-3 py-2 rounded`} onClick={() => selectRegion("Nassau")}>Nassau</div>
                    <div className={`${regionsSelection.includes("Northern") ? "circuit-selected" : "circuit-not-selected" } mx-3 px-3 py-2 rounded`} onClick={() => selectRegion("Northern")}>Northern</div>
                    <div className={`${regionsSelection.includes("Suffolk") ? "circuit-selected" : "circuit-not-selected" } mx-3 px-3 py-2 rounded`} onClick={() => selectRegion("Suffolk")}>Suffolk</div>
                    <div className={`${regionsSelection.includes("Western") ? "circuit-selected" : "circuit-not-selected" } mx-3 px-3 py-2 rounded`} onClick={() => selectRegion("Western")}>Western</div>
                    <div className={`${regionsSelection.includes("Old Fashioned") ? "circuit-selected" : "circuit-not-selected" } mx-5 px-3 py-2 rounded`} onClick={() => selectRegion("Old Fashioned")}>Old Fashioned</div>
                    <div className={`${regionsSelection.includes("Junior") ? "circuit-selected" : "circuit-not-selected" } mx-5 px-3 py-2 rounded`} onClick={() => selectRegion("Junior")}>Juniors</div>
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


