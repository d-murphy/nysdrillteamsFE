import React, { useEffect, useState } from 'react'; 
import { Team, Run } from '../types/types'; 
import Form from 'react-bootstrap/Form';
import { JR_CONTEST_STR } from '../Components/TotalPoints'; 
declare var SERVICE_URL: string;

import { BarChart, Bar, Label, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Accordion } from 'react-bootstrap';





/* 

To Do: 
* add state records, videos, area total points override


*/ 


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
    const [runs, setRuns] = useState<Run[]>([]); 

    useEffect(() => {
        getTeamsForFilter(setTeams, setError); 
    }, [])

    useEffect(() => {
        getYearsForFilter(setYears, setError, teamSelected); 
        setYearSelected('')
        setRuns([]); 
    }, [teamSelected])

    function getRuns(){
        fetch(`${SERVICE_URL}/runs/getTeamSummary?year=${yearSelected}&team=${teamSelected}`)
        .then(response => response.json())
        .then(data => {
            console.log('runs: ', data, yearSelected, teamSelected)
            setRuns(data); 
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
                    getResults={getRuns} setRuns={setRuns} />
                <Results runs={runs} />
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
                const isPoints = run?.suffolkPoints || run?.nassauPoints || run?.westernPoints || run?.northernPoints || run?.suffolkOfPoints || run?.nassauOfPoints || run?.liOfPoints || run?.juniorPoints; 
                rowBuffer.push(<td className='text-center px-3' >{['NULL', 'NA'].includes(runsLu[key].time) ? <i>NA</i> : runsLu[key].time}</td>); 
                isPoints ? 
                    rowBuffer.push(<td className='table-secondary text-center px-2' >{runsLu[key].points}</td>) :
                    rowBuffer.push(<td className='text-center px-2'>{runsLu[key].points}</td>)
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
                                    <th scope="col" className="text-nowrap px-3">{contest}</th>
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
}

function Filters({teams, teamSelected, setTeamSelected, years, yearSelected, setRuns, setYearSelected, getResults}:filtersProps){

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
                    <div style={{ width: '100%', height: 280 }}>
                    {
                        !years.length ? 
                            <div className='p-3 h-100 d-flex align-items-center justify-content-center'>
                                {
                                    teamSelected ? 
                                        <div>There's no run data for this team.</div> : 
                                        <div className='font-small'>
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
                                            <div><i>There's no run data for this team.</i></div> : 
                                            <div className='font-small'>
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

async function getYearsForFilter(stateSetter:Function, errorSetter:Function, teamSelected: string){
    fetch(`${SERVICE_URL}/runs/getYearRunCounts?team=${teamSelected}`)
        .then(response => response.json())
        .then(data => {
            console.log('data: ', data); 
            data = data
                .filter((el:{_id: number, yearRunCount: number}) => el._id)
                .map((el:{_id: number, yearRunCount: number}) => {return {year: el._id, numRuns: el.yearRunCount}})
            stateSetter(data); 
        })
        .catch(err => {
            console.log(err); 
            errorSetter(true)
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
              top: 40,
              right: 20,
              left: 20,
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
