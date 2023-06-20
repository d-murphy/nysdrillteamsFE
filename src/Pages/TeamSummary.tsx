import React, { useEffect, useState } from 'react'; 
import { useSearchParams } from 'react-router-dom';
import { Team, Run } from '../types/types'; 
import Form from 'react-bootstrap/Form';
import { JR_CONTEST_STR } from '../Components/TotalPoints'; 
declare var SERVICE_URL: string;

const order = [
    'Three Man Ladder', 'B Ladder', 'C Ladder', 'C Hose', 'B Hose', 'Efficiency', 'Motor Pump', 'Buckets', 
    'Individual Ladder', 'Motor H&L Dummy', 'Combination Hose & Pump', 'Motor Hose Replacement',
    'Running Ladder', 'Running Hose', 'Running Hose Replacement', 'Efficiency Replacement', 'Two into One',
    ...JR_CONTEST_STR.split(",")
]
const orderLut: {[index:string]: number} = {}; 
order.forEach((el, ind) => orderLut[el] = ind + 1); 

export default function TeamSummary(){
    const currentYear = new Date().getMonth() >= 5 ? new Date().getFullYear() : new Date().getFullYear() - 1; 

    const [searchParams, setSearchParams] = useSearchParams();
    const [teamSelected, setTeamSelected] = useState(""); 
    const [teams, setTeams] = useState<string[]>([]); 
    const [yearSelected, setYearSelected] = useState(currentYear); 
    const [years, setYears] = useState<number[]>([]); 
    const [error, setError] = useState(false); 
    const [runs, setRuns] = useState<Run[]>([]); 

    useEffect(() => {
        getTeamsForFilter(setTeams, setError); 
        getYearsForFilter(setYears, setError); 
    }, [])

    function getRuns(){
        fetch(`${SERVICE_URL}/runs/getTeamSummary?year=${yearSelected}&team=${teamSelected}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
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
                <div className="text-center w-100 font-x-large mt-2"><b>Team Summaries</b></div>
                <Filters teams={teams} teamSelected={teamSelected} setTeamSelected={setTeamSelected} years={years}  yearSelected={yearSelected} setYearSelected={setYearSelected} getResults={getRuns} />
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
    const contests = Array.from(new Set(runs.map(el => el.contest))).sort((a,b) => !orderLut[a] ? -1 : !orderLut[b] ? 1 : orderLut[a] < orderLut[b] ? -1 : 1); 
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
        rowBuffer.push(<td scope="row" className="d-block d-md-none text-nowrap">{tournNameCellContent}</td>)
        contests.forEach(contest => {
            let key = `${tournTime}-${contest}`; 
            if(!runsLu[key]) {
                rowBuffer.push(<td></td>)
                rowBuffer.push(<td></td>)
            } else {       
                const run = runsLu[key]; 
                const isPoints = run?.suffolkPoints || run?.nassauPoints || run?.westernPoints || run?.northernPoints || run?.suffolkOfPoints || run?.nassauOfPoints || run?.liOfPoints || run?.juniorPoints; 
                rowBuffer.push(<td className='text-center px-3' >{runsLu[key].time}</td>); 
                isPoints ? 
                    rowBuffer.push(<td className='table-secondary text-center px-2' >{runsLu[key].points}</td>) :
                    rowBuffer.push(<td className='text-center px-2'>{runsLu[key].points}</td>)
            }
        })
        buffer.push(<tr>{...rowBuffer}</tr>)
    })

    if(!runs.length) return <div className='text-center mt-3 bg-white rounded shadow-sm p-2'>Please select a new team.</div>
    return (
        <div className="mt-3 bg-white rounded shadow-sm p-2">

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
    years: number []
    yearSelected: number
    setYearSelected: React.Dispatch<number>
    getResults: Function
}

function Filters({teams, teamSelected, setTeamSelected, years, yearSelected, setYearSelected, getResults}:filtersProps){
    return (
        <div className="mt-3 bg-white rounded shadow-sm p-2">
            <div className='row'>
                <div className='col-0 col-lg-2' />
                <div className="col-12 col-lg-4">
                    <div className='p-1'>
                        <Form.Select aria-label="Select Team" value={teamSelected} onChange={((e) => setTeamSelected(e.target.value))}>
                            <option value=""></option>
                            {teams.map(el => {
                                return <option value={el}>{el}</option>
                            })}
                        </Form.Select>
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <div className='p-1'>
                        <Form.Select aria-label="Select Year" value={yearSelected} onChange={(e) => setYearSelected(parseInt(e.target.value))}>
                            {years.map(el => {
                                return <option value={el}>{el}</option>
                            })}
                        </Form.Select>
                    </div>
                </div>
                <div className='col-0 col-lg-2' />
                <div className="col-12">
                    <div className='p-3 d-flex justify-content-center w-100'>
                        <button type="button" onClick={() => getResults()} disabled={!teams.length || !years.length || !teamSelected } className="btn submit-search-button font-medium" >See Team Summary</button>
                    </div>
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

async function getYearsForFilter(stateSetter:Function, errorSetter:Function){
    fetch(`${SERVICE_URL}/tournaments/getTournsCtByYear`)
        .then(response => response.json())
        .then(data => {
            data = data
                .map((el:{_id: number, yearCount: number}) => el._id)
                .filter((el:number) => el && el <= new Date().getFullYear())
                .sort((a:number, b:number) => a < b ? -1 : 1)
            stateSetter(data); 
        })
        .catch(err => {
            console.log(err); 
            errorSetter(true)
        })
}
