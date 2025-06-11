import * as React from "react";
import { useEffect, useState } from "react";
import { Tournament } from "../types/types"; 
import ScheduleEntry from "../Components/ScheduleEntry"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faFlagUsa, faPersonRunning, faTruckPickup } from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";

declare var SERVICE_URL: string;

interface ScheduleProp {
    year: number;
    bgColorClass: string; 
}


export default function Schedule(props:ScheduleProp) {

    const [tournaments, setTournaments] = useState<Tournament[]>([]); 
    const [filteredRows, setFilteredRows ] = useState<Tournament[]>([]); 
    const [region, setRegion ] = useState<string>(""); 
    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 
    const [showFilters, setShowFilters] = useState(false); 

    const fetchTournaments = () => {
        fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?years=${props.year}`)
        .then(response => response.json())
        .then(data => {
            data = data.sort((a:Tournament,b:Tournament) => new Date(a.date) < new Date(b.date) ? -1 : 1)
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
            console.log(err)
            setErrorLoading(true); 
        })
    }

    function filterTournaments(){
        if(!region) setFilteredRows(tournaments); 
        else {
            let result = tournaments.filter((el:Tournament) => {
                const isMotorized = el.nassauSchedule || el.northernSchedule || el.suffolkSchedule || el.westernSchedule; 
                const drillClass = el.isParade ? "Parade" : 
                    isMotorized ? 'Motorized' : 
                    el.liOfSchedule ? 'Old Fashioned' : 
                    el.juniorSchedule ? 'Junior' : ""
                return drillClass === region; 
            })
            setFilteredRows(result);     
        }
    }

    const showOf = tournaments.some(el => el.liOfSchedule)
    const showJunior = tournaments.some(el => el.juniorSchedule); 
    const showParade = tournaments.some(el => el.isParade)

    const handleSelection = (newRegion: string) => {
        if(region === newRegion) setRegion(""); 
        else setRegion(newRegion); 
    }

    useEffect(() => {
        fetchTournaments(); 
    }, []); 

    useEffect(() => {
        filterTournaments(); 
    }, [region]); 


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
            <div className="d-flex flex-column align-items-end pt-2">
                {
                    !showFilters ? 
                        <button data-type="button" className="btn filter-icon-bg d-flex justify-content-center align-items-center  me-1" onClick={() => setShowFilters(true)}>
                            <FontAwesomeIcon icon={faFilter} size="lg" className="mx-2"/> 
                        </button> : 

                        <div className="width-50 d-flex flex-column justify-content-center align-content-end bg-light rounded shadow-sm py-2">
                            <div className="d-flex justify-content-end mb-2">
                            </div>
                            <div className="d-flex justify-content-end align-items-center mx-1 flex-wrap">
                                <div className="font-large p-2 m-1">Filter Events</div>
                                <div className="flex-grow-1" />
                                <div className={`${region === "Motorized" ? "circuit-selected" : "circuit-not-selected" } font-small p-2 m-1 rounded`} onClick={() => handleSelection("Motorized")}>
                                    <FontAwesomeIcon icon={faTruckPickup} className="me-1" size="sm"/>
                                    Motorized
                                </div>
                                {
                                    showOf &&
                                        <div className={`${region === "Old Fashioned" ? "circuit-selected" : "circuit-not-selected" } font-small mx-1 my-1 px-2 py-2 rounded`} onClick={() => handleSelection("Old Fashioned")}>
                                            <FontAwesomeIcon icon={faPersonRunning} className="me-1" size="sm"/>
                                            Old Fashioned
                                        </div>
                                }
                                {
                                    showJunior &&
                                        <div className={`${region === "Junior" ? "circuit-selected" : "circuit-not-selected" } font-small mx-1 my-1 px-2 py-2 rounded`} onClick={() => handleSelection("Junior")}>
                                            <FontAwesomeIcon icon={faPersonRunning} className="me-1" size="xs"/>
                                            Junior
                                        </div>
                                }
                                {
                                    showParade &&
                                        <div className={`${region === "Parade" ? "circuit-selected" : "circuit-not-selected" } font-small mx-1 my-1 px-3 py-2 rounded`} onClick={() => handleSelection("Parade")}>
                                            <FontAwesomeIcon icon={faFlagUsa} className="me-1" size="sm"/>
                                            Parade
                                        </div>    
                                }
                            </div>
                        </div>
                }
                <div className="pb-2 w-100">
                    {filteredRows.map(el => {
                        return <ScheduleEntry key={el.id} tournament={el} bgColorClass={props.bgColorClass}/>
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


