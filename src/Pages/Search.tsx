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
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(false); 
    const [results, setResults] = useState<Run[]>([]); 
    const [page, setPage] = useState<number>(1);
    const [totalCt, setTotalCt] = useState<number>(0); 
    const [maxPage, setMaxPage] = useState<number>(1); 
    const [noResults, setNoResult] = useState<boolean>(false); 

    const [teams, setTeams] = useState([]); 
    const [tournaments, setTournaments] = useState([]); 
    const [tracks, setTracks] = useState([]); 
    const [years, setYears] = useState([]); 
    const [contests, setContests] = useState([]); 
    const [positions, setPositions] = useState([]); 
    const [booleanSearchElms, setBooleanSearchElms] = useState<{[index: string]: boolean}>({})

    // run request on each parameter change (params should be changed at one time)
    useEffect(() => {
        runRequest()
    }, [teams, tournaments, tracks, years, contests, positions, booleanSearchElms, page])

    // set vals from parameters
    useEffect(() => {
        setYears(searchParams.getAll('years'))
        setTeams(searchParams.getAll('teams'))
        setTracks(searchParams.getAll('tracks'))
        setTournaments(searchParams.getAll('tournaments'))
        setContests(searchParams.getAll('contests'))
        setPositions(searchParams.getAll('positions')); 

        // const bseFromParams = {
        //     suffolkPoints: extractBool(searchParams, 'suffolkPoints'),
        //     nassauPoints: extractBool(searchParams, 'nassauPoints'),
        //     westernPoints: extractBool(searchParams, 'westernPoints'),
        //     northernPoints: extractBool(searchParams, 'northernPoints'),
        //     suffolkOfPoints: extractBool(searchParams, 'suffolkOfPoints'),
        //     nassauOfPoints: extractBool(searchParams, 'nassauOfPoints'),
        //     liOfPoints: extractBool(searchParams, 'liOfPoints'),
        //     juniorPoints: extractBool(searchParams, 'juniorPoints'),
        //     sanctioned: extractBool(searchParams, 'sanctioned'),   
        // }
        // setBooleanSearchElms(bseFromParams); 

    }, [])

    function extractBool(searchParams: URLSearchParams, name:string){
        const valsArr = searchParams.getAll(name)
        const val = valsArr.length ? valsArr[0] : ''; 
        console.log(name, val, val === 'true'); 
        return val === 'true'; 
    }

    function runRequest(){
        setLoading(true); 
        let url = `${SERVICE_URL}/runs/getFilteredRuns?`;
        url += teams.length ? "teams=" + teams.join(",").replace("&", "%26") : "" 
        url += tournaments.length ? "&tournaments=" + tournaments.join(",").replace("&", "%26") : "" 
        url += tracks.length ? "&tracks=" + tracks.join(",").replace("&", "%26") : "" 
        url += years.length ? "&years=" + years.join(",") : "" 
        url += contests.length ? "&contests=" + contests.join(",").replace("&", "%26") : "" 
        url += positions.length ? "&ranks=" + positions.join(",") : "" 
        console.log("booleanSearchElms", booleanSearchElms)
        Object.keys(booleanSearchElms).forEach(el => {
            if(booleanSearchElms[el]){
                url += `&${el}=true`
            }
        })
        if(!url.split("?")[1].length) return 
        url += "&page=" + page; 
        console.log('checking url: ', url); 
        fetch(url)
            .then(response => response.json())
            .then((respData: { data: Run[], metadata: {total: number, page:number}[]}[]) => {
                const {data, metadata} = respData[0]; 
                if(!data.length) {
                    setNoResult(true); 
                    return setLoading(false); 
                }
                setNoResult(false); 
                setResults(data); 
                setPage(metadata[0]?.page); 
                setTotalCt(metadata[0]?.total)
                const maxPage = Math.ceil(metadata[0]?.total / PAGE_LEN); 
                setMaxPage(maxPage); 
                setLoading(false);
            })
            .catch(err => {
                console.log(err)
                setError(true); 
                setLoading(false); 
            })
    }

    if(error) return (
        <div className="container bg-white p-3">
            Sorry, an error occurred.
        </div>
    )

    return (
            <div className="container">
                <RunsFilter setLoading={setLoading} setTeams={setTeams} setTracks={setTracks} 
                    setYears={setYears} setSearchParams={setSearchParams} setContests={setContests}
                    setTournaments={setTournaments} setPositions={setPositions} setBooleanSearchElms={setBooleanSearchElms}
                    searchParams={searchParams} />
                <RunFilterResults runs={results} page={page} maxPage={maxPage} totalCt={totalCt} 
                    setPage={setPage} loading={loading} noResults={noResults}/>
            </div>
    )
}


