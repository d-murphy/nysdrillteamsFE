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
    const [nassauPoints, setNassauPoints] = useState(false); 
    const [northernPoints, setNorthernPoints] = useState(false)
    const [suffolkPoints, setSuffolkPoints] = useState(false); 
    const [westernPoints, setWesternPoints] = useState(false); 
    const [nassauOfPoints, setNassauOfPoints] = useState(false); 
    const [suffolkOfPoints, setSuffolkOfPoints] = useState(false); 
    const [liOfPoints, setLiOfPoints] = useState(false); 
    const [juniorPoints, setJuniorPoints] = useState(false); 
    const [sanctioned, setSanctioned] = useState(false); 
    const [stateRecord, setStateRecord] = useState(false); 
    const [currentStateRecord, setCurrentStateRecord] = useState(false); 

    // run request on each parameter change (params should be changed at one time)
    useEffect(() => {
        runRequest()
    }, [teams, tournaments, tracks, years, contests, positions, 
        nassauPoints, northernPoints, suffolkPoints, westernPoints, nassauOfPoints, suffolkOfPoints, liOfPoints, juniorPoints, sanctioned, stateRecord, currentStateRecord,
        page])

    // set vals from parameters
    useEffect(() => {
        setYears(searchParams.getAll('years'))
        setTeams(searchParams.getAll('teams'))
        setTracks(searchParams.getAll('tracks'))
        setTournaments(searchParams.getAll('tournaments'))
        setContests(searchParams.getAll('contests'))
        setPositions(searchParams.getAll('positions')); 
        setNassauPoints(searchParams.getAll('nassauPoints')[0] === 'true'); 
        setNorthernPoints(searchParams.getAll('northernPoints')[0] === 'true'); 
        setSuffolkPoints(searchParams.getAll('suffolkPoints')[0] === 'true'); 
        setWesternPoints(searchParams.getAll('westernPoints')[0] === 'true'); 
        setNassauOfPoints(searchParams.getAll('nassauOfPoints')[0] === 'true'); 
        setSuffolkOfPoints(searchParams.getAll('suffolkOfPoints')[0] === 'true'); 
        setLiOfPoints(searchParams.getAll('liOfPoints')[0] === 'true'); 
        setJuniorPoints(searchParams.getAll('juniorPoints')[0] === 'true'); 
        setSanctioned(searchParams.getAll('sanctioned')[0] === 'true')
        setStateRecord(searchParams.getAll('stateRecord')[0] === 'true')
        setCurrentStateRecord(searchParams.getAll('currentStateRecord')[0] === 'true')
    }, [])

    function runRequest(){
        setLoading(true); 
        let url = `${SERVICE_URL}/runs/getFilteredRuns?`;
        url += teams.length ? "teams=" + teams.join(",").replace("&", "%26") : "" 
        url += tournaments.length ? "&tournaments=" + tournaments.join(",").replace("&", "%26") : "" 
        url += tracks.length ? "&tracks=" + tracks.join(",").replace("&", "%26") : "" 
        url += years.length ? "&years=" + years.join(",") : "" 
        url += contests.length ? "&contests=" + contests.join(",").replace("&", "%26") : "" 
        url += positions.length ? "&ranks=" + positions.join(",") : ""
        url += stateRecord ? "&stateRecord=true" : "";  
        url += currentStateRecord ? "&currentStateRecord=true" : "";  
        if(!url.split("?")[1].length) return 

        url += nassauPoints ? "&nassauPoints=true" : ""; 
        url += northernPoints ? "&northernPoints=true" : ""; 
        url += suffolkPoints ? "&suffolkPoints=true" : ""; 
        url += westernPoints ? "&westernPoints=true" : ""; 
        url += nassauOfPoints ? "&nassauOfPoints=true" : ""; 
        url += suffolkOfPoints ? "&suffolkOfPoints=true" : "";
        url += liOfPoints ? "&liOfPoints=true" : ""; 
        url += juniorPoints ? "&juniorPoints=true" : ""; 
        url += sanctioned ? "&sanctioned=true" : "";  

        url += "&page=" + page; 
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
            .catch((err:Error) => {
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
                    setTournaments={setTournaments} setPositions={setPositions} 
                    setNassauPoints={setNassauPoints} setNorthernPoints={setNorthernPoints} setSuffolkPoints={setSuffolkPoints} setWesternPoints={setWesternPoints}
                    setNassauOfPoints={setNassauOfPoints} setSuffolkOfPoints={setSuffolkOfPoints} setLiOfPoints={setLiOfPoints} setJuniorPoints={setJuniorPoints}
                    setSanctioned={setSanctioned} setStateRecord={setStateRecord} setCurrentStateRecord={setCurrentStateRecord}            
                    searchParams={searchParams} />
                <RunFilterResults runs={results} page={page} maxPage={maxPage} totalCt={totalCt} 
                    setPage={setPage} loading={loading} noResults={noResults}/>
            </div>
    )
}


