import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom'
import RunsFilter from "../Components/RunsFilter";
import { Run } from "../types/types";
import RunFilterResults from "../Components/RunsFilterResults"; 

declare var SERVICE_URL: string;
const PAGE_LEN = 20; 

export default function Search() {

    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(false); 
    const [results, setResults] = useState<Run[]>([]); 
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(1); 

    const [teams, setTeams] = useState([]); 
    const [tournaments, setTournaments] = useState([]); 
    const [tracks, setTracks] = useState([]); 
    const [years, setYears] = useState([]); 
    const [contests, setContests] = useState([]); 
    const [positions, setPositions] = useState([]); 
    const [booleanSearchElms, setBooleanSearchElms] = useState<{[index: string]: boolean}>({})

    useEffect(() => {
        setLoading(true); 

        let url = `${SERVICE_URL}/runs/getFilteredRuns?`;
        url += teams.length ? "teams=" + teams.join(",") : "" 
        url += tournaments.length ? "&tournaments=" + tournaments.join(",") : "" 
        url += tracks.length ? "&tracks=" + tracks.join(",") : "" 
        url += years.length ? "&years=" + years.join(",") : "" 
        url += contests.length ? "&contests=" + contests.join(",") : "" 
        url += positions.length ? "&ranks=" + positions.join(",") : "" 
        Object.keys(booleanSearchElms).forEach(el => {
            if(booleanSearchElms[el]){
                url += `&${el}=true`
            }
        })
        if(!url.split("?")[1].length) return 
        console.log('checking url: ', url); 
        fetch(url)
            .then(response => response.json())
            .then((respData: { data: Run[], metadata: {total: number, page:number}[]}[]) => {
                const {data, metadata} = respData[0]; 
                setResults(data); 
                console.log('here metadata: ', metadata); 
                setPage(metadata[0].page); 
                const maxPage = Math.ceil(metadata[0].total / PAGE_LEN); 
                setMaxPage(maxPage); 
                setLoading(false); 
            })
            .catch(err => {
                console.log(err)
                setError(true); 
                setLoading(false); 
            })

    }, [teams, tournaments, tracks, years, contests, positions, booleanSearchElms])

    if(error) return (
        <div className="container">
            Sorry, an error occurred.
        </div>
    )

    return (
            <div className="container">
                <RunsFilter setLoading={setLoading} setTeams={setTeams} setTracks={setTracks} 
                    setYears={setYears} setSearchParams={setSearchParams} setContests={setContests}
                    setTournaments={setTournaments} setPositions={setPositions} setBooleanSearchElms={setBooleanSearchElms}/>
                <RunFilterResults runs={results} page={page} maxPage={maxPage} />
            </div>
    )
}


