import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils";

import Image from "react-bootstrap/Image"; 
import getImgLocation from "../utils/imgLU";

interface Big8ContestProp {
    run: Run;
    optionalRow?: null | 'hometown'; 
    lastRow: 'hometown' | 'date'; 
}

export default function Big8Contest(props:Big8ContestProp) {
    const run = props.run;
    let key: 'hometown' | 'date' = props.lastRow;  
    let lastRow:string; 
    if(key =='date'){
        lastRow = run ? dateUtil.getMMDDYYYY(run[key]) : '' ; 
    } else {
        lastRow = run ? run[key] : ''; 
    }
    let optionalRow: null | string = props.optionalRow && run ? run[props.optionalRow] : null; 
    const navigate = useNavigate(); 

     return (
        <div className="col big8-bg rounded m-1 px-2 py-3 d-flex flex-column align-items-center justify-content-between text-center big8-contest"
            onClick={() => {
                if(run.tournamentId) navigate(`/Tournament/${run.tournamentId}`); 
            }}    
        >
            <h5>{run?.contest ? run.contest == 'Three Man Ladder' ? '3 Man Ladder' : run.contest : ''}</h5>
            <h4>{run?.time ? run.time : ''}</h4>
            {optionalRow ? <span>{optionalRow}</span> : <></>}
            <span>{lastRow}</span>
            { 
                run?.team && getImgLocation(run.team) ? 
                    <Image src={getImgLocation(run.team)} fluid={true} /> : <></>
            }
        </div>
        )
}


