import * as React from "react";

import { Tournament, Run } from "../types/types"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faStarOfLife, faVideo } from '@fortawesome/free-solid-svg-icons'
import StateRecordIcon from "./StateRecordIcon"

import { niceTime } from '../utils/timeUtils'; 
import { OverlayTrigger, Tooltip } from "react-bootstrap";


interface ScorecardProp {
    tournament: Tournament;
    runs: Run[]; 
}

const BLANK_STR = "--"

export default function Scorecard(props:ScorecardProp) {
    const tournament = props.tournament;
    const runs = props.runs; 

    let runsLU:{ [key:string]: Run } = {};
    let totalPointsLU: { [key:string]: number } = {}; 
    let teamsSetFromRuns:Set<string> = new Set(); 
    runs.forEach(el => {
        let key = el.team + " - " + el.contest; 
        runsLU[key] = el; 
        teamsSetFromRuns.add(el.team); 
    })

    let teamArr:string[] = Object.values(tournament.runningOrder).length ? 
        Object.values(tournament.runningOrder) : 
        Array.from(teamsSetFromRuns).sort((a,b) => a < b ? -1 : 1); 
    let usingAlphaOrder = Object.values(tournament.runningOrder).length == 0 && runs.length; 
    
    tournament.contests.forEach((contest, contestIndex) => {
        teamArr.forEach(team => {
            let key = team + " - " + contest.name; 
            if(contestIndex == 0) {
                totalPointsLU[key] = runsLU[key]?.points ? runsLU[key]?.points : 0;  
            } else {
                let lastContestKey = team + " - " + tournament.contests[contestIndex-1].name; 
                totalPointsLU[key] = runsLU[key]?.points ? runsLU[key]?.points : 0;
                totalPointsLU[key] += totalPointsLU[lastContestKey]; 
            }            
        })
    })

    let headers = tournament && runs ? generateHeaders(tournament) : <></>;
    let tableRows = tournament && runs && !usingAlphaOrder ? generateRows(tournament, runsLU, totalPointsLU) : 
        tournament && runs && usingAlphaOrder ? generateAlphaRows(teamArr, tournament, runsLU, totalPointsLU) : <></>;

    return (
        <>
            {usingAlphaOrder ? <div className="pt-4 ps-4 text-center "><i>Running Order is not available for this drill.  Displaying teams alphabetically.</i></div> : <></>}
            <div className="scorecard-table-wrapper">
                <table className="my-4">
                    <thead className="">
                        <tr>
                            {headers}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        </>
    )
}

function generateHeaders(tournament:Tournament){
    let buffer: JSX.Element[] = []

    // turn runs into map with contest - team
    // loop through contests and teams and call array into right spots.  

    tournament.contests.forEach((el, ind) => {
        if(ind==0){
            buffer.push(<th scope="col" className="scorecard-cell-md fixed-col p-2">Team Lineup</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-lg text-center p-2">{el.name}</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm text-center p-2">Points</th>) 
        } else {
            buffer.push(<th scope="col" className="scorecard-cell-lg text-center p-2">{el.name}</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm text-center p-2">Points</th>) 
            buffer.push(<th scope="col" className="scorecard-cell-sm text-center p-2">Total</th>) 
        }
    })
    return buffer; 
}

function generateRows(tournament:Tournament, runsLU:{ [key:string]: Run }, totalPointsLU: { [key:string]: number }){
    let buffer: JSX.Element[] = []

    const positions = Object.keys(tournament.runningOrder).map(el => parseInt(el));
    let minPos = Math.min(...positions); 
    let maxPos = Math.max(...positions); 

    let less100 = minPos >= 100; 

    for(let i=minPos; i<=maxPos; i++){
        let rowBuffer: JSX.Element[] = []; 
        tournament.contests.forEach((el, ind) => {
            let key = tournament.runningOrder[i] + " - " + el.name; 
            if(ind==0){
                rowBuffer.push(<th scope="col" className="scorecard-cell-md fixed-col p-2">{tournament.runningOrder[i] ? `${less100 ? i-100 : i}. ${tournament.runningOrder[i]}` : `${i}.`}</th>)
                rowBuffer.push(<TableCell size="lg" value={runsLU[key] ? <TimeCellContents run={runsLU[key]} /> : BLANK_STR} />)
                rowBuffer.push(<TableCell size="sm" value={
                    <>
                        <span>{runsLU[key]?.points ? runsLU[key].points : BLANK_STR}</span>
                        <span>{runsLU[key]?.totalPointsOverride ? <TotalPointsOverrideMsg value={runsLU[key].totalPointsOverride} /> : <></>}</span>                    
                    </>

                } />)
                
            } else {
                rowBuffer.push(<TableCell size="lg" value={runsLU[key] ? <TimeCellContents run={runsLU[key]} /> : BLANK_STR} />)
                rowBuffer.push(<TableCell size="sm" value={
                    <>
                        <span>{runsLU[key]?.points ? runsLU[key].points : BLANK_STR}</span>
                        <span>{runsLU[key]?.totalPointsOverride ? <TotalPointsOverrideMsg value={runsLU[key].totalPointsOverride} /> : <></>}</span>                    
                    </>

                } />)
                rowBuffer.push(<TableCell size="sm" value={totalPointsLU[key]== 0 ? BLANK_STR : totalPointsLU[key]} />)
            }    
        })
        buffer.push(<tr>{...rowBuffer}</tr>)
    }


    return buffer; 
}

function generateAlphaRows(teamArr:string[], tournament:Tournament, runsLU:{ [key:string]: Run }, totalPointsLU: { [key:string]: number }) {
    let buffer: JSX.Element[] = []

    teamArr.forEach(team => {
        let rowBuffer: JSX.Element[] = []; 
        tournament.contests.forEach((el, ind) => {
            let key = team + " - " + el.name; 
            if(ind==0){
                rowBuffer.push(<th scope="col" className="scorecard-cell-md fixed-col p-2">{team}</th>)
                rowBuffer.push(<TableCell size="lg" value={runsLU[key] ? <TimeCellContents run={runsLU[key]} /> : BLANK_STR} />)
                rowBuffer.push(<TableCell size="sm" value={
                    <>
                        <span>{runsLU[key]?.points ? runsLU[key].points : BLANK_STR}</span>
                        <span>{runsLU[key]?.totalPointsOverride ? <TotalPointsOverrideMsg value={runsLU[key].totalPointsOverride} /> : <></>}</span>                    
                    </>

                } />)
            } else {
                rowBuffer.push(<TableCell size="lg" value={runsLU[key] ? <TimeCellContents run={runsLU[key]} /> : BLANK_STR} />)
                rowBuffer.push(<TableCell size="sm" value={
                    <>
                        <span>{runsLU[key]?.points ? runsLU[key].points : BLANK_STR}</span>
                        <span>{runsLU[key]?.totalPointsOverride ? <TotalPointsOverrideMsg value={runsLU[key].totalPointsOverride} /> : <></>}</span>                    
                    </>

                } />)
                rowBuffer.push(<TableCell size="sm" value={totalPointsLU[key]== 0 ? BLANK_STR : totalPointsLU[key]} />)
            }    
        })
        buffer.push(<tr>{...rowBuffer}</tr>)
    })
    return buffer
}


interface TableCellProps {
    size: 'md' | 'sm' | 'lg'
    value: string | number | React.ReactNode
}

function TableCell(props: TableCellProps){
    const scCss = `scorecard-cell-${props.size}`; 
    const value = props.value; 
    return (
        <td scope="col" className={`${scCss} text-center p-2`}>{value}</td>
    )
}

interface TimeCellContentsProps {
    run: Run | null | undefined
}

function TimeCellContents (props:TimeCellContentsProps){
    const run = props.run; 
    if(!run) return <></>; 
    return (
        <>
            { run.urls.length ? 
                <span className="me-3"><a href={run.urls[0]} target="_blank"><FontAwesomeIcon className="video-links" icon={faVideo} size="sm"/></a></span> : <></> }
            <span>{niceTime(run.time)}</span> 
            {
                run?.stateRecord || run?.currentStateRecord ? 
                    <span  className="ms-3"><StateRecordIcon run={run} size="sm" /></span> : <></>
            }
        </>     
    )
}

export function TotalPointsOverrideMsg({value}: {value:number}) {
    //@ts-ignore
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props} >{`Awarded ${value} area total point${value>1 ? "s" : ""}`}</Tooltip>
    );
            
    return (     
        <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
        >
            <span><FontAwesomeIcon className="fa-2xs pb-1 px-1" icon={faStarOfLife}  /></span>
        </OverlayTrigger>
    )
}