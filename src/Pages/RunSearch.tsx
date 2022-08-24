import * as React from "react";
import { useState } from "react";
import TopRuns from "../Components/TopRuns"
import RunsFilter from "../Components/RunsFilter";


export default function RunSearch() {

    const [years, setYears] = useState<number[]>([]); 
    const [tracks, setTracks] = useState<string[]>([]);
    const [teams, setTeams] = useState<string[]>([]); 
    
    return (
        <div className="container">
            <RunsFilter setTeams={setTeams} setTracks={setTracks} setYears={setYears} />
            <TopRuns teams={teams} years={years} tracks={tracks} />
        </div>
    )
}


