import * as React from "react";
import { useState, useEffect, SetStateAction } from "react";
import { URLSearchParamsInit } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faFilter} from '@fortawesome/free-solid-svg-icons'
import { Team, Track } from "../types/types";

declare var SERVICE_URL: string;

interface RunsFilterProp {
    setTeams: React.Dispatch<SetStateAction<string[]>>
    setTracks: React.Dispatch<SetStateAction<string[]>>
    setYears: React.Dispatch<SetStateAction<number[]>>
    setLoading: React.Dispatch<SetStateAction<boolean>>
    setSearchParams: (nextInit: URLSearchParamsInit, navigateOptions?: {
        replace?: boolean;
        state?: any;
    }) => void
}

export default function RunsFilter(props:RunsFilterProp) {

    const [yearsForFilter, setYearsForFilter] = useState<number[]>([]); 
    const [teamsForFilter, setTeamsForFilter] = useState<string[]>([]); 
    const [tracksForFilter, setTrackForFilter] = useState<string[]>([]); 
    const [filterValsLoaded, setFilterValsLoaded] = useState<boolean>(false);

    const [yearsSelected, setYearsSelected] = useState<number[]>([]); 
    const [teamsSelected, setTeamsSelected] = useState<string[]>([]); 
    const [tracksSelected, setTrackSelected] = useState<string[]>([]); 


    useEffect(() => {
        getAllItemsForFilter().then(()=> {
            setFilterValsLoaded(true); 
        })
    }, []); 

    const handleSubmit = () => {
        props.setLoading(true); 
        props.setYears(yearsSelected); 
        props.setTeams(teamsSelected); 
        props.setTracks(tracksSelected); 
        let paramsObj: {years?:string, teams?: string, tracks?:string} = {}; 
        if(yearsSelected.length) paramsObj.years = yearsSelected.join(",") 
        if(teamsSelected.length) paramsObj.teams = teamsSelected.join(",")
        if(tracksSelected.length) paramsObj.tracks = tracksSelected.join(",")
        props.setSearchParams(paramsObj)
    }

    return (
        <div>
            <div className="row">
                <div className="col-2"></div>
                <div className="col-8 text-center my-4"><h3>Top Runs in Each Contest</h3></div>
                <div className="col-2 d-flex justify-content-center align-items-center">
                    <div className="my-3">
                        <button data-type="button" data-bs-toggle="collapse" data-bs-target="#toggleFilter" className="btn filter-icon-bg d-flex flex-column justify-content-center align-items-center">
                            <FontAwesomeIcon icon={faFilter} size="2x" className="mx-4 my-2"/> 
                            <div>Run Search</div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="collapse" id="toggleFilter">
                {/* <div className="card card-body mx-1 filter-bg border-0"> */}
                <div className="card card-body mx-1 mb-3">
                    {
                        !filterValsLoaded ? 
                            <div className="row mt-1 mb-5">
                                <div className="col-12 d-flex flex-column align-items-center mt-5">
                                    <div className="spinner-border text-secondary" role="status"></div>
                                </div>
                            </div>
                            :
                            <div className="mt-3">

                                <div className="row">
                                    <div className="col-12">
                                        <div className="d-flex justify-content-center align-items-center">
                                            <i>Add filters to see team records, track records and top runs from past seasons.</i>
                                        </div>
                                    </div>
                                </div>

                                <div className="row my-5 mx-3">  
                                    <div className="col-12 col-lg-4">
                                        <label htmlFor="yearsFilter" className="form-label">Years</label>
                                        <input className="form-control" list="yearsOptions" id="yearsFilter" placeholder="Type to search..." 
                                            onChange={e => {
                                                let valueToSet = e.target.value ? [parseInt(e.target.value)] : []; 
                                                setYearsSelected(valueToSet)
                                                }
                                            } />
                                        <datalist id="yearsOptions">
                                            {
                                                yearsForFilter.map((el:number) => {
                                                    return <option value={el}/>
                                                })
                                            }
                                        </datalist>
                                    </div>
                                    <div className="col-12 col-lg-4">
                                        <label htmlFor="teamsFilter" className="form-label">Teams</label>
                                        <input className="form-control" list="teamsOptions" id="teamsFilter" placeholder="Type to search..." 
                                            onChange={e => {
                                                let valueToSet = e.target.value ? [e.target.value] : []; 
                                                setTeamsSelected(valueToSet)
                                                }    
                                            }/>
                                        <datalist id="teamsOptions">
                                            {
                                                teamsForFilter.map(el => {
                                                    return <option value={el}/>
                                                })
                                            }
                                        </datalist>
                                    </div>
                                    <div className="col-12 col-lg-4">
                                        <label htmlFor="tracksFilter" className="form-label">Tracks</label>
                                        <input className="form-control" list="tracksOptions" id="tracksFilter" placeholder="Type to search..." 
                                            onChange={e => {
                                                let valueToSet = e.target.value ? [e.target.value] : [];
                                                setTrackSelected(valueToSet)
                                                }
                                            }
                                        />
                                        <datalist id="tracksOptions">
                                            {
                                                tracksForFilter.map(el => {
                                                    return <option value={el}/>
                                                })
                                            }
                                        </datalist>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center align-items-center mt-5 mb-3">  
                                    <button className="btn filter-submit" onClick={handleSubmit}>
                                        Submit
                                    </button>

                                </div>


                            </div>                  
                    }
                </div>
            </div>
        </div>
    );

    async function getAllItemsForFilter(){

        return Promise.all([
            getYearsForFilter(setYearsForFilter), 
            getTeamsForFilter(setTeamsForFilter), 
            getTracksForFilter(setTrackForFilter), 
        ])
    
    }
    
}


async function getTracksForFilter(stateSetter:Function){
    fetch(`${SERVICE_URL}/tracks/getTracks`)
        .then(response => response.json())
        .then(data => {
            data = data
                .map((el:Track) => el.name)
                .sort((a:string, b:string) => a < b ? -1 : 1)
            stateSetter(data); 
        })
        .catch(err => {
            console.log(err)
            stateSetter([])
        })
}

async function getTeamsForFilter(stateSetter:Function){
    fetch(`${SERVICE_URL}/teams/getTeams`)
        .then(response => response.json())
        .then(data => {
            data = data
                .filter((el:Team) => typeof(el?.fullName)=='string' && !el.fullName.includes("Jr."))
                .map((el:Team) => el.fullName)
                .sort((a:string, b:string) => a < b ? -1 : 1)
            stateSetter(data); 
        })
        .catch(err => {
            console.log(err)
            stateSetter([])
        })
}

async function getYearsForFilter(stateSetter:Function){
    fetch(`${SERVICE_URL}/tournaments/getTournsCtByYear`)
        .then(response => response.json())
        .then(data => {
            data = data
                .map((el:{_id: number, yearCount: number}) => el._id)
                .filter((el:number) => el && el <= new Date().getFullYear())
                .sort((a:number, b:number) => a < b ? -1 : 1)
            stateSetter(data); 
        })
        .catch(err => {
            console.log(err)
            stateSetter([])
        })
}