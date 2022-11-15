import * as React from "react";
import { useState, useEffect } from "react";
import { useLoginContext } from "../utils/context";
import { Tournament, Track, Team, Run } from "../types/types"
import { fetchPost } from "../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPenToSquare, faTrash, faPersonRunning } from "@fortawesome/free-solid-svg-icons"; 
import dateUtil from '../utils/dateUtils'; 
import EditTop5 from "./adminTournamentsComps/editTop5"; 
import EditRunningOrder from "./adminTournamentsComps/EditRunningOrder"; 
import EditContests from "./adminTournamentsComps/EditContests"; 
import EditScheduleAndTotalPoints from "./adminTournamentsComps/EditScheduleAndTotalPoints"
import TournVideos from "./adminTournamentsComps/TournVideos"; 
import RunsEdit from "./adminTournamentsComps/RunsEdit"; 

interface AdminTournamentProps {
    tracks: Track[];
    teams: Team[]; 
}

declare var SERVICE_URL: string;

let initialTourn:Tournament = {
    _id: '', 
    id: null, 
    name: '', 
    year: null, 
    date: new Date(), 
    startTime: null, 
    nassauPoints: false, 
    suffolkPoints: false, 
    westernPoints: false, 
    northernPoints: false, 
    suffolkOfPoints: false, 
    nassauOfPoints: false, 
    liOfPoints: false, 
    juniorPoints: false,
    nassauSchedule: false, 
    suffolkSchedule: false, 
    westernSchedule: false, 
    northernSchedule: false, 
    liOfSchedule: false, 
    juniorSchedule: false,
    track: '',
    runningOrder: {},
    sanctioned: false, 
    cfp: false, 
    top5: [],  
    contests: [
        {name:"Three Man Ladder", cfp:true, sanction:true},
        {name:"B Ladder", cfp:true, sanction:true},
        {name:"C Ladder", cfp:true, sanction:true},
        {name:"C Hose", cfp:true, sanction:true},
        {name:"B Hose", cfp:true, sanction:true},
        {name:"Efficiency", cfp:true, sanction:true},
        {name:"Motor Pump", cfp:true, sanction:true},
        {name:"Buckets", cfp:true, sanction:true}
    ],
    liveStreamPlanned: false, 
    urls: [], 
    waterTime: ''
}

export default function AdminTournaments(props:AdminTournamentProps) {
    const currentYear = new Date().getFullYear(); 
    const tracks = props.tracks; 
    const teams = props.teams; 
    let [year, setYear] = useState(currentYear); 
    let [tourns, setTourns] = useState<Tournament[]>([]); 
    let [tournInReview, setTournInReview] = useState<Tournament>(initialTourn); 
    let [runsForTourn, setRunsForTourn] = useState<Run[]>([]); 
    let [editOrCreate, setEditOrCreate] = useState(""); 
    let [reqSubmitted, setReqSubmitted] = useState(false); 
    let [reqResult, setReqResult] = useState<{error: boolean, message:string}>({error:false, message:""}); 
    let [runsEditContest, setRunsEditContest] = useState("Please select a contest."); 
    const { sessionId, rolesArr  } = useLoginContext(); 
    const isAdmin = rolesArr.includes("admin"); 

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setTournInReview({
            ...tournInReview, 
            [e.target.id]: e.target.value
        })
    }

    function handleDateInput(e:React.ChangeEvent<HTMLInputElement>){
        setTournInReview({
            ...tournInReview, 
            [e.target.id]: new Date(`${e.target.value} 12:00:00`)
        })
    }

    function handleTimeInput(e:React.ChangeEvent<HTMLInputElement>){
        console.log('time? ', e.target.value)
        setTournInReview({
            ...tournInReview, 
            [e.target.id]: new Date(`2022-01-01 ${e.target.value}`)
        })
    }

    function handleCheck(e:React.ChangeEvent<HTMLInputElement>){
        setTournInReview({
            ...tournInReview, 
            [e.target.id]: e.target.checked
        })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setTournInReview({
            ...tournInReview, 
            [e.target.id]: e.target.value
        })
    }

    function handleYearChange(e:React.ChangeEvent<HTMLInputElement>){
        setYear(parseInt(e.target.value))
    }


    function loadTournament(tournament:Tournament){
        setTournInReview({
            ...tournament
        })
        setRunsForTourn([]); 
        getRunsForTourn(tournament.id); 
    }

    function getTournaments(year:number){
        fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?years=${year}`)
        .then(response => response.json())
        .then((data:Tournament[]) => {
            data = data.sort((a:Tournament,b:Tournament) => a.date < b.date ? -1 : 1)
            setTourns(data)    
        })
    }

    function changeYear(year:number){
        console.log('change year called'); 
        setYear(year); 
        getTournaments(year); 
    }

    useEffect(() => {
        changeYear(new Date().getFullYear())
    }, [])


    async function insertOrUpdate(){
        setReqSubmitted(true); 
        let url:string, body:{tournamentId: string, fieldsToUpdate: {}} | Tournament ; 
        if(editOrCreate == "Edit"){
            url = `${SERVICE_URL}/tournaments/updateTournament`
            let fieldsToUpdate = {...tournInReview}
            delete fieldsToUpdate._id; 
            body = {
                tournamentId: tournInReview._id, 
                fieldsToUpdate: fieldsToUpdate
            }
        } else {
            url = `${SERVICE_URL}/tournaments/insertTournament`
            body = {
                ...tournInReview, 
                afterMigrate: true
            }
            delete body._id; 
        }
        try {
            await fetchPost(url, body, sessionId)
            setReqResult({error: false, message: "Update successful."}); 
            getTournaments(year); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred. Try again later."}); 
            setReqSubmitted(false); 
        }
    }

    async function deleteTourn(){
        setReqSubmitted(true); 
        let body = {tournamentId: tournInReview._id}; 
        let url = `${SERVICE_URL}/tournaments/deleteTournament`
        try {
            await fetchPost(url, body, sessionId)
            setReqResult({error: false, message: "Update successful."}); 
            getTournaments(year); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred. Try again later."}); 
            setReqSubmitted(false); 
        }
    }

    function getRunsForTourn(tournId:number){
        setReqSubmitted(true);
        fetch(`${SERVICE_URL}/runs/getRunsFromTournament?tournamentId=${tournId}`)
            .then(response => response.json())
            .then((data:Run[]) => {
                setRunsForTourn(data); 
                setReqSubmitted(false); 
            })
    }

    function modalCleanup(){
        setReqResult({error:false, message: ""}); 
        setReqSubmitted(false); 
    }

    return (
        <div className="container">
            <div className="d-flex flex-column align-items-center justify-content-center">

                <div className="d-flex justify-content-center">
                    <div className="d-flex flex-row align-items-center me-5">
                        <button className="btn add-entry-button me-2" onClick={() => changeYear(year)}>Update Year</button>
                        <input className="p-1"
                            value={year} onChange={handleYearChange} type="number" id="yearToDisplay" name="yearToDisplay" min="1900" max={new Date().getFullYear() + 1}/>
                    </div> 
                    <div 
                        className="btn add-entry-button my-5 ms-5" 
                        data-bs-toggle="modal" 
                        data-bs-target="#editTournModal"
                        onClick={()=>{
                            modalCleanup(); 
                            setEditOrCreate("Create"); 
                            loadTournament(initialTourn); 
                        }}>Add New Tournament
                    </div>

                </div>
                <div className="bg-light w-100 mx-5 rounded py-4 mb-2">
                    {
                        tourns.map((tourn, ind) => {
                            return(
                                <div key={ind} className="row w-100 my-1">
                                    <div className="col-7">
                                        <div className="pointer d-flex justify-content-center">
                                            {`${ dateUtil.getMMDDYYYY(tourn.date)} - ${tourn.name}`}
                                        </div>
                                    </div>
                                    <div className="col d-flex flew-row align-items-center justify-content-center">
                                        <div className="col-2"/>
                                        <div className="pointer col text-center"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editTournModal"
                                            onClick={()=>{
                                                setEditOrCreate("Edit"); 
                                                modalCleanup(); 
                                                loadTournament(tourn); 
                                            }}
                                            ><FontAwesomeIcon className="crud-links font-x-large" icon={faPenToSquare} />
                                        </div>
                                        <div className="pointer col text-center"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editRunsModal"
                                            onClick={()=>{
                                                setRunsEditContest("Please select a contest."); 
                                                loadTournament(tourn); 
                                            }}
                                            ><FontAwesomeIcon className="crud-links font-x-large" icon={faPersonRunning} />
                                        </div>
                                        {tourn.afterMigrate ? 
                                            <div className="pointer col text-center"
                                                data-bs-toggle="modal" 
                                                data-bs-target="#deleteTournModal"
                                                onClick={()=>{
                                                    modalCleanup(); 
                                                    loadTournament(tourn); 
                                                }}
                                                ><FontAwesomeIcon className="crud-links font-x-large" icon={faTrash}/>
                                            </div> : <div className="col-3 text-center">&nbsp;</div>}
                                        <div className="col-2"/>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className="modal fade" id="editTournModal" aria-labelledby="editTournModal" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="tournModalLabel">{editOrCreate == "Edit" ? "Edit Tournament" : "Add Tournament"}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-center mb-3">
                                {editOrCreate == "Edit" ? 
                                    <i>
                                        {tournInReview?.afterMigrate ? "Created after 2022 migration." : "Migrated from previous site."}
                                    </i> : <></>
                                }
                            </div>
                            {editOrCreate == 'Edit' ? 
                                <div className="d-flex justify-content-center mb-3">
                                    There are {runsForTourn.length} runs attached to this event.
                                </div> : <></>                        
                            }

                            <div className="row my-1">
                                <div className="col-4 text-center">Name</div>
                                <div className="col-8 text-center px-4">
                                    <input 
                                        onChange={(e) => handleTextInput(e)} 
                                        id="name" 
                                        value={tournInReview.name} 
                                        className="text-center width-100" 
                                        disabled={!isAdmin}
                                        autoComplete="off"></input>
                                </div>
                            </div>
                            <div className="row my-1">
                                <div className="col-4 text-center">Date</div>
                                <div className="col-8 d-flex justify-content-around px-4" >
                                    <div>{dateUtil.getYYYYMMDD(tournInReview.date)}</div>
                                    <input 
                                        type='date'
                                        onChange={(e) => handleDateInput(e)} 
                                        id="date" 
                                        value={dateUtil.getYYYYMMDD(tournInReview.date)} 
                                        placeholder={dateUtil.getYYYYMMDD(tournInReview.date)} 
                                        className="text-center width-8" 
                                        disabled={!isAdmin}
                                        ></input>
                                </div>
                            </div>
                            <div className="row my-1">
                                <div className="col-4 text-center">Time</div>
                                <div className="col-8 d-flex justify-content-around px-4" >
                                    <div>{dateUtil.getTime(tournInReview.startTime)}</div>
                                    <input 
                                        type='time'
                                        onChange={(e) => handleTimeInput(e)} 
                                        id="startTime" 
                                        value={dateUtil.getTimeForInput(tournInReview.startTime)} 
                                        placeholder={dateUtil.getTimeForInput(tournInReview.startTime)} 
                                        className="text-center width-15 pe-2" 
                                        disabled={!isAdmin}
                                        ></input>
                                </div>
                            </div>
                            <div className="row my-1">
                                <div className="col-4 text-center">Track</div>
                                <div className="col-8 text-center px-4">
                                    <select onChange={handleSelect} id="track" name="track" className="width-100 text-center" value={tournInReview.track} disabled={!isAdmin}>
                                        <option value={null}></option>
                                        {tracks.map(el => {
                                            return (<option value={el.name}>{el.name}</option>)
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="row my-1">
                                <div className="col-4 text-center">Water Time</div>
                                <div className="col-8 text-center px-4">
                                    <input 
                                            onChange={(e) => handleTextInput(e)} 
                                            id="waterTime" 
                                            value={tournInReview.waterTime} 
                                            className="text-center width-100" 
                                            disabled={!isAdmin}
                                            autoComplete="off"></input>
                                </div>
                            </div>
                            <div className="row my-4">
                                <div className="col-6 d-flex flex-column align-items-center">
                                    <div>Sanctioned?</div>
                                    <div>
                                        <input className="form-check-input" type="checkbox" id="sanctioned" name="sanctioned" checked={tournInReview?.sanctioned} onChange={handleCheck} disabled={!isAdmin}></input>
                                    </div>
                                </div>
                                <div className="col-6 d-flex flex-column align-items-center">
                                    <div>Counts for Points?</div>
                                    <div>
                                        <input className="form-check-input" type="checkbox" id="cfp" name="cfp" checked={tournInReview?.cfp} onChange={handleCheck} disabled={!isAdmin}></input>
                                    </div>
                                </div>
                            </div>
                            <div className="row my-3">
                                <div className="col-6 d-flex flex-column align-items-center">
                                    <div>Live Stream Planned?</div>
                                    <div>
                                        <input className="form-check-input" type="checkbox" id="liveStreamPlanned" name="liveStreamPlanned" checked={tournInReview?.liveStreamPlanned} onChange={handleCheck} disabled={!isAdmin}></input>
                                    </div>
                                </div>
                                <TournVideos tournInReview={tournInReview} setTournInReview={setTournInReview}/>
                            </div>




                            <EditScheduleAndTotalPoints isAdmin={isAdmin} tournInReview={tournInReview} handleCheck={handleCheck} />
                            <EditContests isAdmin={isAdmin} tournInReview={tournInReview} setTournInReview={setTournInReview} teams={teams}/>
                            <EditRunningOrder isAdmin={isAdmin} tournInReview={tournInReview} setTournInReview={setTournInReview} teams={teams} runsForTourn={runsForTourn}/>
                            <EditTop5 isAdmin={isAdmin} tournInReview={tournInReview} setTournInReview={setTournInReview} teams={teams}/>



                        </div>
                        <div className="modal-footer d-flex flex-column">
                            <div className="text-center">
                                {!isAdmin ? <span>
                                    Only admin can make changes here.
                                </span> : <></>}
                            </div>
                            <div className="text-center my-3">
                                {reqResult.message ? <span className={reqResult.error ? 'text-danger' : 'text-success'}>
                                    {reqResult.message}
                                </span> : <></>}
                            </div>
                            <div className="">
                                <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                <button type="button" className="btn btn-primary mx-2" disabled={!isAdmin || reqSubmitted} onClick={insertOrUpdate}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="modal fade" id="deleteTournModal" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-l">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteTournModalLabel">Delete Team?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {reqSubmitted ? <p>Chill for a second.</p> : 
                                runsForTourn.length ? 
                                    <p>You can not delete tournaments which have runs attached.  This one has {runsForTourn.length}.</p> : 
                                    <p>Are you sure you want to remove {tournInReview.name} on {dateUtil.getMMDDYYYY(tournInReview.date)}?</p>                        
                            }
                        </div>
                        <div className="modal-footer d-flex flex-column">
                            <div className="text-center">
                                {!isAdmin ? <span>
                                    Only admin can make changes here.
                                </span> : <></>}
                            </div>
                            <div className="text-center my-3">
                                {reqResult.message ? <span className={reqResult.error ? 'text-danger' : 'text-success'}>
                                    {reqResult.message}
                                </span> : <></>}
                            </div>
                            <div className="">
                                <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                <button type="button" className="btn btn-warning mx-2" disabled={!isAdmin || reqSubmitted || runsForTourn.length>0} onClick={deleteTourn}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="editRunsModal" aria-labelledby="editRunsModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editRunsModalLabel">Edit Runs?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <RunsEdit isAdmin={isAdmin} tournInReview={tournInReview} teams={teams} runsForTourn={runsForTourn} runsEditContest={runsEditContest} setRunsEditContest={setRunsEditContest}/>
                        </div>
                        <div className="modal-footer d-flex flex-column">
                            <div className="text-center">
                                {!isAdmin ? <span>
                                    Only admin can make changes here.
                                </span> : <></>}
                            </div>
                            <div className="text-center my-3">
                                {reqResult.message ? <span className={reqResult.error ? 'text-danger' : 'text-success'}>
                                    {reqResult.message}
                                </span> : <></>}
                            </div>
                            <div className="">
                                <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                <button type="button" className="btn btn-warning mx-2" disabled={!isAdmin || reqSubmitted || runsForTourn.length>0} onClick={deleteTourn}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



        </div>
    )
}
