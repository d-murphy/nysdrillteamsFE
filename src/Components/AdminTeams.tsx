import * as React from "react";
import { useState } from "react";
import { useLoginContext } from "../utils/context";
import { Team } from "../types/types"
import { fetchPost, logUpdate } from "../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"; 



declare var SERVICE_URL: string;

interface AdminTeamsProps {
    teams: Team[];
    updateTeams: Function; 
}

let intialTeam:Team = {
    _id: '', 
    fullName: '', 
    region: '', 
    hometown: '', 
    nickname: '', 
    circuit: '', 
    twitter: '', 
    instagram: '', 
    tiktok: ''
}

export default function AdminTeams(props:AdminTeamsProps) {
    const teams = props.teams; 
    let [teamInReview, setTeamInReview] = useState<Team>(intialTeam)
    let [editOrCreate, setEditOrCreate] = useState(""); 
    let [reqSubmitted, setReqSubmitted] = useState(false); 
    let [reqResult, setReqResult] = useState<{error: boolean, message:string}>({error:false, message:""}); 
    const { sessionId, role, username  } = useLoginContext(); 

    const isAdmin = role === "admin"; 
    const isAdminOrScorekeeper = role === 'admin' || role === 'scorekeeper'; 

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setTeamInReview({
            ...teamInReview, 
            [e.target.id]: e.target.value
        })
    }

    function handleNameChange(e:React.ChangeEvent<HTMLInputElement>){
        let newFullName = e.target.id == 'hometown' ? `${e.target.value} ${teamInReview.nickname}` : `${teamInReview.hometown} ${e.target.value}`
        setTeamInReview({
            ...teamInReview, 
            fullName: newFullName,
            [e.target.id]: e.target.value,
        })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setTeamInReview({
            ...teamInReview, 
            [e.target.id]: e.target.value
        })
    }

    function handleCheck(e:React.ChangeEvent<HTMLInputElement>){
        setTeamInReview({
            ...teamInReview, 
            [e.target.id]: e.target.checked
        })
    }

    function loadTeam(team:Team){
        setTeamInReview({
            ...intialTeam, 
            ...team
        })
    }
    
    let regionsSet = new Set(teams.map(el => el.region)); 
    let regions = Array.from(regionsSet).sort()

    let circuitSet = new Set(teams.map(el => el.circuit)); 
    let circuits = Array.from(circuitSet).sort()

    async function insertOrUpdate(){
        setReqSubmitted(true); 
        let url:string, body:{teamId: string, fieldsToUpdate: {}} | Team ; 
        if(editOrCreate == "Edit"){
            url = `${SERVICE_URL}/teams/updateTeam`
            let fieldsToUpdate = {...teamInReview}
            delete fieldsToUpdate._id; 
            body = {
                teamId: teamInReview._id, 
                fieldsToUpdate: fieldsToUpdate
            }
        } else {
            url = `${SERVICE_URL}/teams/insertTeam`
            body = {
                ...teamInReview, 
                afterMigrate: true
            }
            delete body._id; 
        }
        try {
            await fetchPost(url, body, sessionId)
            setReqResult({error: false, message: "Update successful."}); 
            let updateMsg = `${editOrCreate} Team: ${teamInReview.fullName}`
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, updateMsg)
            props.updateTeams(); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred.  Make sure all required fields are complete or try again later."}); 
            setReqSubmitted(false); 
        }
    }

    async function deleteTeam(){
        setReqSubmitted(true); 
        let body = {teamId: teamInReview._id}; 
        let url = `${SERVICE_URL}/teams/deleteTeam`
        try {
            await fetchPost(url, body, sessionId)
            let updateMsg = `Delete Team: ${teamInReview.fullName}`
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, updateMsg)
            setReqResult({error: false, message: "Update successful."}); 
            props.updateTeams(); 
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
                <div 
                    className="btn add-entry-button my-5" 
                    data-bs-toggle="modal" 
                    data-bs-target="#editTeamModal"
                    onClick={()=>{
                        setEditOrCreate("Create"); 
                        setTeamInReview({...intialTeam})
                    }}>Add New Team
                </div>
                <div className="bg-light w-100 mx-5 rounded py-4 mb-2">
                    {
                        teams.map((team, ind) => {
                            return (
                                <div className='row w-100 my-1'>
                                    <div className="col-8">
                                        <div 
                                            className="pointer d-flex justify-content-center font-large"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editTeamModal"
                                            onClick={()=>{
                                                setEditOrCreate("Edit"); 
                                                modalCleanup(); 
                                                loadTeam(team); 
                                            }}>
                                            {team.fullName} - {team.circuit}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="pointer px-3 d-flex align-items-center justify-content-center"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editTeamModal"
                                            onClick={()=>{
                                                setEditOrCreate("Edit"); 
                                                modalCleanup(); 
                                                loadTeam(team); 
                                            }}
                                            ><FontAwesomeIcon className="crud-links font-x-large" icon={faPenToSquare} />
                                        </div>
                                        {team.afterMigrate ? 
                                            <div className="pointer px-3"
                                                data-bs-toggle="modal" 
                                                data-bs-target="#deleteTeamModal"
                                                onClick={()=>{
                                                    modalCleanup(); 
                                                    loadTeam(team); 
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

            <div className="modal fade" id="editTeamModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-l">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">{editOrCreate == "Edit" ? "Edit Team" : "Add Team"}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex justify-content-center mb-3">
                            {editOrCreate == "Edit" ? 
                                <i>
                                    {teamInReview?.afterMigrate ? "Created after 2022 migration." : "Migrated from previous site."}
                                </i> : <></>
                            }
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Town</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    onChange={(e) => handleNameChange(e)} 
                                    id="hometown" 
                                    value={teamInReview.hometown} 
                                    className="text-center width-100" 
                                    disabled={editOrCreate == "Edit" && !teamInReview?.afterMigrate}
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Nickname</div>
                            <div className="col-8 text-center px-4" >
                                <input 
                                    onChange={(e) => handleNameChange(e)} 
                                    id="nickname" 
                                    value={teamInReview.nickname} 
                                    className="text-center width-100" 
                                    disabled={editOrCreate == "Edit" && !teamInReview?.afterMigrate}
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Fullname</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    id="fullName" 
                                    value={teamInReview.fullName} 
                                    disabled={true} 
                                    className="text-center width-100"
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Region</div>
                            <div className="col-8 text-center px-4">
                                <select onChange={handleSelect} id="region" name="region" className="width-100 text-center" value={teamInReview.region} disabled={editOrCreate == "Edit" && !teamInReview?.afterMigrate}>
                                    {regions.map(el => {
                                        return <option value={el}>{el}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Circuit</div>
                            <div className="col-8 text-center px-4">
                                <select onChange={handleSelect} id="circuit" name="circuit" className="width-100 text-center" value={teamInReview.circuit} disabled={editOrCreate == "Edit" && !teamInReview?.afterMigrate}>
                                    {circuits.map(el => {
                                        return <option value={el}>{el}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Twitter Handle</div>
                            <div className="col-8 text-center px-4">
                            <input onChange={handleTextInput} id="twitter" value={teamInReview.twitter} className="text-center width-100" ></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Insta Handle</div>
                            <div className="col-8 text-center px-4">
                            <input onChange={handleTextInput} id="instagram" value={teamInReview.instagram} className="text-center width-100" ></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">TikTok Handle</div>
                            <div className="col-8 text-center px-4">
                            <input onChange={handleTextInput} id="tiktok" value={teamInReview.tiktok} className="text-center width-100" ></input>
                            </div>
                        </div>
                        <div className="row mb-1 mt-3">
                            <div className="col-6 d-flex flex-column align-items-center justify-content-end text-center">
                                <div>Active</div>
                                <div>
                                    <input className="form-check-input" type="checkbox" id="active" name="active" checked={teamInReview?.active} onChange={handleCheck}></input>
                                </div>
                            </div>
                            <div className="col-6 d-flex flex-column align-items-center justify-content-end text-center">
                                <div>Display in Lists?</div>
                                <div>
                                    <input className="form-check-input" type="checkbox" id="display" name="display" checked={teamInReview?.display} onChange={handleCheck}></input>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer d-flex flex-column">
                        <div className="text-center">
                            {!isAdminOrScorekeeper ? <span>
                                Only admin or scorekeepers can make changes here.
                            </span> : <></>}
                        </div>
                        <div className="text-center my-3">
                            {reqResult.message ? <span className={reqResult.error ? 'text-danger' : 'text-success'}>
                                {reqResult.message}
                            </span> : <></>}
                        </div>
                        <div className="">
                            <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                            <button type="button" className="btn btn-primary mx-2" disabled={!isAdminOrScorekeeper || reqSubmitted} onClick={insertOrUpdate}>Save changes</button>
                        </div>
                    </div>
                    </div>
                </div>
            </div>


            <div className="modal fade" id="deleteTeamModal" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-l">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Delete Team?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to remove {teamInReview.fullName}?</p>
                            <p>This removes the team from future lists, but previously saved tournaments and runs will still show the team.</p>
                            <p><i>It's probably not a good idea to delete them if they've been added to tournaments.</i></p>
                        </div>
                        <div className="modal-footer d-flex flex-column">
                            <div className="text-center">
                                {!isAdmin ? <span>
                                    Only admin and scorekeepers can make changes here.
                                </span> : <></>}
                            </div>
                            <div className="text-center my-3">
                                {reqResult.message ? <span className={reqResult.error ? 'text-danger' : 'text-success'}>
                                    {reqResult.message}
                                </span> : <></>}
                            </div>
                            <div className="">
                                <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                <button type="button" className="btn btn-warning mx-2" disabled={!isAdmin || reqSubmitted} onClick={deleteTeam}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
