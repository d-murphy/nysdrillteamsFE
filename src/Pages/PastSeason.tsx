import * as React from "react";
import { useParams } from "react-router-dom";
import Big8 from "../Components/Big8";
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
            <div className="bg-white">
                <Big8 year={yearNum}/>
            </div>
            <div className="bg-white">
                <TotalPoints year={yearNum}/>
            </div>
            <div className="mt-2 bg-white p-4">
                <div className="row">
                    <p><span className="h4 me-3">Schedule</span><i></i></p>
                </div>
                <Schedule year={yearNum} bgColorClass='big8-bg'/>
            </div>
            
        </div>
    )
}


