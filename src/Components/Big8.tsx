import * as React from "react";
import { useEffect, useState } from "react";
import dateUtil from "../utils/dateUtils"
import { Run } from "../types/types"
import Big8Contest from "../Components/Big8Contest"

interface Big8Prop {
    year?: number;
}

declare var SERVICE_URL: string;

export default function Big8(props:Big8Prop) {

    let big8Year = props.year ? props.year : new Date() < new Date(`6/15/${new Date().getFullYear()}`) ? new Date().getFullYear() -1  : new Date().getFullYear();  
    console.log('year for big 8: ', big8Year); 

    const [big8, setBig8] = useState<{_id:string, matched_doc:Run}[]>([]); 
    const [errorLoading, setErrorLoading] = useState(false); 

    const fetchBig8 = () => {
        fetch(`${SERVICE_URL}/runs/getBig8?year=${big8Year}`)
        .then(response => response.json())
        .then(data => {
            setBig8(data); 
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        fetchBig8(); 
    }, []); 

    let content; 
    if(errorLoading){
        content = (
            <div></div>
        )
    }


    if(!errorLoading){
        content = (
            <div className="col d-flex flex-column align-items-start p-3 m-2 ">
                <p><span className="h4 me-3">The Big 8</span>{`Top times from ${big8Year}'s motorized teams.`}</p>
                <div className="row w-100">
                    <Big8Contest run={getRun("Three Man Ladder", big8)} lastRow='date' optionalRow="hometown" />
                    <Big8Contest run={getRun("B Ladder", big8)} lastRow='date' optionalRow="hometown"/>
                    <Big8Contest run={getRun("C Ladder", big8)} lastRow='date' optionalRow="hometown"/>
                    <Big8Contest run={getRun("C Hose", big8)} lastRow='date' optionalRow="hometown"/>
                    <Big8Contest run={getRun("B Hose", big8)} lastRow='date' optionalRow="hometown"/>
                    <Big8Contest run={getRun("Efficiency", big8)} lastRow='date' optionalRow="hometown"/>
                    <Big8Contest run={getRun("Motor Pump", big8)} lastRow='date' optionalRow="hometown"/>
                    <Big8Contest run={getRun("Buckets", big8)} lastRow='date' optionalRow="hometown"/>
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