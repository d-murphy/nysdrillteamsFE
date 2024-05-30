import * as React from "react";
import TotalPoints from "../Components/TotalPoints";

declare var SERVICE_URL: string;



export default function CurrentYearTotalPoints() {

    const year = new Date() < new Date(`5/30/${new Date().getFullYear()}`) ? new Date().getFullYear() -1  : new Date().getFullYear(); 

    return (
        <div className="container">
            <div className="text-center w-100 font-x-large m-2"><b>Total Points for {year}</b></div>
            <div className="bg-lightgray rounded shadow-sm min-loading-height mb-2">
                <TotalPoints year={year} headingAligned={false}/>
            </div>
        </div>
    )
}