import * as React from "react";
import { useState, useEffect, SetStateAction } from "react";
import { URLSearchParamsInit } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faX } from '@fortawesome/free-solid-svg-icons'; 
import { Team, Track } from "../types/types";
import ContestOptions from "./adminTournamentsComps/ContestOptions";

declare var SERVICE_URL: string;

interface RunsFilterProp {
    setTeams: React.Dispatch<SetStateAction<string[]>>
    setTournaments: React.Dispatch<SetStateAction<string[]>>
    setTracks: React.Dispatch<SetStateAction<string[]>>
    setYears: React.Dispatch<SetStateAction<number[]>>
    setContests: React.Dispatch<SetStateAction<string[]>>
    setPositions: React.Dispatch<SetStateAction<number[]>>
    setLoading: React.Dispatch<SetStateAction<boolean>>
    setSearchParams: (nextInit: URLSearchParamsInit, navigateOptions?: {
        replace?: boolean;
        state?: any;
    }) => void
}

export default function RunsFilter(props:RunsFilterProp) {

    const [yearsForFilter, setYearsForFilter] = useState<number[]>([]); 
    const [teamsForFilter, setTeamsForFilter] = useState<string[]>([]); 
    const [tournamentsForFilter, setTournamentsForFilter] = useState<string[]>([]); 
    const [tracksForFilter, setTrackForFilter] = useState<string[]>([]); 
    const [filterValsLoaded, setFilterValsLoaded] = useState<boolean>(false);

    const [yearsSelected, setYearsSelected] = useState<number[]>([]); 
    const [teamsSelected, setTeamsSelected] = useState<string[]>([]); 
    const [tournamentsSelected, setTournamentsSelected] = useState<string[]>([]); 
    const [tracksSelected, setTrackSelected] = useState<string[]>([]); 
    const [contestsSelected, setContestsSelected] = useState<string[]>([]); 
    const [positionsSelected, setPositionsSelected] = useState<number[]>([]); 

    useEffect(() => {
        getAllItemsForFilter().then(()=> {
            setFilterValsLoaded(true); 
        })
    }, []); 

    const handleSubmit = () => {
        props.setLoading(true); 
        props.setYears(yearsSelected); 
        props.setTeams(teamsSelected); 
        props.setTournaments(tournamentsSelected); 
        props.setTracks(tracksSelected); 
        props.setContests(contestsSelected); 
        props.setPositions(positionsSelected); 
        let paramsObj: {years?:string, teams?: string, tracks?:string, contests?:string, tournaments?: string, positions?: string} = {}; 
        if(yearsSelected.length) paramsObj.years = yearsSelected.join(",") 
        if(teamsSelected.length) paramsObj.teams = teamsSelected.join(",")
        if(tracksSelected.length) paramsObj.tracks = tracksSelected.join(",")
        if(contestsSelected.length) paramsObj.contests = contestsSelected.join(","); 
        if(tournamentsSelected.length) paramsObj.tournaments = tournamentsSelected.join(","); 
        if(positionsSelected.length) paramsObj.positions = positionsSelected.join(","); 
        props.setSearchParams(paramsObj)
    }

    return (
        <div className="container">
            <div className="text-center w-100 font-x-large m-2"><b>Run Search</b></div>
            {
            !filterValsLoaded ? 
                <div className="row mt-1 mb-5">
                    <div className="col-12 d-flex flex-column align-items-center mt-5">
                        <div className="spinner-border text-secondary" role="status"></div>
                    </div>
                </div>
                :
                <div className="mt-3 bg-white rounded shadow-sm">

                    <div className="row">
                        <div className="col-12">
                            <div className="d-flex justify-content-center align-items-center mt-4">
                                <i>Add filters to find runs from past seasons.</i>
                            </div>
                        </div>
                    </div>

                    <div className="row my-5 mx-3">
                        <div className="col-12 col-lg-4">
                            <div className="d-flex align-items-center justify-content-start">
                                <label htmlFor="contestsFilter" className="form-label mt-2">Contests</label>
                                <span className="ms-3" ><ClearSelect arr={contestsSelected} stateSetter={setContestsSelected}/></span>
                            </div>
                            <select className={`form-control ${contestsSelected.length? 'search-select' : 'search-select-blank'}`} id="contestsFilter" multiple
                                onChange={(e) => {handleMultiSelect<string>(e, setContestsSelected)}}>
                                <ContestOptions />
                            </select>
                        </div>

                        <div className="col-12 col-lg-4">
                            <div className="d-flex align-items-center justify-content-start">
                                <label htmlFor="positionsFilter" className="form-label mt-2">Position</label>
                                <span className="ms-3" ><ClearSelect arr={positionsSelected} stateSetter={setPositionsSelected}/></span>
                            </div>
                            <select className={`form-control ${positionsSelected.length? 'search-select' : 'search-select-blank'}`} id="positionsFilter" multiple
                                onChange={(e) => {handleMultiSelect<number>(e, setPositionsSelected)}}>
                                    <option value={1}>1st Place</option>
                                    <option value={2}>2nd Place</option>
                                    <option value={3}>3rd Place</option>
                                    <option value={4}>4th Place</option>
                                    <option value={5}>5th Place</option>
                            </select>
                        </div>
  
                        <div className="col-12 col-lg-4">
                            <div className="d-flex align-items-center justify-content-start">
                                <label htmlFor="teamsFilter" className="form-label mt-2">Teams</label>
                                <span className="ms-3" ><ClearSelect arr={teamsSelected} stateSetter={setTeamsSelected}/></span>
                            </div>
                            <select className={`form-control ${teamsSelected.length? 'search-select' : 'search-select-blank'}`} id="teamsFilter" multiple
                                onChange={(e) => {handleMultiSelect<string>(e, setTeamsSelected)}}>
                                {
                                    teamsForFilter.map(el => {
                                        return <option value={el}>{el}</option>
                                    })
                                }
                            </select>
                        </div>
                        <div className="col-12 col-lg-4">
                            <div className="d-flex align-items-center justify-content-start">
                                <label htmlFor="tournamentsFilter" className="form-label mt-2">Tournaments</label>
                                <span className="ms-3" ><ClearSelect arr={tournamentsSelected} stateSetter={setTournamentsSelected}/></span>
                            </div>
                            <select className={`form-control ${tournamentsSelected.length? 'search-select' : 'search-select-blank'}`} id="tournamentsFilter" multiple
                                onChange={(e) => {handleMultiSelect<string>(e, setTournamentsSelected)}}>
                                {
                                    tournamentsForFilter.map(el => {
                                        return <option value={el}>{el}</option>
                                    })
                                }
                            </select>
                        </div>
                        <div className="col-12 col-lg-4">
                            <div className="d-flex align-items-center justify-content-start">
                                <label htmlFor="tracksFilter" className="form-label mt-2">Tracks</label>
                                <span className="ms-3" ><ClearSelect arr={tracksSelected} stateSetter={setTrackSelected}/></span>
                            </div>
                            <select className={`form-control ${tracksSelected.length? 'search-select' : 'search-select-blank'}`} id="tracksFilter" multiple value={tracksSelected}
                                onChange={(e) => {handleMultiSelect<string>(e, setTrackSelected)}}>
                                {
                                    tracksForFilter.map(el => {
                                        return <option value={el}>{el}</option>
                                    })
                                }
                            </select>
                        </div>
                        <div className="col-12 col-lg-4">
                            <div className="d-flex align-items-center justify-content-start">
                                <label htmlFor="yearsFilter" className="form-label mt-2">Years</label>
                                <span className="ms-3" ><ClearSelect arr={yearsSelected} stateSetter={setYearsSelected}/></span>
                            </div>
                            <select className={`form-control ${yearsSelected.length? 'search-select' : 'search-select-blank'}`} id="yearsFilter" multiple
                                onChange={(e) => {handleMultiSelect<number>(e, setYearsSelected)}}>
                                {
                                    yearsForFilter.map(el => {
                                        return <option value={el}>{el}</option>
                                    })
                                }
                            </select>
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
    );

    async function getAllItemsForFilter(){

        return Promise.all([
            getYearsForFilter(setYearsForFilter), 
            getTeamsForFilter(setTeamsForFilter), 
            getTracksForFilter(setTrackForFilter), 
            getTournamentsForFilter(setTournamentsForFilter)
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

async function getTournamentsForFilter(stateSetter:Function){
    fetch(`${SERVICE_URL}/tournaments/getTournamentNames`)
        .then(response => response.json())
        .then(data => {
            data = data
                .map((el:{_id: string, nameCount: number}) => el._id)
                .sort((a:string, b:string) => a < b ? -1 : 1)
            stateSetter(data); 
        })
        .catch(err => {
            console.log(err)
            stateSetter([])
        })
}


function handleMultiSelect<T>(e:any, setState:React.Dispatch<T[]>){
    var options = e.target.options; 
    var value: T[] = [];
    for (var i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      setState(value); 
}

interface ClearSelectProps<T> {
    arr: T[], 
    stateSetter: React.Dispatch<SetStateAction<T[]>>
}

function ClearSelect<T>(props:ClearSelectProps<T>): React.ReactElement {
    if(!props.arr.length) return <></>
    return(
        <span onClick={() => props.stateSetter([])} className="font-x-small pointer">{`${props.arr.length} Selected`} - Clear <FontAwesomeIcon icon={faX} /></span>
    )
}