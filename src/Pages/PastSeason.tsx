import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tournament } from "../types/types";
import Big8 from "../Components/Big8"; 
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
                <div className="col-12 text-center mt-3 mb-4 p-2 "><h3>Year in Review: {year}</h3></div>
            </div>
            <Big8 year={yearNum}/>
            <Schedule year={yearNum} />
        </div>
    )
}


