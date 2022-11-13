import * as React from "react";
import { useState } from "react";
import { useLoginContext } from "../utils/context";
import { Track } from "../types/types"
import { fetchPost } from "../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons"; 


declare var SERVICE_URL: string;

interface AdminTracksProps {
    tracks: Track[];
    updateTracks: Function; 
}

let initialTrack:Track = {
    _id: '', 
    id: null, 
    name: '', 
    address: '', 
    city: '', 
    notes: '', 
    archHeightFt: null, 
    archHeightInches: null, 
    distanceToHydrant: null, 
    imageUrls: []
}

export default function AdminTracks(props:AdminTracksProps) {
    const tracks = props.tracks; 
    let [trackInReview, setTrackInReview] = useState<Track>(initialTrack)
    let [editOrCreate, setEditOrCreate] = useState(""); 
    let [reqSubmitted, setReqSubmitted] = useState(false); 
    let [reqResult, setReqResult] = useState<{error: boolean, message:string}>({error:false, message:""}); 
    const { sessionId, rolesArr  } = useLoginContext(); 

    const isAdmin = rolesArr.includes("admin"); 

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setTrackInReview({
            ...trackInReview, 
            [e.target.id]: e.target.value
        })
    }

    function handleCheck(e:React.ChangeEvent<HTMLInputElement>){
        setTrackInReview({
            ...trackInReview, 
            [e.target.id]: e.target.checked
        })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setTrackInReview({
            ...trackInReview, 
            [e.target.id]: e.target.value
        })
    }



    function loadTrack(track:Track){
        if(!track?.archHeightFt) track.archHeightFt = 999; 
        if(!track?.archHeightInches) track.archHeightInches = 999; 
        if(!track?.distanceToHydrant) track.distanceToHydrant = 999; 
        setTrackInReview({
            ...track
        })
    }

    async function insertOrUpdate(){
        setReqSubmitted(true); 
        let url:string, body:{trackId: string, fieldsToUpdate: {}} | Track ; 
        if(editOrCreate == "Edit"){
            url = `${SERVICE_URL}/tracks/updateTrack`
            let fieldsToUpdate = {...trackInReview}
            delete fieldsToUpdate._id; 
            body = {
                trackId: trackInReview._id, 
                fieldsToUpdate: fieldsToUpdate
            }
        } else {
            url = `${SERVICE_URL}/tracks/insertTrack`
            body = {
                ...trackInReview, 
                afterMigrate: true
            }
            delete body._id; 
        }
        try {
            await fetchPost(url, body, sessionId)
            setReqResult({error: false, message: "Update successful."}); 
            props.updateTracks(); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred. Try again later."}); 
            setReqSubmitted(false); 
        }
    }

    async function deleteTrack(){
        setReqSubmitted(true); 
        let body = {trackId: trackInReview._id}; 
        let url = `${SERVICE_URL}/tracks/deleteTrack`
        try {
            await fetchPost(url, body, sessionId)
            setReqResult({error: false, message: "Update successful."}); 
            props.updateTracks(); 
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
                    data-bs-target="#editTrackModal"
                    onClick={()=>{
                        modalCleanup(); 
                        setEditOrCreate("Create"); 
                        loadTrack(initialTrack); 
                    }}>Add New Track
                </div>

                <div className="w-100 mx-5 rounded bg-light py-4 mb-2">
                    {
                        tracks.map((track, ind) => {
                            return (
                                <div className="row my-1">
                                    <div className="col-8">
                                        <div className="test-center d-flex justify-content-center align-items-center ">
                                                <div className="pointer font-large"
                                                data-bs-toggle="modal" 
                                                data-bs-target="#editTrackModal"
                                                onClick={()=>{
                                                    setEditOrCreate("Edit"); 
                                                    modalCleanup(); 
                                                    loadTrack(track); 
                                                }}
                                                >{track.name}
                                                </div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="test-center d-flex justify-content-center align-items-center">
                                            <div className="pointer px-3"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editTrackModal"
                                            onClick={()=>{
                                                setEditOrCreate("Edit"); 
                                                modalCleanup(); 
                                                loadTrack(track); 
                                            }}
                                            ><FontAwesomeIcon className="crud-links font-x-large" icon={faPenToSquare} /></div>
                                            {track.afterMigrate ? 
                                                <div className="pointer px-3"
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#deleteTrackModal"
                                                    onClick={()=>{
                                                        modalCleanup(); 
                                                        loadTrack(track); 
                                                    }}
                                                    ><FontAwesomeIcon className="crud-links font-x-large" icon={faTrash}/>
                                                </div> : <></>}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className="modal fade" id="editTrackModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-l">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="trackModalLabel">{editOrCreate == "Edit" ? "Edit Track" : "Add Track"}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="d-flex justify-content-center mb-3">
                            {editOrCreate == "Edit" ? 
                                <i>
                                    {trackInReview?.afterMigrate ? "Created after 2022 migration." : "Migrated from previous site."}
                                </i> : <></>
                            }
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Name</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="name" 
                                    value={trackInReview.name} 
                                    className="text-center width-100" 
                                    disabled={!isAdmin}
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Address</div>
                            <div className="col-8 text-center px-4" >
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="address" 
                                    value={trackInReview.address} 
                                    className="text-center width-100" 
                                    disabled={!isAdmin}
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">City</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="city" 
                                    value={trackInReview.city} 
                                    disabled={!isAdmin} 
                                    className="text-center width-100"
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Notes</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="notes" 
                                    value={trackInReview.notes} 
                                    disabled={!isAdmin} 
                                    className="text-center width-100"
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Arch Height</div>
                            <div className="col-8 text-center px-4">
                                <select onChange={handleSelect} id="archHeightFt" name="archHeightFt" className="width-50 text-center" value={trackInReview.archHeightFt} disabled={!isAdmin}>
                                    <option value={null}></option>
                                    <option value={19}>19</option>
                                    <option value={20}>20</option>
                                    <option value={21}>21</option>
                                </select>
                                <select onChange={handleSelect} id="archHeightInches" name="archHeightInches" className="width-50 text-center" value={trackInReview.archHeightInches} disabled={!isAdmin}>
                                    <option value={null}></option>
                                    {Array(12).fill(undefined).map((x,i) => i).map(el => {
                                        return (<option value={el}>{el}</option>)
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Distance to Hydrant</div>
                            <div className="col-8 text-center px-4">
                                <select onChange={handleSelect} id="distanceToHydrant" name="distanceToHydrant" className="width-100 text-center" value={trackInReview.distanceToHydrant} disabled={!isAdmin}>
                                    <option value={null}></option>
                                    <option value={200}>200</option>
                                    <option value={225}>225</option>
                                </select>
                            </div>
                        </div>

                        <div className="row mb-1 mt-3">
                            <div className="col-6 d-flex flex-column align-items-center justify-content-end text-center">
                                <div>Active</div>
                                <div>
                                    <input className="form-check-input" type="checkbox" id="active" name="active" checked={trackInReview?.active} onChange={handleCheck}></input>
                                </div>
                            </div>
                            <div className="col-6 d-flex flex-column align-items-center justify-content-end text-center">
                                <div>Display in Lists?</div>
                                <div>
                                    <input className="form-check-input" type="checkbox" id="display" name="display" checked={trackInReview?.display} onChange={handleCheck}></input>
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


            <div className="modal fade" id="deleteTrackModal" aria-labelledby="deleteModalLabel" aria-hidden="true">
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
            </div>

        </div>
    )
}
