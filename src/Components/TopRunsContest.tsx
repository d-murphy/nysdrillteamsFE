import * as React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faSquareYoutube } from '@fortawesome/free-brands-svg-icons'
import { niceTime } from "../utils/timeUtils";
import { useNavigate } from "react-router-dom";


import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils"; 
import StateRecordIcon from "./StateRecordIcon";

interface TopRunsContestProp {
    runs: Run[]
    name: string
}


export default function TopRunsContest(props:TopRunsContestProp) {
    const runs = props.runs;
    const contestName = props.name

    const navigate = useNavigate(); 

    
    return (
        <div className="col-12 col-lg-6">
            <div className="bg-white shadow-sm rounded text-center p-2 my-2 mx-1">
                <h3 className="my-3">{contestName}</h3>
                {runs.map(el => {
                    return (
                        <div className="row border-top py-2">
                            <div className="col-3 d-flex align-items-center justify-content-center">
                                <div className="font-x-large mx-1"><b>{niceTime(el.timeNum)}</b></div>
                            </div>
                            <div className="col-2">
                                <div className="h-100 d-flex justify-content-center align-items-center">
                                    {   
                                    el.urls.length ? 
                                        el.urls.map(url => {
                                            return (
                                                <div className="video-icon">
                                                    <a href={`${url}`} target="_blank"><FontAwesomeIcon className="video-links" icon={faSquareYoutube} size='lg'/></a>
                                                </div>  
                                            )
                                        }) : <></>
                                    }
                                    {
                                        el?.stateRecord || el?.currentStateRecord ? 
                                            <span className="mx-1"><StateRecordIcon run={el} size="lg" /></span> : <></>
                                    }
                                </div>
                            </div>
                            <div className="col-7">
                                <div className="row">
                                    <div className="col-12 text-center">
                                        <h6>{el.team}</h6>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12 text-center fw-lighter past-tourn-entry" onClick={() => navigate(`/Tournament/${el.tournamentId}`)}>
                                        {dateUtil.getMMDDYYYY(el.date) } - {el.tournament}
                                    </div>
                                </div>
                            </div>   
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


