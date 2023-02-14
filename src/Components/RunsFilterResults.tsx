import * as React from "react";
import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils";
import { niceTime } from "../utils/timeUtils";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import StateRecordIcon from "./StateRecordIcon";

interface RunFilterResultsProps {
    runs: Run[];
    page: number; 
    maxPage: number; 
}

export default function RunFilterResults(props:RunFilterResultsProps) {
    const runs = props.runs;
    const page = props.page; 
    const maxPage = props.maxPage

    const navigate = useNavigate(); 
    

     return (
        <div className="bg-white rounded px-4 m-2">
            <div>Page: {page} of {maxPage}</div>
            {runs ? runs.map(run => {
                    return (
                        <div className="row w-100 border-bottom">
                            <div className="col-12 col-lg-1">
                                {dateUtil.getMMDDYYYY(run.date)}
                            </div>
                            <div className="col-12 col-lg-3">
                                {run.team}
                            </div>
                            <div className="col-12 col-lg-4">
                                <span className="pointer" onClick={() => { 
                                    navigate(`/Tournament/${run.tournamentId}`)
                                }}>{run.tournament} @ {run.track}</span>
                                
                            </div>
                            <div className="col-12 col-lg-1">
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
                            <div className="col-12 col-lg-1">
                                {getRankStr(parseInt(run.rank))} - {run.points} pts
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
    return lu[num]; 
}

