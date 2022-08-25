import * as React from "react";
import { useEffect, useState, SetStateAction } from "react";
import dateUtil from "../utils/dateUtils"
import { Run } from "../types/types"
import TopRunsContest from "./TopRunsContest";

interface TopRunsProp {
    teams?: string[]
    years?: number[]
    tracks?: string[]
    loading: boolean
    setLoading: React.Dispatch<SetStateAction<boolean>>
}


export default function RunSearch(props:TopRunsProp) {
    let teams = props?.teams ? props.teams : []; 
    let years = props?.years ? props.years : []; 
    let tracks = props?.tracks ? props?.tracks : []; 

    let teamsParam = 'teams='
    teamsParam += teams.map((el,ind) => {
        return el + ((ind + 1 == teams.length) ? '' : ',')
    })
    let yearsParam = 'years='
    yearsParam += years.map((el,ind) =>  {
        return `${el}` + ((ind + 1 == years.length) ? '' : ',')
    })
    let tracksParam = 'tracks='
    tracksParam += tracks.map((el,ind) =>  {
        return el + ((ind + 1 == tracks.length) ? '' : ',')
    })

    let url = 'http://localhost:4400/runs/getTopRuns?'; 
    url += teams.length ? `${teamsParam}&` : ''; 
    url += years.length ? `${yearsParam}&` : ''; 
    url += tracks.length ? `${tracksParam}` : '';  

    const [topRuns, setTopsRuns] = useState<Run[][]>([]); 
    const [errorLoading, setErrorLoading] = useState(false); 

    const contestNames = ["Three Man Ladder", "B Ladder", "C Ladder", "C Hose", "B Hose", "Efficiency", "Motor Pump", "Buckets"];; 

    const fetchTopRuns = () => {
        console.log('the url: ', url)
        fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('top runs data: ', data); 
            setTopsRuns(data); 
            props.setLoading(false);
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        console.log('initial top runs'); 
        fetchTopRuns(); 
    }, []); 

    useEffect(() => {
        fetchTopRuns(); 
    }, [teams, tracks, years]); 

    let content; 
    if(props.loading){
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


    if(!errorLoading && !props.loading){
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