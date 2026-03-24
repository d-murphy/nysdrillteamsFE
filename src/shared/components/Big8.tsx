import * as React from "react";
import { Run } from "../../types/types"
import Big8Contest from "./Big8Contest"
import Big8ContestLoading from "./Big8ContestLoading";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface Big8Prop {
    year?: number;
}

declare var SERVICE_URL: string;

export default function Big8(props:Big8Prop) {

    let big8Year = props.year ? props.year : new Date() < new Date(`6/15/${new Date().getFullYear()}`) ? new Date().getFullYear() -1  : new Date().getFullYear();

    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery<{_id: string, matched_doc: Run}[]>({
        queryKey: ['big8', big8Year],
        queryFn: () => fetch(`${SERVICE_URL}/runs/getBig8?year=${big8Year}`).then(res => res.json()),
    });
    const big8 = data ?? [];

    let content;
    if(isError) return <div></div>

    if(!isLoading){
        content = (
            <div className="col d-flex flex-column align-items-start py-3 m-2 ">
                <p><span className="h4 me-3">The Big 8</span>{`Top times from ${big8Year}'s motorized teams.`}</p>
                <div className="row w-100 g-2">
                    <Big8Contest run={getRun("Three Man Ladder", big8)} />
                    <Big8Contest run={getRun("B Ladder", big8)} />
                    <Big8Contest run={getRun("C Ladder", big8)} />
                    <Big8Contest run={getRun("C Hose", big8)} />
                    <Big8Contest run={getRun("B Hose", big8)} />
                    <Big8Contest run={getRun("Efficiency", big8)} />
                    <Big8Contest run={getRun("Motor Pump", big8)} />
                    <Big8Contest run={getRun("Buckets", big8)} />
                </div>
                <div className="row w-100 g-2 mt-1">
                    <div className="d-flex flex-column align-items-end">
                        <div className="pointer" onClick={() => {navigate("/topRuns?year=" + big8Year)}}>
                            See the Top 10 for {big8Year}
                            <FontAwesomeIcon className="crud-links fs-5 ms-2" icon={faList}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        content = (
            <div className="col d-flex flex-column align-items-start py-3 my-2 ">
                <p><span className="h4 me-3">The Big 8</span>{`Top times from ${big8Year}'s motorized teams.`}</p>
                <div className="row w-100 g-2">
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