import * as React from "react";
import { useState } from "react";
import { useSearchParams } from 'react-router-dom'
import RunsFilter from "../Components/RunsFilter";



export default function Search() {

    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true); 
    const [teams, setTeams] = useState([]); 
    const [tournaments, setTournaments] = useState([]); 
    const [tracks, setTracks] = useState([]); 
    const [years, setYears] = useState([]); 
    const [contests, setContests] = useState([]); 
    const [positions, setPositions] = useState([]); 
    
    return (
        <div className="container">
            <RunsFilter setLoading={setLoading} setTeams={setTeams} setTracks={setTracks} 
                setYears={setYears} setSearchParams={setSearchParams} setContests={setContests}
                setTournaments={setTournaments} setPositions={setPositions} />
        </div>
    )
}


