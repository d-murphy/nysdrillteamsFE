import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils";

import { SizedImage } from "./SizedImage";
import Placeholder from "react-bootstrap/Placeholder"; 
import getImgLocation from "../utils/imgLU";


interface Big8ContestProp {
    run: Run;
}

export default function Big8Contest(props:Big8ContestProp) {
    const run = props.run;
    let dateStr:string = run ? dateUtil.getMMDDYYYY(run.date) : '' ;  
    const navigate = useNavigate(); 

     return (
        <div className="col-xs-12 col-sm-3 col-xxl">
            <div className="big8-bg rounded d-flex flex-column align-items-center justify-content-start text-center big8-contest py-1 px-2 h-100" onClick={() => {
                if(run.tournamentId) navigate(`/Tournament/${run.tournamentId}`); 
            }}> 
                <div className="text-center text-nowrap text-truncate h5 w-100">{run?.contest ? run.contest == 'Three Man Ladder' ? '3 Man Ladder' : run.contest : ''}</div>
                <div className="d-flex flex-column align-items-center justify-content-center">
                    {run?.team ? <SizedImage imageSrc={getImgLocation(run.team)} size="md"/> : 
                        <Placeholder animation="glow" className="w-100" />
                    }
                    <div className="font-small">
                        {run?.team ? `${run.team}` : <Placeholder animation="glow" className="w-100" />}
                    </div>
                </div>
                <div className="flex-grow-1 minheight-10"></div>
                <div>
                    <div className="d-flex flex-row align-items-end justify-content-center ">
                        <div className="d-flex flex-column align-items-start mb-1">
                            <div className="font-xx-small text-start">
                                {run?.tournament ? `${run.tournament}` : <Placeholder animation="glow" className="w-100" />}
                            </div>
                            <div className="font-xx-small text-start">
                                {dateStr ? `${dateStr}` : <Placeholder animation="glow" className="w-100" />}
                            </div>
                        </div>
                        <h4 className="ms-2">{run?.time ? run.time : ''}</h4>
                    </div>
                </div>
            </div>
        </div>
        )
}


