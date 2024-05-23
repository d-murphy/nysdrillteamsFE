import React, { useEffect, useState } from "react";
import { Team } from "../types/types";
import { Link } from "react-router-dom";


declare var SERVICE_URL: string;


export default function TeamHistoryBase(){
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(false); 

    useEffect(() => {
        getTeams(setTeams, setError, setLoading)
    }, [])

    const groups = teams.reduce((accum: Record<string, Team[]>, el: Team) => {
        if(!el.display) return accum; 
        if(!accum[el.circuit]){
            accum[el.circuit] = [el]
        } else {
            accum[el.circuit].push(el)
        }
        return accum; 
    }, {})

    const sortOrder: Record<string, number> = {
        'nassau': 1, 
        'northern': 2, 
        'suffolk': 3, 
        'western': 4, 
        'juniors': 5, 
        'old fashioned': 6
    }

    if(loading) return <></>; 
    if(error) return <>An error occurred please try again.</>
    return (
        <div className="container">
            <div className="w-100 d-flex flex-column align-items-center justify-content-center">
                <div className="text-center font-x-large mt-2"><b>Team Histories</b></div>
                <div className="pt-2 pb-1">Select a team to view the team's history.</div>
                <div className="pt-1 pb-2"><i>Note: Team Histories reflect available data and may be incomplete.</i></div>
            </div>
            <div className="row bg-white rounded shadow-sm">
                {
                    Object.keys(groups).sort((a,b) => sortOrder[a.toLowerCase()] < sortOrder[b.toLowerCase()] ? -1 : 1).map(el => {
                        return(
                            <div className="col-12 col-md-4 col-lg-2">
                                <div className="px-2 py-4 text-center"><h5>{el}</h5></div>
                                {
                                    groups[el].map(team => {
                                        return (
                                            <div className="px-2 py-1">
                                                <Link className="video-links " to={`/TeamHistory/${encodeURIComponent(team.fullName)}`}>
                                                    {team.fullName}
                                                </Link>
                                            </div>
                                        )
                                    })
                                }
                            </div>    
                        )
                    })
                }
            </div>
        </div>
    )
}

function getTeams(stateSetter:Function, errorSetter:Function, setLoading:Function){
    setLoading(true)
    fetch(`${SERVICE_URL}/teams/getTeams`)
        .then(response => response.json())
        .then(data => {
            data = data
                .filter((el:Team) => el.fullName)
                .sort((a: Team,b: Team) => a.fullName?.trim()?.toLowerCase() < b.fullName?.trim()?.toLowerCase() ? -1 : 1)
            stateSetter(data); 
            setLoading(false); 
        })
        .catch(err => {
            console.log(err); 
            errorSetter(true)
        })
}
