import * as React from "react";
import { useState, useEffect } from "react";
import { useLoginContext } from "../utils/context";
import { Tournament, Track, Team } from "../types/types"
import { fetchPost } from "../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPenToSquare, faTrash, faPlus, faVideo } from "@fortawesome/free-solid-svg-icons"; 
import dateUtil from '../utils/dateUtils'; 
import ContestOptions from "./ContestOptions"; 


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
    date: null, 
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
    const teams = props.teams.sort((a,b) => a.fullName < b.fullName ? -1 : 1)
    let [year, setYear] = useState(currentYear); 
    let [tourns, setTourns] = useState<Tournament[]>([]); 
    let [tournInReview, setTournInReview] = useState<Tournament>(initialTourn); 
    let [editOrCreate, setEditOrCreate] = useState(""); 
    let [reqSubmitted, setReqSubmitted] = useState(false); 
    let [reqResult, setReqResult] = useState<{error: boolean, message:string}>({error:false, message:""}); 
    const { sessionId, rolesArr  } = useLoginContext(); 
    let [showUrlInput, setShowUrlInput] = useState(false); 
    let [newUrl, setNewUrl] = useState(""); 

    const isAdmin = rolesArr.includes("admin"); 

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setTournInReview({
            ...tournInReview, 
            [e.target.id]: e.target.value
        })
    }

    function handleDateInput(e:React.ChangeEvent<HTMLInputElement>){
        console.log('date? ', e.target.value)
        console.log('date as date? ', new Date(`${e.target.value} 12:00:00`))
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

    function handleLinkTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setNewUrl(e.target.value)
    }

    function addVideoLink(){
        let urls = tournInReview.urls && tournInReview.urls.length ? tournInReview.urls : []; 
        setTournInReview({
            ...tournInReview, 
            urls: [...urls, newUrl]
        })
        setNewUrl(""); 
        setShowUrlInput(false);
    }

    function removeVideoLink(index:number){
        let urls = tournInReview.urls;  
        urls = urls.filter((el, ind) => ind != index ); 
        setTournInReview({
            ...tournInReview, 
            urls: [...urls]
        })
    }

    function addTeamToRunningOrder(){
        let runOrder = {
            ...tournInReview.runningOrder
        }; 
        let max = Object.keys(runOrder).length ? Math.max(...Object.keys(runOrder).map(el => parseInt(el))) : 0; 
        max++; 
        runOrder[max] = '';
        setTournInReview({
            ...tournInReview, 
            runningOrder: runOrder
        })
    }

    function selectTeamInRunningOrder(e:React.ChangeEvent<HTMLSelectElement>, key:number){
        let runOrder = {
            ...tournInReview.runningOrder
        }
        runOrder[key] = e.target.value; 
        setTournInReview({
            ...tournInReview, 
            runningOrder: runOrder
        })
    }

    function addContest(){
        let contests = [...tournInReview.contests, {name: null, cfp:true, sanction:true }]; 
        setTournInReview({
            ...tournInReview, 
            contests: contests
        })
    }

    function selectContext(e:React.ChangeEvent<HTMLSelectElement>, ind:number){
        let contests = [...tournInReview.contests]; 
        contests[ind] = {
            ...contests[ind], 
            name: e.target.value
        }; 
        setTournInReview({
            ...tournInReview, 
            contests: contests
        })
    }
    

    function loadTournament(tournament:Tournament){
        // if(!track?.archHeightFt) track.archHeightFt = 999; 
        setTournInReview({
            ...tournament
        })
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
                                    <div className="col-8">
                                        <div className="pointer d-flex justify-content-center">
                                            {`${ dateUtil.getMMDDYYYY(tourn.date)} - ${tourn.name}`}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="pointer px-3 d-flex align-items-center justify-content-center"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editTournModal"
                                            onClick={()=>{
                                                setEditOrCreate("Edit"); 
                                                modalCleanup(); 
                                                loadTournament(tourn); 
                                            }}
                                            ><FontAwesomeIcon className="crud-links font-x-large" icon={faPenToSquare} />
                                        </div>
                                        {tourn.afterMigrate ? 
                                            <div className="pointer px-3"
                                                data-bs-toggle="modal" 
                                                data-bs-target="#deleteTeamModal"
                                                onClick={()=>{
                                                    modalCleanup(); 
                                                    loadTournament(tourn); 
                                                }}
                                                ><FontAwesomeIcon className="crud-links font-x-large" icon={faTrash}/>
                                            </div> : <></>}


                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className="modal fade" id="editTournModal" aria-labelledby="editTournModal" aria-hidden="true">
                <div className="modal-dialog modal-lg">
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
                                    <input type="checkbox" id="sanctioned" name="sanctioned" checked={tournInReview?.sanctioned} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col-6 d-flex flex-column align-items-center">
                                <div>Counts for Points?</div>
                                <div>
                                    <input type="checkbox" id="cfp" name="cfp" checked={tournInReview?.cfp} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                        </div>
                        <div className="row my-3">
                            <div className="col-6 d-flex flex-column align-items-center">
                                <div>Live Stream Planned?</div>
                                <div>
                                    <input type="checkbox" id="liveStreamPlanned" name="liveStreamPlanned" checked={tournInReview?.liveStreamPlanned} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col-6 d-flex flex-column align-items-center">
                                <div>Tourn Videos <FontAwesomeIcon className="mx-2" icon={faPlus} onClick={() => setShowUrlInput(true)} /> </div>
                                {tournInReview.urls.map((el, ind) => {
                                    return (
                                        <div className="my-1" key={ind}>
                                            <a href={el}><FontAwesomeIcon icon={faVideo} size='sm' className="mx-2"/></a>
                                            <FontAwesomeIcon icon={faTrash} size='sm' onClick={() => removeVideoLink(ind)} className="mx-2"/>

                                        </div>)
                                })}
                                {showUrlInput ? <div className="d-flex justify-content-around align-items-center mt-2">
                                        <input className="w-50" id='newUrl' name='newUrl' value={newUrl} onChange={handleLinkTextInput} placeholder="Add video url here"/>
                                        <FontAwesomeIcon icon={faPlus} size='sm' onClick={addVideoLink} className="mx-2"/>
                                    </div> : <></>}
                            </div>
                        </div>
                        <div className="row my-3 pt-2 border-top">
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Nassau Points?</div>
                                <div>
                                    <input type="checkbox" id="nassauPoints" name="nassauPoints" checked={tournInReview?.nassauPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Northern Points?</div>
                                <div>
                                    <input type="checkbox" id="northernPoints" name="northernPoints" checked={tournInReview?.northernPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Suffolk Points?</div>
                                <div>
                                    <input type="checkbox" id="suffolkPoints" name="suffolkPoints" checked={tournInReview?.suffolkPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Western Points?</div>
                                <div>
                                    <input type="checkbox" id="westernPoints" name="westernPoints" checked={tournInReview?.westernPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Jr Points?</div>
                                <div>
                                    <input type="checkbox" id="juniorPoints" name="juniorPoints" checked={tournInReview?.juniorPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Nassau OF Points?</div>
                                <div>
                                    <input type="checkbox" id="nassauOfPoints" name="nassauOfPoints" checked={tournInReview?.nassauOfPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Suffolk OF Points?</div>
                                <div>
                                    <input type="checkbox" id="suffolkOfPoints" name="suffolkOfPoints" checked={tournInReview?.suffolkOfPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                        </div>
                        <div className="row my-3 pt-2 border-top">
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Nassau Schedule?</div>
                                <div>
                                    <input type="checkbox" id="nassauSchedule" name="nassauSchedule" checked={tournInReview?.nassauSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Northern Schedule?</div>
                                <div>
                                    <input type="checkbox" id="northernSchedule" name="northernSchedule" checked={tournInReview?.northernSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Suffolk Schedule?</div>
                                <div>
                                    <input type="checkbox" id="suffolkSchedule" name="suffolkSchedule" checked={tournInReview?.suffolkSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Western Schedule?</div>
                                <div>
                                    <input type="checkbox" id="westernSchedule" name="westernSchedule" checked={tournInReview?.westernSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">Jr Schedule?</div>
                                <div>
                                    <input type="checkbox" id="juniorSchedule" name="juniorSchedule" checked={tournInReview?.juniorSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                            <div className="col d-flex flex-column align-items-center">
                                <div className="text-center">OF Schedule?</div>
                                <div>
                                    <input type="checkbox" id="liOfSchedule" name="liOfSchedule" checked={tournInReview?.liOfSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                                </div>
                            </div>
                        </div>

                        <div className="row my-3 pt-2 border-top">
                            <div className="row">
                                <div className="col d-flex justify-content-center align-items-center my-2">
                                    Add Contest<FontAwesomeIcon className="mx-2 pointer" icon={faPlus} onClick={() => addContest()} />
                                </div>
                            </div>
                            {
                                tournInReview.contests.map((contest, ind) => {
                                    return (
                                        <div className="row mt-1">
                                            <div className="col-2 text-center">{ind + 1}.</div>
                                            <div className="col-10 d-flex flex-row justifiy-contest-center align-items-center">
                                                <select onChange={(e) => selectContext(e, ind)} className="width-50 text-center" value={contest.name} disabled={!isAdmin}>
                                                    <ContestOptions/>
                                                </select>
                                                <div>Counts for Points</div>
                                                <div>Sanctioned</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>



                        <div className="row my-3 pt-2 border-top">
                            <div className="row">
                                <div className="col d-flex justify-content-center align-items-center my-2">
                                    Add Team to Running Order<FontAwesomeIcon className="mx-2 pointer" icon={faPlus} onClick={() => addTeamToRunningOrder()} />
                                </div>
                            </div>
                            {
                                Object.keys(tournInReview.runningOrder).map((key:string) => {
                                    return (
                                        <div className="row mt-1">
                                            <div className="col-2 text-center">{key}.</div>
                                            <div className="col-10">
                                                <select onChange={(e) => selectTeamInRunningOrder(e, parseInt(key))} className="width-100 text-center" value={tournInReview.runningOrder[parseInt(key)]} disabled={!isAdmin}>
                                                    {teams.map(el => {
                                                        return (<option value={el.fullName}>{el.fullName}</option>)
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>

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


            {/* <div className="modal fade" id="deleteTrackModal" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-l">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteTrackModalLabel">Delete Team?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to remove {trackInReview.name}?</p>
                            <p>This removes the track from future lists, but previously saved tournaments and runs will still show the team.</p>
                            <p><i>It's probably not a good idea to delete them if they've been added to tournaments.</i></p>
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
                                <button type="button" className="btn btn-warning mx-2" disabled={!isAdmin || reqSubmitted} onClick={deleteTrack}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

        </div>
    )
}
