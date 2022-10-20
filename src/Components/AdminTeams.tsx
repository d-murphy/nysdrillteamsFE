import * as React from "react";
import { useState, useEffect } from "react";
import { useLoginContext } from "../utils/context";
import { Team } from "../types/types"


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
}

export default function AdminTeams(props:AdminTeamsProps) {
    const teams = props.teams; 
    let [teamInReview, setTeamInReview] = useState<Team>(intialTeam)
    let [editOrCreate, setEditOrCreate] = useState(""); 
    const { username, rolesArr  } = useLoginContext(); 

    const isAdmin = rolesArr.includes("admin"); 

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setTeamInReview((teamInReview) => {
            return {
                ...teamInReview, 
                [e.target.id]: e.target.value
            }
        })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setTeamInReview((teamInReview) => {
            return {
                ...teamInReview, 
                [e.target.id]: e.target.value
            }
        })
    }

    function handleCheck(e:React.ChangeEvent<HTMLInputElement>){
        console.log(e)
        console.log(teamInReview)
        setTeamInReview((teamInReview) => {
            return {
                ...teamInReview, 
                [e.target.id]: e.target.checked
            }
        })

    }
    
    let regionsSet = new Set(teams.map(el => el.region)); 
    let regions = Array.from(regionsSet).sort()

    let circuitSet = new Set(teams.map(el => el.circuit)); 
    let circuits = Array.from(circuitSet).sort()

    return (
        <div className="container">
            <div className="width-100 mb-4">
                <div className="row mb-3">
                    <div className="col-3"/>
                    <div className="col-2 text-center"><b>Circuit</b></div>
                    <div className="col-4 text-center"><b>Name</b></div>
                    <div className="col-3"/>
                </div>
                {
                    teams.map((team, ind) => {
                        return <div key={ind} className="row">
                            <div className="col-3"/>
                            <div className="col-2 text-center">{team.circuit}</div>
                            <div 
                                className="col-4 text-center pointer" 
                                data-bs-toggle="modal" 
                                data-bs-target="#editTeamModal"
                                onClick={()=>{
                                    setEditOrCreate("Edit"); 
                                    setTeamInReview(team)
                                }}
                                >
                                    {team.fullName}
                            </div>
                            <div className="col-3"/>
                        </div>
                    })
                }
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
                            <i>
                                {teamInReview?.afterMigrate ? "Created after 2022 migration." : "Migrated from previous site."}
                            </i>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Town</div>
                            <div className="col-8 text-center px-4">
                                <input onChange={handleTextInput} id="hometown" value={teamInReview.hometown} className="text-center width-100" disabled={editOrCreate != "Create" || teamInReview?.afterMigrate}></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Nickname</div>
                            <div className="col-8 text-center px-4" >
                                <input onChange={handleTextInput} id="nickname" value={teamInReview.nickname} className="text-center width-100" disabled={editOrCreate != "Create" || teamInReview?.afterMigrate}></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Fullname</div>
                            <div className="col-8 text-center px-4">
                                <input onChange={handleTextInput} id="fullName" value={`${teamInReview.hometown} ${teamInReview.nickname}`} disabled={editOrCreate != "Create" || teamInReview?.afterMigrate} className="text-center width-100"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Region</div>
                            <div className="col-8 text-center px-4">
                                <select onChange={handleSelect} id="region" name="region" className="width-100 text-center" value={teamInReview.region} disabled={editOrCreate != "Create" || teamInReview?.afterMigrate}>
                                    {regions.map(el => {
                                        return <option value={el}>{el}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Class</div>
                            <div className="col-8 text-center px-4">
                                <select onChange={handleSelect} id="class" name="class" className="width-100 text-center" value={teamInReview.circuit} disabled={editOrCreate != "Create" || teamInReview?.afterMigrate}>
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
                                    <input type="checkbox" id="active" name="active" checked={teamInReview?.active} onChange={handleCheck}></input>
                                </div>
                            </div>
                            <div className="col-6 d-flex flex-column align-items-center justify-content-end text-center">
                                <div>Display in Lists?</div>
                                <div>
                                    <input type="checkbox" id="display" name="display" checked={teamInReview?.display} onChange={handleCheck}></input>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer d-flex flex-column">
                        <div className="text-center">
                            {!isAdmin ? <span>
                                Only admin can make changes here.
                            </span> : <></>}
                        </div>
                        <div className="">
                            <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary mx-2" disabled={!isAdmin} onClick={() => {props.updateTeams()}}>Save changes</button>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
