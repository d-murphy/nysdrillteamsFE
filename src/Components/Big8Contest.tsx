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
        <div className="col big8-bg rounded m-1 px-2 pt-3 pb-1 d-flex flex-column align-items-start justify-content-start text-center big8-contest"
            onClick={() => {
                if(run.tournamentId) navigate(`/Tournament/${run.tournamentId}`); 
            }}    
        >
            <h5 className="text-start">{run?.contest ? run.contest == 'Three Man Ladder' ? '3 Man Ladder' : run.contest : ''}</h5>
            <h4 className="mb-2">{run?.time ? run.time : ''}</h4>
            <div className="d-flex flex-row align-items-center justify-content-center mb-3">
                <div className="text-start">
                    <div className="font-small">
                        {run?.team ? `${run.team}` : <Placeholder animation="glow" className="w-100" />}
                    </div>
                    <div className="text-start font-xx-small ">{run?.tournament ? `@ ${run.tournament}` : <Placeholder animation="glow" className="w-100" />}</div>
                </div>
                <div className="w-75">{run?.team ? <Image src={getImgLocation(run.team)} fluid={true} /> : <Placeholder animation="glow" className="w-100"/>}</div>
            </div>
            <div className="text-center mt-auto font-small ">
                {dateStr ? `${dateStr}` : <Placeholder animation="glow" className="w-100" />} 
            </div>
        </div>
        )
}


