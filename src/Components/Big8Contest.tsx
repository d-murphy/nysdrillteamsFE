import * as React from "react";

import { Run } from "../types/types"; 

interface Big8ContestProp {
    run: Run;
}


export default function Big8Contest(props:Big8ContestProp) {
    const run = props.run;
    
    return (
        <div className="col big8-bg rounded m-1 px-2 py-3 d-flex flex-column align-items-center justify-content-between text-center">
            <h5>{run?.contest ? run.contest == 'Three Man Ladder' ? '3 Man Ladder' : run.contest : ''}</h5>
            <h4>{run?.time ? run.time : ''}</h4>
            <span>{run?.hometown ? run.hometown : ''}</span>
        </div>
        )
}


