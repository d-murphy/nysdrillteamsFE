import React, { useEffect, useState } from 'react'; 
import { Team, Run, SimilarTeam } from '../types/types'; 
import Form from 'react-bootstrap/Form';
import { JR_CONTEST_STR } from '../Components/TotalPoints'; 
declare var SERVICE_URL: string;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"; 

import { BarChart, Bar, Label, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TimeCellContents, TotalPointsOverrideMsg } from '../Components/Scorecard';
import { niceTime } from '../utils/timeUtils';

const order = [
    'Three Man Ladder', 'B Ladder', 'C Ladder', 'C Hose', 'B Hose', 'Efficiency', 'Motor Pump', 'Buckets', 
    'Individual Ladder', 'Motor H&L Dummy', 'Combination Hose & Pump', 'Motor Hose Replacement',
    'Running Ladder', 'Running Hose', 'Running Hose Replacement', 'Efficiency Replacement', 'Two into One', 'Equipment',
    ...JR_CONTEST_STR.split(",")
]
const orderLut: {[index:string]: number} = {}; 
order.forEach((el, ind) => orderLut[el] = ind + 1); 

export default function TeamSummary(){

    const [teamSelected, setTeamSelected] = useState(""); 
    const [teams, setTeams] = useState<string[]>([]); 
    const [yearSelected, setYearSelected] = useState<'' | number>(''); 
    const [years, setYears] = useState<{year:number, numRuns: number}[]>([]); 
    const [error, setError] = useState(false); 
    const [loading, setLoading] = useState(false); 
    const [runs, setRuns] = useState<Run[]>([]); 
    const [similarTeams, setSimilarTeams] = useState<SimilarTeam[]>([]); 
    const [similarTeamsLoading, setSimilarTeamsLoading] = useState(false); 

    useEffect(() => {
        getTeamsForFilter(setTeams, setError); 
    }, [])

    useEffect(() => {
        getYearsForFilter(setYears, setError, setLoading, teamSelected); 
        setYearSelected('')
        setRuns([]); 
    }, [teamSelected])

    useEffect(() => {
        if(!teamSelected || !yearSelected) return setSimilarTeams([])
        setSimilarTeamsLoading(true)
        getSimilarYears(setSimilarTeams, teamSelected, yearSelected); 
        setTimeout(() => setSimilarTeamsLoading(false), 4000); 
    }, [teamSelected, yearSelected])

    function getRuns(){
        fetch(`${SERVICE_URL}/runs/getTeamSummary?year=${yearSelected}&team=${teamSelected}`)
        .then(response => response.json())
        .then(data => {
            setRuns(data); 
            setLoading(false); 
        })
        .catch(err => {
            console.log(err); 
            setError(true)
        })
    }

    if(error) return (
        <div className="container bg-white p-3 text-center w-100 my-2">
            Sorry, an error occurred.
        </div>
    )

    return (
        <div className="container">
            <div className="mx-2">
                <div className="text-center w-100 font-x-large mt-2"><b>Team Season Summaries</b></div>
                <Filters teams={teams} teamSelected={teamSelected} 
                    setTeamSelected={setTeamSelected} years={years}  
                    yearSelected={yearSelected} setYearSelected={setYearSelected} 
                    getResults={getRuns} setRuns={setRuns} loading={loading} />
                {runs.length ? <Summary runs={runs} similarTeams={similarTeams} similarTeamsLoading={similarTeamsLoading} /> : <></> }
                <Results runs={runs} />
            </div>
        </div>
    )
}

const SimilarTeamsInfoTooltip = (props:any) => (
    <Tooltip id="similar-teams-info-tooltip" {...props} >
        Using percentages of points scored and frequency of good runs to find similar teams.
    </Tooltip>
);

interface SummaryProps {
    runs: Run[]
    similarTeams: SimilarTeam[]
    similarTeamsLoading: boolean
}

function Summary({runs, similarTeams, similarTeamsLoading}: SummaryProps){
    let pointsSum = 0; 
    let areaPointsSum = 0; 
    const points = runs.reduce((accum: {[key:string]: {points: number, areaPoints:number, minTime: null | number, contest: string}}, el:Run) => {
        const anyAreaPoints = el.nassauPoints || el.northernPoints || el.suffolkPoints || el.westernPoints || 
            el.suffolkOfPoints || el.nassauOfPoints || el.juniorPoints || el.liOfPoints; 
        if(!accum[el.contest]){
            accum[el.contest] = {points: 0, areaPoints: 0, minTime: null, contest: el.contest}; 
        }
        accum[el.contest].points += el.points; 
        pointsSum += el.points; 
        const areaPtsForRun = !anyAreaPoints ? 0 : el.totalPointsOverride || el.points;
        accum[el.contest].areaPoints +=  areaPtsForRun; 
        areaPointsSum += areaPtsForRun; 
        accum[el.contest].minTime = !accum[el.contest].minTime && el.timeNum ? el.timeNum : 
            accum[el.contest].minTime && !el.timeNum ? accum[el.contest].minTime : 
            Math.min(accum[el.contest].minTime, el.timeNum); 
        return accum; 
    }, {})
    const pointsArr = Object.values(points); 
    pointsArr.sort((a, b) => {
        return orderLut[a.contest] < orderLut[b.contest] ? -1 : 1; 
    })

    return (
        <div className="mt-3 bg-white rounded shadow-sm p-2">
            <div className='row'>
                <div className="col-12 col-lg-6">
                    <div className="p-2 ">
                        <div><b>Runs</b>: {runs.length}</div>
                        <div><b>Points</b>: {pointsSum} ({areaPointsSum} area)</div>  
                        <div className='mt-2'>
                            {
                                <div className="table-responsive">
                                <table className="table table-sm w-100 other-tables ">
                                    <thead>
                                        <tr>
                                            <th scope="row" className='bg-white px-0'>Best / Points in each Contest</th>
                                            <td scope="row" className='text-end'><b>Time</b></td>
                                            <td scope="row" className='text-end'><b>Pts (Area)</b></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            pointsArr.map(el => {
                                                return (
                                                    el.minTime === 0 ? <></> : 
                                                    <tr className=''>
                                                        <td>{el.contest}</td>
                                                        <td className='text-end'>{niceTime(el.minTime)}</td>
                                                        <td className='text-end'>{el.points} ({el.areaPoints})</td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            
                            }
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6">
                        <div className='p-5 h-100 d-flex align-items-center justify-content-center text-center'>
                            {
                                !similarTeams.length ? <></> : 
                                pointsSum < 50 || runs.length <50 ? <></> : 
                                    similarTeamsLoading ? 
                                        <div className='w-100 h-100 filter-bg p-4 rounded d-flex flex-column align-items-center'>
                                            <div><i>Searching for Similar Seasons</i></div>
                                            <div className="spinner-border text-secondary mt-5" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>                                        
                                        </div> : 
                                        <div className='filter-bg p-4 rounded w-100 '>
                                            <div className='pb-2 d-flex flex-row align-items-center justify-content-center w-100'>
                                                <b>Similar Seasons</b>
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={SimilarTeamsInfoTooltip}
                                                >
                                                    <div className="font-small ms-3">
                                                        <FontAwesomeIcon icon={faCircleInfo}/>
                                                    </div>
                                                </OverlayTrigger>
                                            </div>
                                            {
                                                similarTeams.map(el => {
                                                    return <div className='font-small'>{el.otherYear} - {el.otherTeam}</div>
                                                })
                                            }
                                        </div>
                            }
                        </div>
                    </div>
            </div>
        </div>

    )
}

interface ResultsProps {
    runs: Run[]
}

function Results({runs}:ResultsProps){
    const tourns: {[index:number]: {date: number, dateDisplay: string, name: string}} = {}; 
    runs.forEach(run => {
        const runAsDate = new Date(run.date).getTime(); 
        if(!tourns[runAsDate]){
            tourns[runAsDate] = {date: new Date(run.date).getTime(), dateDisplay: new Date(run.date).toLocaleDateString(), name: run.tournament}
        }
    })
    const contests = Array.from(new Set(runs.map(el => el.contest))).sort((a,b) => !orderLut[a] ? 1 : !orderLut[b] ? -1 : orderLut[a] < orderLut[b] ? -1 : 1); 
    const runsLu: {[index:string]: Run} = {}; 
    runs.forEach(run => {
        runsLu[`${new Date(run.date).getTime()}-${run.contest}`] = run; 
    })
    let buffer: JSX.Element[] = []; 
    Object.keys(tourns).sort().forEach(tournTime => {
        const tournTimeNum = parseInt(tournTime); 
        let rowBuffer: JSX.Element[] = []; 
        // pushing two header cols.  one as normal cell for small screens
        const tournNameCellContent = <span className='font-weight-normal'>{tourns[tournTimeNum].name} - <span className='font-x-small'>{tourns[tournTimeNum].dateDisplay}</span></span>
        rowBuffer.push(<th scope="row" className="d-none d-md-block bg-white text-nowrap">{tournNameCellContent}</th>)
        rowBuffer.push(<td scope="row" className="d-block d-md-none text-nowrap ">{tournNameCellContent}</td>)
        contests.forEach(contest => {
            let key = `${tournTime}-${contest}`; 
            if(!runsLu[key]) {
                rowBuffer.push(<td></td>)
                rowBuffer.push(<td></td>)
            } else {       
                const run = runsLu[key]; 
                rowBuffer.push(
                    <td className='text-center px-3' >
                        {['NULL', 'NA'].includes(runsLu[key].time) ? 
                            <i>NA</i> : 
                            <TimeCellContents run={runsLu[key]} />
                        }
                    </td>
                ); 

                const isPoints = run?.suffolkPoints || run?.nassauPoints || run?.westernPoints || run?.northernPoints || run?.suffolkOfPoints || run?.nassauOfPoints || run?.liOfPoints || run?.juniorPoints; 
                isPoints ? 
                    rowBuffer.push(
                        <td className='table-secondary text-center px-2' >
                            {runsLu[key].points}{runsLu[key].totalPointsOverride ? <TotalPointsOverrideMsg value={runsLu[key].totalPointsOverride}/> : <></>}
                        </td>) :
                    rowBuffer.push(
                        <td className='text-center px-2'>
                            {runsLu[key].points}{runsLu[key].totalPointsOverride ? <TotalPointsOverrideMsg value={runsLu[key].totalPointsOverride} /> : <></>}
                        </td>
                    )
            }
        })
        buffer.push(<tr>{...rowBuffer}</tr>)
    })

    if(!runs.length) return <div className='text-center my-3 bg-white rounded shadow-sm p-4'>Select a team and season to view season summary.</div>
    return (
        <div className="my-3 bg-white rounded shadow-sm p-2">

            <div className="table-responsive m-2">
                <table className="table table-sm w-auto other-tables ">
                    <thead>
                        <tr>
                            <th scope="row" className='d-none d-md-block bg-white w-100 h-100'>Tournament</th>
                            <td scope="row" className='d-block d-md-none'><b>Tournament</b></td>
                            {
                                contests.map(contest => {
                                return (
                                <>
                                    <th scope="col" className="text-nowrap px-5">{contest}</th>
                                    <th scope="col" className="text-nowrap px-3">Pts</th>
                                </>
                                )})
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {...buffer}
                    </tbody>
                </table>
            </div>

        </div>
    )
}


interface filtersProps {
    teams: string []
    teamSelected: string
    setTeamSelected: React.Dispatch<string>
    years: {year: number, numRuns: number} []
    yearSelected: number | ''
    setYearSelected: React.Dispatch<number>
    setRuns: React.Dispatch<Run[]>
    getResults: Function
    loading: boolean
}

function Filters({teams, teamSelected, setTeamSelected, years, yearSelected, setRuns, setYearSelected, getResults, loading}:filtersProps){

    const handleSeasonChange = (newVal:string) => {
        setRuns([]); 
        setYearSelected(parseInt(newVal))
    }
    return (
        <div className="mt-3 bg-white rounded shadow-sm p-2">
            <div className='row'>
                {/* <div className='col-0 col-lg-2' /> */}
                <div className="col-12 col-lg-6">
                    <div className='d-flex flex-column h-100 justify-content-center'>
                        <div className='p-1 w-100 text-center mt-4'>
                            <b>Select a team</b>
                        </div>
                        <div className='p-1 w-100'>
                            <Form.Select aria-label="Select Team" value={teamSelected} onChange={((e) => setTeamSelected(e.target.value))}>
                                <option value=""></option>
                                {teams.map(el => {
                                    return <option value={el}>{el}</option>
                                })}
                            </Form.Select>
                        </div>
                        <div className='p-1 w-100 text-center'>
                            <b>Select a season</b>
                        </div>
                        <div className='p-1'>
                            <Form.Select aria-label="Select Year" value={yearSelected} onChange={(e) => handleSeasonChange(e.target.value)} disabled={!teamSelected}>
                                <option value=''></option>
                                {years.map(el => {
                                    return <option value={el.year}>{`${el.year} - ${el.numRuns} runs`}</option>
                                })}
                            </Form.Select>
                        </div>
                        <div className='p-4 d-flex justify-content-center w-100 mb-4'>
                            <button type="button" onClick={() => getResults()} disabled={!teams.length || !years.length || !teamSelected } className="btn submit-search-button font-medium" >View Season Summary</button>
                        </div>
                    </div>
                </div>
                {/* Large Screen */}
                <div className='d-none d-lg-block col-lg-6'>
                    <div className='w-100 text-center'><b>Years Active</b></div>
                    <div style={{ width: '100%', height: 280 }} className='p-2'>
                    {
                        !years.length ? 
                            <div className='p-3 h-100 d-flex align-items-center justify-content-center'>
                                {
                                    teamSelected ? 
                                        loading ? <></> : <div className='text-center'>There's no run data for this team.</div> : 
                                        <div className='font-small filter-bg h-100 w-100 rounded d-flex justify-content-center align-items-center'>
                                            Select a team to view active years.
                                        </div>
                                }
                            </div> 
                            : <Chart data={years} />
                    }
                    </div>
                </div>
                {/* Small Screen */}
                <div className='col-12 d-lg-none'>
                    <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey='0'>
                            <Accordion.Header>Years Active</Accordion.Header>
                            <Accordion.Body>
                            <div style={{ width: '100%', height: 280 }}>
                            {
                                !years.length ? 
                                    <div className='p-3 h-100 d-flex align-items-center justify-content-center'>
                                    {
                                        teamSelected ? 
                                            loading ? <></> : <div className='text-center'><i>There's no run data for this team.</i></div> : 
                                            <div className='font-small filter-bg h-100 w-100 rounded d-flex justify-content-center align-items-center'>
                                                Select a team to view active years.
                                            </div>
                                    }
                                    </div> 
                                    : <Chart data={years} />
                            }
                            </div>

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}





async function getTeamsForFilter(stateSetter:Function, errorSetter: Function){
    fetch(`${SERVICE_URL}/teams/getTeams`)
        .then(response => response.json())
        .then(data => {
            data = data
                .map((el:Team) => el.fullName)
                .filter((el:string) => el)
                .sort((a:string, b:string) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
            stateSetter(data); 
        })
        .catch(err => {
            console.log(err); 
            errorSetter(true)
        })
}

async function getYearsForFilter(stateSetter:Function, errorSetter:Function, setLoading:Function,  teamSelected: string){
    setLoading(true)
    fetch(`${SERVICE_URL}/runs/getYearRunCounts?team=${teamSelected}`)
        .then(response => response.json())
        .then(data => {
            data = data
                .filter((el:{_id: number, yearRunCount: number}) => el._id)
                .map((el:{_id: number, yearRunCount: number}) => {return {year: el._id, numRuns: el.yearRunCount}})
            stateSetter(data); 
            setLoading(false); 
        })
        .catch(err => {
            console.log(err); 
            errorSetter(true)
        })
}

async function getSimilarYears(stateSetter:Function, teamSelected: string, year: number){
    fetch(`${SERVICE_URL}/teams/getSimilarTeams?team=${teamSelected}&year=${year}`)
        .then(response => response.json())
        .then(data => {
            console.log('similar teams: ', data); 
            stateSetter(data); 
        })
        .catch(err => {
            console.log('Error pulling similar teams: ', err); 
            //quiet fail
            stateSetter([])
        })
}


interface ChartProps {
    data: {year:number, numRuns: number}[]
}

function Chart({data}:ChartProps){  
    return (
        <ResponsiveContainer>
          <BarChart
            layout="horizontal"
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 10,
            }}
          >
            <XAxis dataKey="year" type="number" domain={[1950, new Date().getFullYear()+2]} 
                ticks={[1960, 1980,2000,2020]}>
                <Label value="Year" position="bottom" offset={-5} />
            </XAxis>
            <YAxis dataKey="numRuns" type="number" label={{value: "Run Count", angle:-90, position: 'insideLeft'}}/>
            {
                data.length === 1 ? 
                <Bar dataKey={"numRuns"} fill="#546f8a" radius={2} maxBarSize={10} /> : 
                <Bar dataKey={"numRuns"} fill="#546f8a" radius={2}  /> 
            }
          </BarChart>
        </ResponsiveContainer>
      );
}
