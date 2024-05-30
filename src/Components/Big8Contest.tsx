import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils";
import { niceTime } from "../utils/timeUtils";


import { SizedImage } from "./SizedImage";
import getImgLocation from "../utils/imgLU";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faSquareYoutube } from '@fortawesome/free-brands-svg-icons'
import StateRecordIcon from "./StateRecordIcon";



interface Big8ContestProp {
    run: Run;
}

export default function Big8Contest(props:Big8ContestProp) {
    const run = props.run;
    let dateStr:string = run ? dateUtil.getMMDDYYYY(run.date) : '' ;  
    const navigate = useNavigate(); 

     return (
        <>
        {
            !run ?
                <></> :  
                <div className="col-xs-12 col-sm-3 col-xxl">
                <div className="big8-bg rounded shadow-sm d-flex flex-column align-items-center justify-content-start text-center py-1 px-2 h-100" > 
                    <div className="text-center text-nowrap text-truncate h5 w-100">{run?.contest ? run.contest == 'Three Man Ladder' ? '3 Man Ladder' : run.contest : ''}</div>
                    <div className="d-flex flex-column align-items-center justify-content-center">
                            <SizedImage imageSrc={getImgLocation(run?.team || "")} size="md"/> 
                        <div className="font-small">
                            {run?.team ? `${run.team}` : ""}
                        </div>
                    </div>
                    <div className="flex-grow-1 minheight-10"></div>
                    <div>
                        <div className="d-flex flex-row align-items-end justify-content-center ">
                            <div className="d-flex flex-column align-items-start mb-1">
                                <div className="font-xx-small text-start pointer" onClick={() => {
                                        if(run.tournamentId) navigate(`/Tournament/${run.tournamentId}`); 
                                    }}>
                                    {run?.tournament ? `${run.tournament}` : ""}
                                </div>
                                <div className="font-xx-small text-start">
                                    {dateStr ? `${dateStr}` : ""}
                                    {
                                        run?.urls && run.urls.length ? 
                                            <span className="ms-2">
                                                <a href={run.urls[0]} target="_blank"><FontAwesomeIcon className="video-links" icon={faSquareYoutube} size="lg" /></a>
                                            </span> : <></>
                                    }
                                    {
                                        run?.stateRecord || run?.currentStateRecord ? 
                                            <span className="ms-1"><StateRecordIcon run={run} size="lg" /></span> : <></>
                                    }
                                </div>
                            </div>
                            <h4 className="ms-2">{run?.time ? niceTime(run.time) : ''}</h4>
                        </div>
                    </div>
                </div>
            </div>
    
        }
        </>
        )
}