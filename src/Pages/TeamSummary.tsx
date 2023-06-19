import React, { useEffect, useState } from 'react'; 
import { useSearchParams } from 'react-router-dom';
import { Team, Run } from '../types/types'; 
import Form from 'react-bootstrap/Form';

declare var SERVICE_URL: string;


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
                .filter((el:Team) => typeof(el?.fullName)=='string' && !el.fullName.includes("Jr."))
                .map((el:Team) => el.fullName)
                .sort((a:string, b:string) => a < b ? -1 : 1)
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
