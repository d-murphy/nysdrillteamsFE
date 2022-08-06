import * as React from "react";

import { Run } from "../types/types"; 
import dateUtil  from "../utils/dateUtils"

// fix interface later, should be a run!

interface Big8ContestProp {
    run: {contest:string, time:string, team:string, tournament: string, date: string};
}


export default function Big8Contest(props:Big8ContestProp) {
    const run = props.run;
    
    return (
        <div className="col big8-bg rounded m-1 px-2 py-3 d-flex flex-column align-items-center justify-content-between text-center">
            <h5>{run.contest}</h5>
            <h4>{run.time}</h4>
            <span>{run.team}</span>
        </div>
        )
}


