import React, { useEffect, useState } from "react";
import { Run, TeamTournHistory } from "../types/types";
import { Link, useNavigate, useParams } from "react-router-dom";
import {  Cell, Scatter, ScatterChart, Tooltip, TooltipProps, XAxis, YAxis, ZAxis } from "recharts";
import { Form, Placeholder } from "react-bootstrap";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import dateUtil from "../utils/dateUtils";
import useWindowDimensions from "../utils/windowDimensions";
import { contestArr } from "../Components/adminTournamentsComps/ContestOptions";
import { niceTime } from "../utils/timeUtils";
import { TimeCellContents } from "../Components/Scorecard";


declare var SERVICE_URL: string;

type opacityControl = "appearance" | "points" | "top5" | 'wins' | 'stateRecords' | 'video' ; 


export default function TeamHistory(){
    let params = useParams();
    const teamName = params.teamName
    const [teamHistory, setTeamHistory] = useState<TeamTournHistory[]>([])
    const [teamRecords, setTeamRecords] = useState<{_id: string, matched_doc: Run}[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [trLoading, setTrLoading] = useState(true); 
    const [isError, setError] = useState(false); 
    const [opacityControl, setOpacityControl] = useState<opacityControl>("appearance"); 

    console.log("teamRecords: ", teamRecords)

    useEffect(() => {
        getTeamHistory(teamName, setTeamHistory, setError, setLoading); 
        getTeamRecords(teamName, setTeamRecords, setError, setTrLoading); 
    }, [])

    return (
        <div className="container">
            <div className="text-center font-x-large mt-2"><b>{`${teamName} Tournament History`}</b></div>
            <div className="d-flex justify-content-end pt-2 pb-1">
                <div>
                    <Form.Select aria-label="Select Year" value={opacityControl} onChange={(e) => setOpacityControl(e.target.value as opacityControl)}>
                        <option value="appearance">Appearances</option>
                        <option value="points">Points</option>
                        <option value="top5">Top 5 Finishes</option>
                        <option value="wins">Wins</option>
                        <option value="stateRecords">State Records</option>
                        <option value="video">Video Available</option>
                    </Form.Select>

                </div>
            </div>
            <div className="w-100 bg-white rounded shadow-sm">
                <div className="overflow-auto pb-3">
                    {
                        loading ? 
                            <div className="width-100 some-height"></div> : 
                            <Chart teamHistory={teamHistory} opacityControl={opacityControl} />
                    }
                </div>
            </div>
            <div className="row g-2 mt-1 mb-4">
                <div className="col-12">
                    <div className="bg-white width-100 minheight-80 rounded shadow-sm">
                        {
                            loading ? 
                                <SummaryInfoLoading /> : 
                                <SummaryInfo teamHistory={teamHistory}/>
                        }
                    </div>
                </div>
                <div className="col-12">
                    <div className="bg-white width-100 rounded shadow-sm overflow-auto">
                        <div className="minwidth-800">
                            {
                                trLoading ? 
                                    <SummaryInfoLoading /> : 
                                    teamRecords.length ? <TeamRecords teamRecords={teamRecords}/> : <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface TeamRecordsProps {
    teamRecords: {_id: string, matched_doc: Run}[]
}

function TeamRecords({teamRecords}: TeamRecordsProps){
    const runs = teamRecords.map(el => el.matched_doc).sort((a:Run, b:Run) => contestSort(a.contest) < contestSort(b.contest) ? -1 : 1); 
    const navigate = useNavigate(); 

    return (
        <div className="p-3">
            <div className="text-center pb-5"><b>Team Records</b></div>
            <div className="table-responsive">
                <table className="table table-sm w-100 other-tables ">
                    <thead>
                        <tr>
                            <th scope="row" className='bg-white px-0'>Tournament</th>
                            <td scope="row" className='text-start'><b>Contest</b></td>
                            <td scope="row" className='text-center'><b>Time</b></td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            runs.map((el, ind) => {

                                const tournDisplay = el.tournament && el.track ? 
                                        `${el.tournament} at ${el.track}` : 
                                            el.tournament ? el.tournament : 
                                            el.track ? el.track : ""; 
                                const dateDisplay = dateUtil.getMMDDYYYY(el.date); 
                            
                                return (
                                    !el.contest || !el.time ? <></> : 
                                    <tr className='' key={`teamrecord-${el._id}`}>
                                        <td onClick={() => navigate(`/Tournament/${el.tournamentId}`)} className="pointer">
                                            {dateDisplay && tournDisplay ? 
                                                `${dateDisplay} - ${tournDisplay}` : 
                                                dateDisplay ? dateDisplay : 
                                                tournDisplay ? tournDisplay : ""
                                            }
                                        </td>
                                        <td className='text-start'>{el.contest}</td>
                                        <td className='text-center'>{<TimeCellContents run={el}/>}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>

    )

}

function contestSort(contest: string){
    const sortNum = contestArr.findIndex(el => el === contest); 
    return sortNum === -1 ? 99 : sortNum; 

}

interface SummaryInfoProps {
    teamHistory: TeamTournHistory[]
}

function SummaryInfo({teamHistory}: SummaryInfoProps){
    let tournamentCount = 0; 
    let pointCount = 0; 
    let stateRecordCount = 0; 
    let videoCount = 0; 
    let runCount = 0; 
    let top5s = 0; 
    let wins = 0; 

    teamHistory.forEach(el => {
        tournamentCount++; 
        pointCount += el.points || 0; 
        stateRecordCount += el.stateRecordCount || 0;
        videoCount += el.videoCount || 0; 
        runCount += el.runCount || 0; 
        top5s += el.finishingPosition ? 1 : 0; 
        wins += el.finishingPosition === '1st Place' ? 1 : 0;  
    })

    const ptsAvg = (pointCount && runCount) ? Math.round(pointCount / runCount * 100) / 100 : 0; 

    return (
        <div >
            <div className="text-center py-2"><b>Summary Info</b></div>
            <div className="d-flex justify-content-between flex-wrap">

                <div className="p-3">
                    <div><b>Tournaments</b>: {tournamentCount.toLocaleString()}</div>
                    {wins > 0 ? <div><b>Wins</b>: {wins.toLocaleString()}</div> : <></>}
                    {top5s > 0 ? <div><b>Top 5 Finishes</b>: {top5s.toLocaleString()}</div> : <></>}
                    {pointCount > 0 ? <div><b>Total Points</b>: {(Math.round(pointCount*100)/100).toLocaleString()}</div> : <></>}
                </div>
                <div className="p-3">
                    <div className=""><b>Runs</b>: {runCount.toLocaleString()}</div>
                    {stateRecordCount > 0 ? <div><b>State Records</b>: {stateRecordCount.toLocaleString()}</div> : <></>}
                    {videoCount > 0 ? <div><b>Video Links</b>: {videoCount.toLocaleString()}</div> : <></>}
                </div>
                <div className="p-3">
                    {wins > 0 ? <div><b>Winning Percentage</b>: {`${Math.round(wins / tournamentCount * 1000) / 10} %`}</div> : <></>}
                    {top5s > 0 ? <div className="mb-2"><b>Top 5 Percentage</b>: {`${Math.round(top5s / tournamentCount * 1000) / 10} %`}</div> : <></>}
                    {ptsAvg > 0.25 ? <div className=""><b>Avg Points per Run</b>: {`${ptsAvg}`}</div> : <></>}
                </div>
            </div>
        </div>
    )

}

function SummaryInfoLoading(){
    return (
        <div className="minheight-180">
            <div className="row mt-2">
                <Placeholder animation="glow" className="p-0 text-center">
                    <Placeholder xs={3} className="rounded" size="lg" bg="secondary"/>
                </Placeholder>
            </div>
            <div className="row mt-5">
                <Placeholder animation="glow" className="p-0 text-center">
                    <Placeholder xs={10} className="rounded" size="xs" bg="secondary"/>
                </Placeholder>
            </div>
            <div className="row">
                <Placeholder animation="glow" className="p-0 text-center">
                    <Placeholder xs={10} className="rounded" size="xs" bg="secondary"/>
                </Placeholder>
            </div>
            <div className="row">
                <Placeholder animation="glow" className="p-0 text-center">
                    <Placeholder xs={10} className="rounded" size="xs" bg="secondary"/>
                </Placeholder>
            </div>
        </div>
    )
}


interface ChartProps {
    teamHistory: TeamTournHistory[], 
    opacityControl: opacityControl
}

function Chart({teamHistory, opacityControl}: ChartProps){

    const yearStart = 1947; 
    const currentYear = new Date().getFullYear(); 
    const yearsCovered = currentYear - yearStart;
    const tickCount = Math.round((yearsCovered) / 4); 
    const yearCounter:Record<number, number> = {};  

    const navigate = useNavigate(); 
    const { width } = useWindowDimensions();
    const smallScreen = width < 750; 


    const positioned = teamHistory
        .sort((a: TeamTournHistory, b:TeamTournHistory) => new Date(a.date).getTime() < new Date(b.date).getTime() ? -1 : 1)
        .map(el => {
            const year = new Date(el.date).getFullYear(); 
            if(!yearCounter[year]) {
                yearCounter[year] = 1;
            } else {
                yearCounter[year]++; 
            }
            const yearPos = yearCounter[year]; 

            return {
                ...el, 
                xPos: year, 
                yPos: yearPos, 
                pointsOpacity: calcOpacity(el, opacityControl)
            }
        })

    const maxY = Math.max(...Object.values(yearCounter), 5)
    const topPad = 20; 
    const botPad = 20; 
    const bonusPad = 30; 
    const chartHeight = topPad + botPad + ( maxY * 27 ) + bonusPad; 

    return(
        <ScatterChart
            width={(yearsCovered * 27) + 20}
            height={chartHeight}
            margin={{
                top: 20,
                right: 30,
                bottom: 20,
                left: 30,
            }}
            >
            <XAxis type="number" dataKey="xPos" name="Year" domain={[yearStart, currentYear]} tickCount={tickCount}/>
            <YAxis type="number" dataKey="yPos" name="Tournament Count" domain={[0,maxY]} hide/>
            <ZAxis dataKey="z" type="number" range={[600, 600]} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Scatter name="Tournament" data={positioned} shape="square">
                {positioned.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#0084d8" fillOpacity={entry.pointsOpacity} cursor="pointer" onClick={!smallScreen ? () => navigate(`/Tournament/${entry.id}`) : () => {}}/>
                ))}
            </Scatter>
        </ScatterChart>
    )
}



function CustomTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>){
    if (active && payload && payload.length) {
        const tournInfo = payload[0].payload as TeamTournHistory; 
        const dateStr = dateUtil.getMMDDYYYY(tournInfo.date); 
        const finishAndPts = tournInfo.finishingPosition && tournInfo.points ? 
            `${tournInfo.finishingPosition} with ${tournInfo.points} point${tournInfo.points>1 ? 's' : ''}` : 
            tournInfo.finishingPosition ? `${tournInfo.finishingPosition}` : 
            tournInfo.points ? `${tournInfo.points} point${tournInfo.points > 1 ? "s" : ""}` : ""; 
        const runCount = tournInfo.runCount ? `${tournInfo.runCount} run${tournInfo.runCount > 1 ? "s" : ""}` : ""; 

        return (
            <div className="custom-tooltip">
                <div className="p-2">
                    <b>{dateStr}</b>
                    <div className="mb-2">
                        {tournInfo.name && tournInfo.track ? `${tournInfo.name} at ${tournInfo.track}` : 
                            tournInfo.name ? tournInfo.name : 
                            tournInfo.track ? `At ${tournInfo.track}` : ""    
                        }
                        {
                            tournInfo?.runningOrderPos ? ` (#${tournInfo.runningOrderPos > 100 ? tournInfo.runningOrderPos - 100 : tournInfo.runningOrderPos})` : "" 
                        }
                    </div>
                    <div>
                        {finishAndPts && runCount ? `${finishAndPts} - ${runCount}` : 
                            finishAndPts ? finishAndPts : 
                            runCount ? runCount : "" 
                        }
                    </div>
                    <div>
                        {tournInfo?.stateRecordCount > 0 ? `${tournInfo.stateRecordCount} state record${tournInfo.stateRecordCount > 1 ? "s" : ""}!` : ""}
                    </div>
                    <div className="mt-2">
                        {tournInfo?.videoCount > 0 ? `${tournInfo.videoCount} video${tournInfo.videoCount > 1 ? 's':''} available.` : ''}
                    </div>
                </div>
            </div>
        );
    }
  
    return null;
  };

function calcOpacity(item: TeamTournHistory, opacCtrl: opacityControl) {
    if(opacCtrl === "appearance") return 1; 
    if(opacCtrl === "points") {
        return Math.max(.1, item?.points && item?.runCount ? item.points / 5 / item.runCount : .1 ) 
    }
    if(opacCtrl === 'top5') {
        return item?.finishingPosition ? 1 : .1; 
    }
    if(opacCtrl === 'wins') {
        return item?.finishingPosition === '1st Place' ? 1 : .1; 
    }
    if(opacCtrl === 'stateRecords') {
        return item?.stateRecordCount ? 1 : .1; 
    }
    if(opacCtrl === 'video') {
        return item?.videoCount ? 1 : .1; 
    }
    return 1; 
}


function getTeamHistory(teamname:string, stateSetter:Function, errorSetter:Function, setLoading:Function){
    setLoading(true)
    stateSetter([])
    fetch(`${SERVICE_URL}/histories/getHistory?teamname=${teamname}`)
        .then(response => response.json())
        .then(data => {
            stateSetter(data.histories); 
            setLoading(false); 
        })
        .catch(err => {
            console.log(err); 
            errorSetter(true)
        })
}

function getTeamRecords(teamName: string, stateSetter:Function, errorSetter:Function, setLoading:Function){
    setLoading(true)
    stateSetter([])
    fetch(`${SERVICE_URL}/runs/getTeamRecords?team=${teamName}`)
        .then(response => response.json())
        .then(data => {
            stateSetter(data); 
            setLoading(false); 
        })
        .catch(err => {
            console.log(err); 
            errorSetter(true)
        })

} 

