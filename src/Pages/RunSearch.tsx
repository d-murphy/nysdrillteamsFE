import * as React from "react";
import { useState } from "react";
import { useSearchParams } from 'react-router-dom'
import TopRuns from "../Components/TopRuns"
import RunsFilter from "../Components/RunsFilter";


export default function RunSearch() {

    const [searchParams, setSearchParams] = useSearchParams();

    const tracksParam = searchParams.get('tracks')
    const yearsParam = searchParams.get('years')
    const teamsParam = searchParams.get('teams')

    let tracksArr = tracksParam ? tracksParam.split(',') : []; 
    let yearsArr = yearsParam ? yearsParam.split(',').map(el => parseInt(el)) : []; 
    let teamsArr = teamsParam ? teamsParam.split(',') : []; 
    
    const [years, setYears] = useState<number[]>(yearsArr); 
    const [tracks, setTracks] = useState<string[]>(tracksArr);
    const [teams, setTeams] = useState<string[]>(teamsArr); 
    const [loading, setLoading] = useState(true); 
    
    return (
        <div className="container">
            <RunsFilter setTeams={setTeams} setTracks={setTracks} setYears={setYears} setLoading={setLoading} setSearchParams={setSearchParams}/>
            <TopRuns teams={teams} years={years} tracks={tracks} setLoading={setLoading} loading={loading}/>
        </div>
    )
}


