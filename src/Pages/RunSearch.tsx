import * as React from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import TopRuns from "../Components/TopRuns"

export default function RunSearch() {

    const [years, setYears] = useState<number[]>([]); 
    const [tracks, setTracks] = useState<string[]>([]);
    const [teams, setTeams] = useState<string[]>([]); 
    
    return (
        <div className="container">
            <div className="row">
                <div className="col-12 text-center mt-3 mb-4 p-2 "><h3>Top Runs in Each Contest</h3></div>
                {/* <RunsFilter setTeams={setTeams} setTracks={setTracks} setYears={setYears} /> */}
                <TopRuns teams={teams} years={years} tracks={tracks} />
            </div>
        </div>
    )
}


