import * as React from "react";
import { useEffect, useState } from "react";
import dateUtil from "../utils/dateUtils"
import { Run } from "../types/types"
import TopRunsContest from "./TopRunsContest";

interface TopRunsProp {
    teams?: string[]
    years?: number[]
    tracks?: string[]
}


export default function RunSearch(props:TopRunsProp) {
    let teams = props?.teams ? props.teams : []; 
    let years = props?.years ? props.years : []; 
    let tracks = props?.tracks ? props?.tracks : []; 

    let teamsParam = 'teams='
    teamsParam += teams.map(el => `${el},`)
    let yearsParam = 'years='
    yearsParam += years.map(el => `${el},`)
    let tracksParam = 'trackss='
    tracksParam += tracks.map(el => `${el},`)

    let url = 'http://localhost:4400/runs/getTopRuns?'; 
    url += teams.length ? teamsParam : ''; 
    url += years.length ? yearsParam : ''; 
    url += tracks.length ? tracksParam : ''; 

    const [topRuns, setTopsRuns] = useState<Run[][]>([]); 
    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 

    const contestNames = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"];; 

    const fetchTopRuns = () => {

        fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('top runs data: ', data); 
            setTopsRuns(data); 
            setLoading(false);
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        fetchTopRuns(); 
    }, []); 

    let content; 
    if(loading){
        content = (
            <div className="row">
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


    if(!errorLoading && !loading){
        content = (<>
            {topRuns.map((el, ind) => {
                return <TopRunsContest runs={el} name={contestNames[ind]}/>
            })}</>
        )
    }
    return ( content )
}