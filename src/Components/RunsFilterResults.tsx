import * as React from "react";
import { Run } from "../types/types"; 
import dateUtil from "../utils/dateUtils";
import { niceTime } from "../utils/timeUtils";

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

     return (
        <div className="">
            <div>Page: {page} of {maxPage}</div>
            {runs.map(el => {
                return (
                    <div>{`${el.date} - ${el.team} - ${el.time} - ${el.tournament} @ ${el.track}`}</div>
                )
            })}
        </div>
        )
}


