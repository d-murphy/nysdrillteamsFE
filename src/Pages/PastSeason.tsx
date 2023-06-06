import * as React from "react";
import { useParams, Link } from "react-router-dom";
import Big8 from "../Components/Big8";
import StateWinners from "../Components/StateWinners";
import TotalPoints from "../Components/TotalPoints"; 
import Schedule from "./Schedule";

interface PastSeasonProp {
    year: number;
}


export default function PastSeasons() {

    let params = useParams();
    const year = params.id
    const yearNum = parseInt(year); 
    
    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="text-left track-name-bg-color track-name-color p-4 mt-3 rounded"><h3>Year in Review: {year}</h3></div>
                </div>
            </div>
            <div className="bg-lightgray rounded shadow-sm">
                <StateWinners year={year} />
            </div>
            <div className="bg-lightgray rounded shadow-sm">
                <Big8 year={yearNum}/>
            </div>
            <div className="bg-lightgray rounded shadow-sm">
                <TotalPoints year={yearNum} headingAligned={true}/>
            </div>
            <div className="mt-2 bg-lightgray px-2 pt-3 rounded shadow-sm">
                <div className="h4">Schedule</div>
                <Schedule year={yearNum} bgColorClass='big8-bg'/>
            </div>
            
        </div>
    )
}


