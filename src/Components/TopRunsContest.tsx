import * as React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import timeUtil from "../utils/timeUtils";
import { useNavigate } from "react-router-dom";


import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils"; 

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
            <div className="bg-white shadow-sm rounded my-2 text-center p-2 my-2 mx-1">
                <h3 className="my-3">{contestName}</h3>
                {runs.map(el => {
                    return (
                        <div className="row border-top py-2">
                            <div className="col-3 d-flex align-items-center justify-content-center">
                                <h4><b>{timeUtil.niceTime(el.timeNum)}</b></h4>
                            </div>
                            <div className="col-2">
                                <div>
                                    {   
                                    el.urls.length ? 
                                        el.urls.map(url => {
                                            return (
                                                <div className="video-icon">
                                                    <a href={`${url}`} target="_blank"><FontAwesomeIcon icon={faVideo} /></a>
                                                </div>  
                                            )
                                        }) : <></>
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


