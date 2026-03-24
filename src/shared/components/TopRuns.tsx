import * as React from "react";
import { Run } from "../../types/types"
import TopRunsContest from "./TopRunsContest";
import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

interface TopRunsProp {
    teams?: string[]
    years?: number[]
    tracks?: string[]
}


export default function RunSearch(props:TopRunsProp) {
    const teams = props?.teams ?? [];
    const years = props?.years ?? [];
    const tracks = props?.tracks ?? [];

    let teamsParam = 'teams=' + teams.join(',');
    let yearsParam = 'years=' + years.join(',');
    let tracksParam = 'tracks=' + tracks.join(',');

    let url = `${SERVICE_URL}/runs/getTopRuns?`;
    url += teams.length ? `${teamsParam}&` : '';
    url += years.length ? `${yearsParam}&` : '';
    url += tracks.length ? `${tracksParam}` : '';

    const contestNames = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"];

    const { data: topRuns = [], isLoading, isError: errorLoading } = useQuery<Run[][]>({
        queryKey: ['topRuns', teams, years, tracks],
        queryFn: () => fetch(url).then(res => res.json()),
    });

    let content;
    if(isLoading){
        content = (
            <div className="row min-loading-height">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                </div>
            </div>
        )
    }
    if(errorLoading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="">Sorry, there was an error loading the page.</div>
                </div>
            </div>
        )
    }

    if(!errorLoading && !isLoading){
        content = (
            <div className="row">
                {topRuns.map((el, ind) => {
                    return <TopRunsContest runs={el} name={contestNames[ind]}/>
                })}
            </div>
        )
    }
    return ( content )
}