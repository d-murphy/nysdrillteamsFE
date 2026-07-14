import React, { useEffect, useState } from 'react'; 
import { Team, Run, SimilarTeam, FinishesReturn } from '../../types/types';
import Form from 'react-bootstrap/Form';
import { JR_CONTEST_STR } from '../../shared/components/TotalPoints';
declare var SERVICE_URL: string;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

import { BarChart, Bar, Label, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TimeCellContents, TotalPointsOverrideMsg } from '../../features/tournament/Scorecard';
import { niceTime } from '../../utils/timeUtils';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const order = [
    'Three Man Ladder', 'B Ladder', 'C Ladder', 'C Hose', 'B Hose', 'Efficiency', 'Motor Pump', 'Buckets', 
    'Individual Ladder', 'Motor H&L Dummy', 'Combination Hose & Pump', 'Motor Hose Replacement',
    'Running Ladder', 'Running Hose', 'Running Hose Replacement', 'Efficiency Replacement', 'Two into One', 'Equipment',
    ...JR_CONTEST_STR.split(",")
]
const orderLut: {[index:string]: number} = {}; 
order.forEach((el, ind) => orderLut[el] = ind + 1); 

export default function TeamSummary(){

    const [teams, setTeams] = useState<string[]>([]); 
    const [years, setYears] = useState<{year:number, numRuns: number}[]>([]); 
    const [error, setError] = useState(false); 
    const [loading, setLoading] = useState(false); 
    const [runs, setRuns] = useState<Run[]>([]); 
    const [similarTeams, setSimilarTeams] = useState<SimilarTeam[]>([]); 
    const [finishes, setFinishes] = useState<FinishesReturn[]>([]); 
    const [similarTeamsLoading, setSimilarTeamsLoading] = useState(false); 
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate(); 

    const teamSelected = searchParams.get('team'); 
    const yearSelected = parseInt(searchParams.get('year')); 
    const updateParam = (field:string, value?:string) => {
        if(!value) {
            searchParams.delete(field)
            return setSearchParams(searchParams)
        } else {
            searchParams.set(field, value)
            setSearchParams(searchParams)    
        }
    }
    useEffect(() => {
        getTeamsForFilter(setTeams, setError); 
    }, [])

    useEffect(() => {
        getYearsForFilter(setYears, setError, setLoading, teamSelected); 
        setRuns([]); 
        setFinishes([])
    }, [teamSelected])

    useEffect(() => {
        setRuns([]); 
        setFinishes([])
        setSimilarTeams([])

        setSimilarTeamsLoading(true)
        setLoading(true)
        getSimilarYears(setSimilarTeams, teamSelected, yearSelected); 
        // for the loading animation - doesn't take that long, but time draws attention
        setTimeout(() => setSimilarTeamsLoading(false), 2700); 
        getRuns(teamSelected, yearSelected, setRuns, setLoading, setError); 
        getFinishes(setFinishes, teamSelected, yearSelected); 
    }, [teamSelected, yearSelected])

    if(error) return (
        <div className="container mb-3">
            <div className="text-center w-100 fs-4 my-3"><b>Team Season Summaries</b></div>
            <div className="bg-white rounded shadow-sm p-4 text-center text-muted">
                Sorry, an error occurred.
            </div>
        </div>
    )

    return (
        <div className="container mb-3">
            <div className="text-center w-100 fs-4 my-3"><b>Team Season Summaries</b></div>
            <Filters teams={teams} teamSelected={teamSelected} 
                updateParam={updateParam} years={years}  
                yearSelected={yearSelected}  
                getResults={getRuns} setRuns={setRuns} loading={loading} />
            {runs.length ? 
                <Summary runs={runs} similarTeams={similarTeams} similarTeamsLoading={similarTeamsLoading} finishes={finishes}/> : <></> }
            <Results runs={runs} loading={loading}/>
        </div>
    )
}

const SimilarTeamsInfoTooltip = (props:any) => (
    <Tooltip id="similar-teams-info-tooltip" {...props} >
        Using percentage of points scored and frequency of good runs to find similar teams.
    </Tooltip>
);

interface SummaryProps {
    runs: Run[]
    similarTeams: SimilarTeam[]
    similarTeamsLoading: boolean
    finishes: FinishesReturn[]
}

function Summary({runs, similarTeams, similarTeamsLoading, finishes}: SummaryProps){
    let pointsSum = 0; 
    let areaPointsSum = 0; 
    let statePts = 0; 
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
        statePts += el.tournament === 'New York State Championship' ? el.points : 0; 
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
        <div className="team-seasons-panel bg-white rounded shadow-sm p-3 p-md-4 mb-3">
            {finishes.length > 0 && (
                <div className="team-seasons-finishes mb-3">
                    <Finishes finishes={finishes}/>
                </div>
            )}

            <div className="row g-3">
                <div className="col-12 col-lg-7">
                    <div className="team-seasons-kpis mb-3">
                        <div className="team-seasons-kpi">
                            <div className="team-seasons-kpi-label">Runs</div>
                            <div className="team-seasons-kpi-value">{runs.length}</div>
                        </div>
                        <div className="team-seasons-kpi">
                            <div className="team-seasons-kpi-label">Points</div>
                            <div className="team-seasons-kpi-value">{pointsSum}</div>
                            <div className="team-seasons-kpi-sub">{areaPointsSum} area</div>
                        </div>
                    </div>

                    <div className="team-seasons-section-label mb-2">Best / points by contest</div>
                    <div className="table-responsive">
                        <table className="table table-sm w-100 other-tables mb-0">
                            <thead>
                                <tr>
                                    <th scope="col" className="bg-white">Contest</th>
                                    <th scope="col" className="text-end">Best Time</th>
                                    <th scope="col" className="text-end">Pts (Area)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointsArr.map((el, ind) =>
                                    el.minTime === 0 ? null : (
                                        <tr key={ind}>
                                            <td>{el.contest}</td>
                                            <td className="text-end">{niceTime(el.minTime)}</td>
                                            <td className="text-end">
                                                {el.points} ({el.areaPoints})
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="col-12 col-lg-5">
                    {!similarTeams.length || pointsSum < 50 || runs.length < 50 || statePts < 1 ? (
                        <div className="team-seasons-aside h-100 d-flex align-items-center justify-content-center text-center text-muted small p-3">
                            Similar seasons appear once a season has enough scoring depth.
                        </div>
                    ) : similarTeamsLoading ? (
                        <div className="team-seasons-aside h-100 d-flex flex-column align-items-center justify-content-center p-4">
                            <div className="text-muted small mb-3">
                                <i>Searching for similar seasons</i>
                            </div>
                            <div className="spinner-border text-secondary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="team-seasons-aside h-100 p-3">
                            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                <div className="team-seasons-section-label mb-0">Similar seasons</div>
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={SimilarTeamsInfoTooltip}
                                >
                                    <span className="text-muted small pointer">
                                        <FontAwesomeIcon icon={faCircleInfo} />
                                    </span>
                                </OverlayTrigger>
                            </div>
                            <div className="d-flex flex-column gap-1 align-items-center">
                                {similarTeams.map((el, ind) => (
                                    <Link
                                        key={ind}
                                        className="video-links small"
                                        to={`/TeamSummaries?team=${el.otherTeam}&year=${el.otherYear}`}
                                    >
                                        {el.otherYear} - {el.otherTeam}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

interface FinishesProps {
    finishes: FinishesReturn[]
}

function Finishes({finishes} : FinishesProps){
    let stateTourneyWinner = false; 
    let stateTourneyTop5 = false; 
    let stateOfTourneyWinner = false; 
    let stateOfTop5 = false; 
    let stateJrTourneyWinner = false; 
    let stateJrTop5 = false; 
    const tournamentWins:string[] = []; 
    const otherTop5: string[] = []; 


    finishes.forEach(el => {
        if(["New York State Championship", "New York State Jr. Championship", "New York State OF Championship"].includes(el.name) && el.top5.finishingPosition === "1st Place") {
            if(el.name === "New York State Championship") stateTourneyWinner = true; 
            if(el.name === "New York State Jr. Championship") stateJrTourneyWinner = true; 
            if(el.name === "New York State OF Championship") stateOfTourneyWinner = true;             
        } else if(["New York State Championship", "New York State Jr. Championship", "New York State OF Championship"].includes(el.name)) {
            if(el.name === "New York State Championship") stateTourneyTop5 = true; 
            if(el.name === "New York State Jr. Championship") stateJrTop5 = true; 
            if(el.name === "New York State OF Championship") stateOfTop5 = true;             
        } else {
            el.top5.finishingPosition === "1st Place" ? tournamentWins.push(el.name) : otherTop5.push(el.name); 
        }
    })
    let tourneyWinsStr = ""; 
    tourneyWinsStr += tournamentWins.map((el, ind) => `${el.trim()}${ind < tournamentWins.length - 1 ? ", " : ""}`).join(""); 
    let top5Str = ""; 
    top5Str += otherTop5.map((el, ind) => `${el.trim()}${ind < otherTop5.length - 1 ? ", " : ""}`).join(""); 

    if(!finishes.length) return <></>
    return (
            <div className='team-seasons-finish-list'>
                {stateTourneyWinner ? <div className="team-seasons-finish-highlight">NY State Champ!</div> : <></>}
                {stateTourneyTop5 ? <div className="team-seasons-finish-highlight">Top 5 State Tournament!</div> : <></>}
                {stateOfTourneyWinner ? <div className="team-seasons-finish-highlight">NY OF State Champ!</div> : <></>}
                {stateOfTop5 ? <div className="team-seasons-finish-highlight">Top 5 OF State Tournament!</div> : <></>}
                {stateJrTourneyWinner ? <div className="team-seasons-finish-highlight">NY Jr. State Champ!</div> : <></>}
                {stateJrTop5 ? <div className="team-seasons-finish-highlight">Top 5 Jr. State Tournament!</div> : <></>}
                {tourneyWinsStr.length ? <div><span className="team-seasons-finish-label">Wins</span> {tourneyWinsStr}</div> : <></>}
                {top5Str.length ? <div><span className="team-seasons-finish-label">Top 5 finishes</span> {top5Str}</div> : <></>}
            </div>
    )
}

interface ResultsProps {
    runs: Run[]
    loading: boolean
}

function Results({runs, loading}:ResultsProps){
    const navigate = useNavigate(); 
    const tourns: {[index:number]: {date: number, dateDisplay: string, name: string, tournId: string}} = {}; 
    runs.forEach(run => {
        const runAsDate = new Date(run.date).getTime(); 
        if(!tourns[runAsDate]){
            tourns[runAsDate] = {date: new Date(run.date).getTime(), dateDisplay: new Date(run.date).toLocaleDateString(), name: run.tournament, tournId: run.tournamentId}
        }
    })
    const contests = Array.from(new Set(runs.map(el => el.contest))).sort((a,b) => !orderLut[a] ? 1 : !orderLut[b] ? -1 : orderLut[a] < orderLut[b] ? -1 : 1); 
    const runsLu: {[index:string]: Run} = {}; 
    const pointsTotalsLu: {[index: string]: number} = {}; 
    runs.forEach(run => {
        runsLu[`${new Date(run.date).getTime()}-${run.contest}`] = run; 
        const pointsKey = new Date(run.date).getTime(); 
        if(!pointsTotalsLu[pointsKey]) {
            pointsTotalsLu[pointsKey] = 0; 
        }
        if(run.points) pointsTotalsLu[pointsKey] += run.points; 
    })
    let buffer: JSX.Element[] = []; 
    Object.keys(tourns).sort().forEach(tournTime => {
        const tournTimeNum = parseInt(tournTime); 
        const tournPoints = Math.round(pointsTotalsLu[tournTime] *100) / 100|| ""; 
        let rowBuffer: JSX.Element[] = []; 
        // pushing two header cols.  one as normal cell for small screens
        const tournNameCellContent = <span className='font-weight-normal'>{tourns[tournTimeNum].name} - <span className='font-x-small'>{tourns[tournTimeNum].dateDisplay}</span></span>
        rowBuffer.push(<th scope="row" className="d-none d-md-block bg-white text-nowrap pointer" onClick={() => navigate(`/tournament/${tourns[tournTimeNum].tournId}`)}>{tournNameCellContent}</th>)
        rowBuffer.push(<td scope="row" className="d-block d-md-none text-nowrap pointer" onClick={() => navigate(`/tournament/${tourns[tournTimeNum].tournId}`)}>{tournNameCellContent}</td>)
        rowBuffer.push(<td scope="row" className='text-center px-3'>{tournPoints}</td>)
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
    if(loading) return <></>
    if(!runs.length) return (
        <div className="team-seasons-panel bg-white rounded shadow-sm p-4 text-center text-muted">
            Select a team and season to view the season summary.
        </div>
    )
    return (
        <div className="team-seasons-panel bg-white rounded shadow-sm p-3 p-md-4 mb-3">
            <div className="team-seasons-section-label mb-2">Season matrix</div>
            <div className="table-responsive">
                <table className="table table-sm w-auto other-tables mb-0">
                    <thead>
                        <tr>
                            <th scope="col" className="d-none d-md-table-cell bg-white">Tournament</th>
                            <th scope="col" className="d-md-none bg-white">Tournament</th>
                            <th scope="col" className="text-nowrap px-3">Tournament Pts</th>
                            {
                                contests.map(contest => {
                                return (
                                <React.Fragment key={contest}>
                                    <th scope="col" className="text-nowrap px-5">{contest}</th>
                                    <th scope="col" className="text-nowrap px-3">Pts</th>
                                </React.Fragment>
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
    updateParam: (field:string, value?:string) => void
    years: {year: number, numRuns: number} []
    yearSelected: number | ''
    setRuns: React.Dispatch<Run[]>
    getResults: Function
    loading: boolean
}

function Filters({teams, teamSelected, updateParam, years, yearSelected, setRuns, getResults, loading}:filtersProps){

    const handleSeasonChange = (newVal:string) => {
        setRuns([]); 
        updateParam('year', newVal)
    }
    return (
        <div className="team-seasons-panel bg-white rounded shadow-sm p-3 p-md-4 mb-3">
            <div className="row g-3">
                <div className="col-12 col-lg-5">
                    <div className="team-seasons-kicker">Find a season</div>
                    <label className="form-label small mb-1">Team</label>
                    <Form.Select
                        aria-label="Select Team"
                        value={teamSelected || ""}
                        onChange={(e) => {
                            updateParam("team", e.target.value);
                            updateParam("year");
                        }}
                    >
                        <option value=""></option>
                        {teams.map((el) => (
                            <option key={el} value={el}>
                                {el}
                            </option>
                        ))}
                    </Form.Select>

                    <label className="form-label small mb-1 mt-3">Season</label>
                    <Form.Select
                        aria-label="Select Year"
                        value={yearSelected || ""}
                        onChange={(e) => handleSeasonChange(e.target.value)}
                        disabled={!teamSelected}
                    >
                        <option value=""></option>
                        {years.map((el) => (
                            <option key={el.year} value={el.year}>
                                {`${el.year} - ${el.numRuns} run${el.numRuns > 1 ? "s" : ""}`}
                            </option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-12 col-lg-7">
                    <div className="team-seasons-chart-wrap h-100">
                        <div className="team-seasons-section-label text-center mb-2">
                            Years active
                        </div>
                        <div style={{ width: "100%", height: 240 }} className="px-1">
                            {!years.length ? (
                                <div className="h-100 d-flex align-items-center justify-content-center text-muted small text-center p-3">
                                    {teamSelected
                                        ? loading
                                            ? ""
                                            : "There's no run data for this team."
                                        : "Select a team to view active years."}
                                </div>
                            ) : (
                                <Chart data={years} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}





function getTeamsForFilter(stateSetter:Function, errorSetter: Function){
    fetch(`${SERVICE_URL}/teams/getTeams`)
        .then(response => response.json())
        .then(data => {
            data = data
                .filter((el: Team) => el.display)
                .map((el:Team) => el.fullName)
                .filter((el:string) => el)
                .sort((a:string, b:string) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
            stateSetter(data); 
        })
        .catch(() => {
            errorSetter(true)
        })
}

function getYearsForFilter(stateSetter:Function, errorSetter:Function, setLoading:Function,  teamSelected: string){
    setLoading(true)
    fetch(`${SERVICE_URL}/runs/getYearRunCounts?team=${encodeURIComponent(teamSelected)}`)
        .then(response => response.json())
        .then(data => {
            data = data
                .filter((el:{_id: number, yearRunCount: number}) => el._id)
                .map((el:{_id: number, yearRunCount: number}) => {return {year: el._id, numRuns: el.yearRunCount}})
            data.sort((a: {year:number},b: {year:number}) => a.year > b.year ? -1 : 1)
            stateSetter(data); 
            setLoading(false); 
        })
        .catch(() => {
            errorSetter(true)
        })
}

function getRuns(teamSelected: string, yearSelected:number, setRuns: Function, setLoading: Function, setError: Function){
    if(!yearSelected || !teamSelected) return; 
    fetch(`${SERVICE_URL}/runs/getTeamSummary?year=${yearSelected}&team=${encodeURIComponent(teamSelected)}`)
    .then(response => response.json())
    .then(data => {
        setRuns(data); 
        setLoading(false); 
    })
    .catch(() => {
        setError(true)
    })
}


function getSimilarYears(stateSetter:Function, teamSelected: string, year: number){
    if(!teamSelected || !year) return 
    fetch(`${SERVICE_URL}/teams/getSimilarTeams?team=${encodeURIComponent(teamSelected)}&year=${year}`)
        .then(response => response.json())
        .then(data => {
            stateSetter(data); 
        })
        .catch(() => {
            stateSetter([])
        })
}

function getFinishes(stateSetter: Function, teamSelected: string, year: number){
    if(!teamSelected || !year) return; 
    fetch(`${SERVICE_URL}/tournaments/getFinishes?team=${encodeURIComponent(teamSelected)}&years=${year}`)
        .then(response => response.json())
        .then(data => {
            data.sort((a:FinishesReturn,b:FinishesReturn) => new Date(a.date) < new Date(b.date) ? -1 : 1)
            stateSetter(data); 
        })
        .catch(() => {
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
                <Bar dataKey={"numRuns"} fill="#013369" radius={2} maxBarSize={5} /> 
            }
          </BarChart>
        </ResponsiveContainer>
      );
}
