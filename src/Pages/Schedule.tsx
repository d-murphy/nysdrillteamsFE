import * as React from "react";
import { useEffect, useState } from "react";
import { Tournament } from "../types/types"; 
import ScheduleEntry from "../Components/ScheduleEntry"; 

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
        fetch(`http://localhost:4400/tournaments/getFilteredTournaments?years=${props.year}`)
        .then(response => response.json())
        .then(data => {
            data = data.sort((a:Tournament,b:Tournament) => a.date < b.date ? -1 : 1)
            data = data.map((el:Tournament) => {
                return {
                    ...el, 
                    date: new Date(el.date)
                }
            })
            console.log(data); 
            setTournaments(data); 
            setFilteredRows(data); 
            setLoading(false);
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
                removeRegion(region); 
            } else {
                let currentSelected = regionsSelection; 
                currentSelected.push(region); 
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
        setRegionsSelected([...currentSelected]); 
    }

    function filterTournaments(){
        if(!regionsSelection.length) {
            setFilteredRows(tournaments); 
            return; 
        }
        let result = tournaments.filter((el:Tournament) => {
            let overlapFound = false; 
            if(regionsSelection.includes("Nassau") && el.nassauSchedule) overlapFound = true; 
            if(regionsSelection.includes("Suffolk") && el.suffolkSchedule) overlapFound = true; 
            if(regionsSelection.includes("Northern") && el.northernSchedule) overlapFound = true; 
            if(regionsSelection.includes("Western") && el.westernSchedule) overlapFound = true; 
            if(regionsSelection.includes("Old Fashioned") && el.liOfSchedule) overlapFound = true; 
            if(regionsSelection.includes("Junior") && el.juniorSchedule) overlapFound = true; 
            return overlapFound; 
        })
        setFilteredRows(result); 
    }


    useEffect(() => {
        fetchTournaments(); 
    }, []); 

    useEffect(() => {
        filterTournaments(); 
    }, [regionsSelection]); 


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
                <div className="d-flex justify-content-center flex-wrap align-content-center mt-4 mb-3 px-5">
                    <div className={`${!regionsSelection.length ? "circuit-selected" : "circuit-not-selected" } mx-5 px-3 py-2 rounded`} onClick={() => selectRegion("All Events")}>All Events</div>
                    <div className={`${regionsSelection.includes("Nassau") ? "circuit-selected" : "circuit-not-selected" } mx-1 px-3 py-2 rounded`} onClick={() => selectRegion("Nassau")}>Nassau</div>
                    <div className={`${regionsSelection.includes("Northern") ? "circuit-selected" : "circuit-not-selected" } mx-1 px-3 py-2 rounded`} onClick={() => selectRegion("Northern")}>Northern</div>
                    <div className={`${regionsSelection.includes("Suffolk") ? "circuit-selected" : "circuit-not-selected" } mx-1 px-3 py-2 rounded`} onClick={() => selectRegion("Suffolk")}>Suffolk</div>
                    <div className={`${regionsSelection.includes("Western") ? "circuit-selected" : "circuit-not-selected" } mx-1 px-3 py-2 rounded`} onClick={() => selectRegion("Western")}>Western</div>
                    <div className={`${regionsSelection.includes("Old Fashioned") ? "circuit-selected" : "circuit-not-selected" } mx-5 px-3 py-2 rounded`} onClick={() => selectRegion("Old Fashioned")}>OF</div>
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


