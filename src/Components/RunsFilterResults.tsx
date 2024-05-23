import * as React from "react";
import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils";
import { niceTime } from "../utils/timeUtils";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faArrowLeft, faArrowRight, faVideo } from '@fortawesome/free-solid-svg-icons'; 
import StateRecordIcon from "./StateRecordIcon";
import { TotalPointsOverrideMsg } from "./Scorecard";

interface RunFilterResultsProps {
    runs: Run[];
    page: number; 
    maxPage: number; 
    totalCt: number;
    setPage: React.Dispatch<React.SetStateAction<number>>; 
    loading: boolean; 
    noResults: boolean; 
}

export default function RunFilterResults(props:RunFilterResultsProps) {
    const runs = props.runs;
    const page = props.page; 
    const maxPage = props.maxPage; 
    const totalCt = props.totalCt; 
    const setPage = props.setPage; 
    const loading = props.loading; 
    const noResults = props.noResults; 

    const navigate = useNavigate(); 
    
    if(loading) return <div className="my-3"></div>
    if(noResults) return <div className="bg-white rounded m-2 p-3 text-center">No results from this search.</div>

    return (
        <div className="bg-white rounded m-2 p-3">
            <div className="w-100">
                <div className="d-flex justify-content-end align-items-center mx-2 mt-2 mb-4">
                    {totalCt.toLocaleString()} total runs - page {page} of {maxPage}
                </div>
                <div className="d-flex justify-content-end align-items-center mx-2 mt-2 mb-4">
                    {
                        page > 1 ? <span className="filter-next pointer mx-1" onClick={() => {setPage(page-1)}} ><FontAwesomeIcon icon={faArrowLeft} /> Previous Page</span> : <></>
                    }
                    {
                        page < maxPage ? <span className="filter-next pointer mx-1" onClick={() => {setPage(page+1)}}>Next Page <FontAwesomeIcon icon={faArrowRight} /></span> : <></>
                    }
                </div>

            </div>

            <div className="row border-bottom mx-2 my-1">

                <div className="d-xl-block d-none col-4">
                    <b>Date - Tournament</b>
                </div>
                <div className="d-xl-block d-none col-2">
                    <b>Team</b>
                </div>
                <div className="d-xl-block d-none col-2">
                    <b>Contest</b>
                </div>
                <div className="d-xl-block d-none col-1">
                    <div className="d-flex justify-content-start align-items-start h-100">
                        <b>Time</b>
                    </div>
                </div>
                <div className="d-xl-block d-none col-2 text-center">
                    <b>Place - Pts</b>
                </div>

                <div className="d-xl-block d-none col-1 pb-1">
                    <div className="d-flex justify-content-center align-items-center flex-wrap">
                        <b>Pts Drill?</b>
                    </div>
                </div>
            </div>



                {runs ? runs.map(run => {
                        return (
                            <div className="row border-bottom mx-2 my-1">

                                <div className="d-xl-block d-none col-4">
                                    <span className="pointer" onClick={() => { 
                                            navigate(`/Tournament/${run.tournamentId}`)
                                        }}>
                                            {dateUtil.getMMDDYYYY(run.date)} - {run.tournament} @ {run.track}
                                    </span>
                                </div>
                                <div className="d-block d-xl-none col-12 text-center">
                                    {dateUtil.getMMDDYYYY(run.date)}
                                </div>
                                <div className="d-block d-xl-none col-12 text-center">
                                    <span className="pointer" onClick={() => { 
                                            navigate(`/Tournament/${run.tournamentId}`)
                                        }}>{run.tournament} @ {run.track}</span>
                                </div>

                                <div className="d-xl-block d-none col-2">
                                    {run.team}
                                </div>
                                <div className="d-block d-xl-none col-12 text-center">
                                    {run.team}
                                </div>

                                <div className="d-xl-block d-none col-2">
                                    {run.contest}
                                </div>
                                <div className="d-block d-xl-none col-12 text-center">
                                    {run.contest}
                                </div>


                                <div className="d-xl-block d-none col-1">
                                    <div className="d-flex justify-content-start align-items-start h-100">
                                        <span className="">{niceTime(run.time)} </span>
                                        {   
                                            run.urls.length ? 
                                                <div className="pointer ms-2 me-1">
                                                    <a href={`${run.urls[0]}`} target="_blank"><FontAwesomeIcon className="video-links" icon={faVideo} size='sm'/></a>
                                                </div> : <></>
                                        }
                                        {
                                            run?.stateRecord || run?.currentStateRecord ? 
                                                <span className="mx-1"><StateRecordIcon run={run} size="sm" /></span> : <></>
                                        }
                                    </div>
                                </div>
                                <div className="d-block d-xl-none col-12">
                                    <div className="d-flex justify-content-center align-items-center h-100">
                                        <span className="font-large"><b>{niceTime(run.time)}</b></span>
                                        {   
                                            run.urls.length ? 
                                                <div className="pointer mx-2">
                                                    <a href={`${run.urls[0]}`} target="_blank"><FontAwesomeIcon className="video-links" icon={faVideo} size='sm'/></a>
                                                </div> : <></>
                                        }
                                        {
                                            run?.stateRecord || run?.currentStateRecord ? 
                                                <span className="mx-2"><StateRecordIcon run={run} size="sm" /></span> : <></>
                                        }
                                    </div>
                                </div>


                                <div className="col-12 col-xl-2 text-center">
                                    {
                                        `${parseInt(run.rank) ? getRankStr(parseInt(run.rank)) : ""}${parseInt(run.rank) && run.points ? " - " : ""}${run.points ? run.points + " pts" : ""}`
                                    }
                                    <span>{run?.totalPointsOverride ? <TotalPointsOverrideMsg value={run.totalPointsOverride} /> : <></>}</span>                    

                                </div>

                                <div className="col-12 col-xl-1 pb-1">
                                    <div className="d-flex flex-column justify-content-center align-items-center">
                                            {
                                                run?.nassauPoints || run?.suffolkPoints || run?.northernPoints || run?.westernPoints ||
                                                run?.nassauOfPoints || run?.suffolkOfPoints || run?.liOfPoints || run?.juniorPoints ?
                                                <div className="d-lg-none d-block font-small">Points Drill:</div> : <></>

                                            }

                                        <div className="d-flex justify-content-center align-items-center flex-wrap">
                                            {run?.nassauPoints ? <span className="badge bg-secondary mx-1 mt-1">Na</span> : ""}
                                            {run?.northernPoints ? <span className="badge bg-secondary mx-1 mt-1">No</span> : ""}
                                            {run?.suffolkPoints ? <span className="badge bg-secondary mx-1 mt-1">Su</span> : ""}
                                            {run?.westernPoints ? <span className="badge bg-secondary mx-1 mt-1">We</span> : ""}
                                            {run?.nassauOfPoints ? <span className="badge bg-searchpill-dark mx-1 mt-1">Na OF</span> : ""}
                                            {run?.suffolkOfPoints ? <span className="badge bg-searchpill-dark mx-1 mt-1">Su OF</span> : ""}
                                            {run?.liOfPoints ? <span className="badge bg-searchpill-dark mx-1 mt-1">LI OF</span> : ""}
                                            {run?.juniorPoints ? <span className="badge bg-info mx-1 mt-1">JR</span> : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : <></>
                }
        </div>
        )
}


function getRankStr(num: number):string{
    const lu: {[index:number]:string} = {
        1: "1st", 
        2: "2nd", 
        3: "3rd", 
        4: "4th", 
        5: "5th"
    }
    return lu[num] || "";  
}

