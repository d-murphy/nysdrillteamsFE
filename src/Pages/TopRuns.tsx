import * as React from "react";
import { useState } from "react";
import { useSearchParams } from 'react-router-dom'
import TopRuns from "../Components/TopRuns"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faFilter} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";



export default function RunSearch() {

    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate(); 
    
    return (
        <div className="container">
            <div className="text-center w-100 font-x-large m-2"><b>Top 10 Runs in Each Contest</b></div>
            <div className="w-100 d-flex justify-content-end">
                <button data-type="button" className="btn filter-icon-bg d-flex justify-content-center align-items-center me-1" onClick={() => navigate("/RunSearch")}>
                            <FontAwesomeIcon icon={faFilter} size="lg" className="m-2"/> 
                            <div>Search More</div>
                </button>
            </div>
            <div className="w-100">
                <TopRuns teams={[]} years={[]} tracks={[]} setLoading={setLoading} loading={loading}/>
            </div>
        </div>
    )
}


