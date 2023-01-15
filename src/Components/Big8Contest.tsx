import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils";

import Image from "react-bootstrap/Image"; 
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
                <h5 className="text-center">{run?.contest ? run.contest == 'Three Man Ladder' ? '3 Man Ladder' : run.contest : ''}</h5>
                <div className="d-flex flex-column align-items-center justify-content-center">
                    <div className="row">
                        <div className="col-5 col-sm-2 col-md-3 col-lg-4 col-xxl-3"></div>
                        <div className="col-2 col-sm-8 col-md-6 col-lg-4 col-xxl-6 height-70 d-flex align-items-center justify-content-center">{run?.team ? <Image src={getImgLocation(run.team)} fluid={true} /> : <></>}</div>
                        <div className="col-5 col-sm-2 col-md-3 col-lg-4 col-xxl-3"></div>
                    </div>
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


