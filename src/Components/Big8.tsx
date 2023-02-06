import * as React from "react";
import { useEffect, useState } from "react";
import dateUtil from "../utils/dateUtils"
import { Run } from "../types/types"
import Big8Contest from "../Components/Big8Contest"
import Big8ContestLoading from "./Big8ContestLoading";

interface Big8Prop {
    year?: number;
}

declare var SERVICE_URL: string;

export default function Big8(props:Big8Prop) {

    let big8Year = props.year ? props.year : new Date() < new Date(`6/15/${new Date().getFullYear()}`) ? new Date().getFullYear() -1  : new Date().getFullYear();  

    const [big8, setBig8] = useState<{_id:string, matched_doc:Run}[]>([]); 
    const [errorLoading, setErrorLoading] = useState(false); 
    const [isLoading, setIsLoading] = useState(true); 

    const fetchBig8 = () => {
        fetch(`${SERVICE_URL}/runs/getBig8?year=${big8Year}`)
        .then(response => response.json())
        .then(data => {
           setBig8(data); 
           setIsLoading(false); 
        })
        .catch(err => {
            console.log(err)
            setErrorLoading(true); 
            setIsLoading(false); 
        })
    }

    useEffect(() => {
        fetchBig8(); 
    }, []); 

    let content; 
    if(errorLoading) return <div></div>

    if(!isLoading){
        content = (
            <div className="col d-flex flex-column align-items-start py-3 m-2 ">
                <p><span className="h4 me-3">The Big 8</span>{`Top times from ${big8Year}'s motorized teams.`}</p>
                <div className="row w-100 g-1">
                    <Big8Contest run={getRun("Three Man Ladder", big8)} />
                    <Big8Contest run={getRun("B Ladder", big8)} />
                    <Big8Contest run={getRun("C Ladder", big8)} />
                    <Big8Contest run={getRun("C Hose", big8)} />
                    <Big8Contest run={getRun("B Hose", big8)} />
                    <Big8Contest run={getRun("Efficiency", big8)} />
                    <Big8Contest run={getRun("Motor Pump", big8)} />
                    <Big8Contest run={getRun("Buckets", big8)} />
                </div>
            </div>
        )
    } else {
        content = (
            <div className="col d-flex flex-column align-items-start p-3 m-2 ">
                <p><span className="h4 me-3">The Big 8</span>{`Top times from ${big8Year}'s motorized teams.`}</p>
                <div className="row w-100 g-1">
                    <Big8ContestLoading />
                    <Big8ContestLoading />
                    <Big8ContestLoading />
                    <Big8ContestLoading />
                    <Big8ContestLoading />
                    <Big8ContestLoading />
                    <Big8ContestLoading />
                    <Big8ContestLoading />
                </div>
            </div>
        )

    }

    
    return ( content )
}

function getRun(contestName:string, big8arr:{_id: string, matched_doc: Run}[]){
    let result = big8arr.find(el => {
        return el._id == contestName;  
    })
    return result?.matched_doc
}