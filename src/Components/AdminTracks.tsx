import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useLoginContext } from "../utils/context";
import { ImageDbEntry, Track } from "../types/types"
import { fetchGet, fetchPost, fetchPostFile, logUpdate } from "../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faEdit, faEyeSlash, faPenToSquare, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"; 


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
    longitude: null,
    latitude: null
}

export default function AdminTracks(props:AdminTracksProps) {
    const tracks = props.tracks; 
    let [trackInReview, setTrackInReview] = useState<Track>(initialTrack)
    let [images, setImages] = useState<ImageDbEntry[]>([]);
    let [imageEditOrCreate, setImageEditOrCreate] = useState<"Edit" | "Create">("Create");
    let [imageInReview, setImageInReview] = useState<ImageDbEntry>(null);
    let [imageName, setImageName] = useState("");
    let [imageSortOrder, setImageSortOrder] = useState(0);
    let [editOrCreate, setEditOrCreate] = useState<"Edit" | "Create">("Create"); 
    let [reqSubmitted, setReqSubmitted] = useState(false); 
    let [reqResult, setReqResult] = useState<{error: boolean, message:string}>({error:false, message:""}); 
    const { sessionId, role, username  } = useLoginContext(); 

    const isAdmin = role === "admin"; 
    const isAdminOrScorekeeper = role === 'admin' || role === 'scorekeeper'
    const disableOnDupe = editOrCreate === "Create" && tracks.map(el => el.name.toLowerCase()).includes(trackInReview.name.toLowerCase()); 
    const disableImageOnDupe = imageEditOrCreate === "Create" && images.map(el => el.fileName.toLowerCase()).includes(imageName.toLowerCase());
    const isFormComplete = trackInReview.name && trackInReview.address && trackInReview.city;
    const imageFormRef = useRef<HTMLInputElement>(null); 

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
            let updateMsg = `${editOrCreate} Track: ${trackInReview.name}`
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, updateMsg)
            setReqResult({error: false, message: "Update successful."}); 
            props.updateTracks(); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred.  Make sure all required fields are complete or try again later."}); 
            setReqSubmitted(false); 
        }
    }

    async function deleteTrack(){
        setReqSubmitted(true); 
        let body = {trackId: trackInReview._id}; 
        let url = `${SERVICE_URL}/tracks/deleteTrack`
        try {
            await fetchPost(url, body, sessionId)
            let updateMsg = `Delete Track: ${trackInReview.name}`
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, updateMsg)
            setReqResult({error: false, message: "Update successful."}); 
            props.updateTracks(); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred. Try again later."}); 
            setReqSubmitted(false); 
        }
    }

    async function deleteImage(){
        setReqSubmitted(true); 
        let body = {imageName: imageInReview?.fileName}; 
        let url = `${SERVICE_URL}/images/deleteImage`
        try {
            await fetchPost(url, body, sessionId)
            let updateMsg = `Delete Image: ${imageInReview?.fileName}`
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, updateMsg)
            setReqResult({error: false, message: "Update successful."}); 
            getTrackImages(); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred. Try again later."}); 
            setReqSubmitted(false); 
        }
    }

    function getTrackImages(){
        let url = `${SERVICE_URL}/images/getImages?track=${trackInReview.name}`
        fetchGet(url, sessionId)
        .then(res => res.json())
        .then(data => {
            setImages(data.results);
        })
        .catch(e => {
            console.log(e.message)
        })
    }

    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //@ts-expect-error
        const file = e.target[0].files[0]; 

        setReqSubmitted(true); 

        let url = `${SERVICE_URL}/images/uploadImage`
        const formData = new FormData();
        formData.append('file', file);
        formData.append('imageName', imageName);
        formData.append('sortOrder', imageSortOrder.toString());
        formData.append('track', trackInReview.name);
        try {
            await fetchPostFile(url, formData, sessionId)
            let updateMsg = `Upload Image: ${imageInReview.track}-${imageInReview.fileName}`
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, updateMsg)
            setReqResult({error: false, message: "Update successful."}); 
            getTrackImages(); 
            clearImageForm(); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred.  Make sure all required fields are complete or try again later."}); 
            setReqSubmitted(false); 
        }

    
    }

    async function updateImage(){
        let url = `${SERVICE_URL}/images/updateSortOrder`
        let body = {
            fileName: imageInReview.fileName, sortOrder: imageSortOrder
        }
        try {
            await fetchPost(url, body, sessionId)
            let updateMsg = `Image Sort Order Change: ${imageInReview.fileName}`
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, updateMsg)
            setReqResult({error: false, message: "Update successful."}); 
            getTrackImages(); 
            clearImageForm(); 
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred.  Make sure all required fields are complete or try again later."}); 
            setReqSubmitted(false); 
        }
    }

    function clearImageForm(){
        if (imageFormRef.current) imageFormRef.current.value = "";
        setImageName("");
        setImageSortOrder(0);
    }

    function modalCleanup(clearImages: boolean = false){
        setReqResult({error:false, message: ""}); 
        setReqSubmitted(false); 
        if(clearImages) setImages([]);
    }

    useEffect(() => {
        if(trackInReview?.name){
            getTrackImages(); 
        }
    }, [trackInReview])

    return (
        <div className="container">
            <div className="d-flex flex-column align-items-center justify-content-center">

                <div 
                    className="btn add-entry-button my-5" 
                    data-bs-toggle="modal" 
                    data-bs-target="#editTrackModal"
                    onClick={()=>{
                        modalCleanup(true); 
                        setEditOrCreate("Create"); 
                        loadTrack(initialTrack); 
                    }}>Add New Track
                </div>

                <div className="w-100 mx-5 rounded bg-light py-4 mb-2">
                    {
                        tracks?.map((track, ind) => {
                            return (
                                <div className="row my-1">
                                    <div className="col-8">
                                        <div className="test-start d-flex justify-content-start align-items-center ">
                                            <div className="pointer font-large ms-5"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editTrackModal"
                                            onClick={()=>{
                                                setEditOrCreate("Edit"); 
                                                modalCleanup(true); 
                                                loadTrack(track); 
                                            }}
                                            >{track.name}</div>
                                            <div>{track.active && <div className="font-x-small grayText ms-3">Active</div>}</div>
                                            <div>{!track.display && <FontAwesomeIcon className="crud-links font-xs-small ms-3" icon={faEyeSlash} />}</div>
                                            <div>{(!track?.latitude || !track?.longitude) && <div className="font-x-small grayText ms-3">No Lon/Lat</div>}</div>                                            

                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="test-center d-flex justify-content-between align-items-center">
                                            <div className="pointer ps-5"
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editTrackModal"
                                            onClick={()=>{
                                                setEditOrCreate("Edit"); 
                                                modalCleanup(); 
                                                loadTrack(track); 
                                            }}
                                            ><FontAwesomeIcon className="crud-links font-x-large" icon={faPenToSquare} /></div>
                                            {track.afterMigrate ? 
                                                <div className="pointer pe-5"
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

            <div className="modal fade" id="editTrackModal" aria-labelledby="trackModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
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
                            <div className="col-4 text-center">Name*</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="name" 
                                    value={trackInReview.name} 
                                    className="text-center width-100" 
                                    disabled={editOrCreate === 'Edit' && !isAdmin}
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Address*</div>
                            <div className="col-8 text-center px-4" >
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="address" 
                                    value={trackInReview.address} 
                                    className="text-center width-100" 
                                    disabled={!isAdminOrScorekeeper}
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">City*</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="city" 
                                    value={trackInReview.city} 
                                    disabled={!isAdminOrScorekeeper} 
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
                                    disabled={!isAdminOrScorekeeper} 
                                    className="text-center width-100"
                                    autoComplete="off"></input>
                            </div>
                        </div>
                        <div className="row my-1">
                            <div className="col-4 text-center">Arch Height</div>
                            <div className="col-8 text-center px-4">
                                <select onChange={handleSelect} id="archHeightFt" name="archHeightFt" className="width-50 text-center" value={trackInReview.archHeightFt} disabled={!isAdminOrScorekeeper}>
                                    <option value={null}></option>
                                    <option value={19}>19</option>
                                    <option value={20}>20</option>
                                    <option value={21}>21</option>
                                </select>
                                <select onChange={handleSelect} id="archHeightInches" name="archHeightInches" className="width-50 text-center" value={trackInReview.archHeightInches} disabled={!isAdminOrScorekeeper}>
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
                                <select onChange={handleSelect} id="distanceToHydrant" name="distanceToHydrant" className="width-100 text-center" value={trackInReview.distanceToHydrant} disabled={!isAdminOrScorekeeper}>
                                    <option value={null}></option>
                                    <option value={200}>200</option>
                                    <option value={225}>225</option>
                                </select>
                            </div>
                        </div>


                        <div className="row my-1">
                            <div className="col-4 text-center">Longitude</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="longitude" 
                                    value={trackInReview?.longitude} 
                                    disabled={!isAdminOrScorekeeper} 
                                    className="text-center width-100"
                                    autoComplete="off"></input>
                            </div>
                        </div>

                        <div className="row my-1">
                            <div className="col-4 text-center">Latitude</div>
                            <div className="col-8 text-center px-4">
                                <input 
                                    onChange={(e) => handleTextInput(e)} 
                                    id="latitude" 
                                    value={trackInReview?.latitude} 
                                    disabled={!isAdminOrScorekeeper} 
                                    className="text-center width-100"
                                    autoComplete="off"></input>
                            </div>
                        </div>



                        <div className="row mb-1 mt-3">
                            <div className="col-6 d-flex flex-column align-items-center justify-content-end text-center">
                                <div>Active</div>
                                <div>
                                    <input className="form-check-input" type="checkbox" id="active" name="active" checked={trackInReview?.active} onChange={handleCheck} disabled={!isAdminOrScorekeeper}></input>
                                </div>
                            </div>
                            <div className="col-6 d-flex flex-column align-items-center justify-content-end text-center">
                                <div>Display in Lists?</div>
                                <div>
                                    <input className="form-check-input" type="checkbox" id="display" name="display" checked={trackInReview?.display} onChange={handleCheck} disabled={!isAdminOrScorekeeper}></input>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-1 mt-3">
                            <div className="d-flex w-100 justify-content-center">
                                <div className="col d-flex justify-content-center align-items-center my-2"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#addImageModal"                                    
                                    >                                                            
                                    Add Image<FontAwesomeIcon className="mx-2 pointer" icon={faPlus} 
                                        onClick={() => {
                                            setImageEditOrCreate("Create");
                                            clearImageForm()
                                        }} />
                                </div>
                            </div>
                            <div className="d-flex w-100 align-items-center justify-content-start flex-wrap">
                                {
                                    images
                                        .sort((a,b) => { 
                                            return a.sortOrder < b.sortOrder ? -1 : 1
                                        })
                                        .map(el => {
                                        return (
                                            <div className="d-flex flex-column justify-content-center align-items-center">
                                                <img src={el.thumbnailUrl} alt={el?.fileName || ''} className=" m-2" />
                                                <div className="d-flex justify-content-center align-items-center mb-2">
                                                    <div className="pointer px-2 pt-1"
                                                        data-bs-toggle="modal" 
                                                        data-bs-target="#deleteImageModal"
                                                        onClick={()=>{
                                                            clearImageForm()
                                                            setImageInReview(el); 
                                                        }}
                                                        ><FontAwesomeIcon className="crud-links font-x-large" icon={faTrash}/>
                                                    </div>
                                                    <div className="pointer px-2 pt-1"
                                                        data-bs-toggle="modal" 
                                                        data-bs-target="#addImageModal"
                                                        onClick={()=>{
                                                            clearImageForm()
                                                            setImageEditOrCreate("Edit"); 
                                                            setImageSortOrder(el.sortOrder); 
                                                            setImageInReview(el); 
                                                        }}
                                                        ><FontAwesomeIcon className="crud-links font-x-large" icon={faEdit}/>
                                                    </div>
                                                </div>
                                            </div>
                                        )})
                                }


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
                        <div className="text-center my-3">
                            {disableOnDupe && <span className="text-danger">Name already in use.</span>}
                        </div>
                        <div className="">
                            <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                            <button type="button" className="btn btn-primary mx-2" disabled={!isAdminOrScorekeeper || reqSubmitted || disableOnDupe || !isFormComplete} onClick={insertOrUpdate}>Save changes</button>
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

            <div className="modal fade" id="addImageModal" aria-labelledby="addModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-l">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteTrackModalLabel">Add Image?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <p>Upload an image for {trackInReview?.name || ""}.</p>
                                {
                                    imageEditOrCreate === 'Edit' ? <></> : 
                                    <div className="row my-1">
                                        <div className="col-4 text-center"></div>
                                        <div className="col-8 text-center px-4">
                                            <input type="file" name="file" id="file" ref={imageFormRef}/>
                                        </div>
                                    </div>
                                }
                                <div className="row my-1">
                                    <div className="col-4 text-center">Image Name</div>
                                    <div className="col-8 text-center px-4">
                                        {
                                            imageEditOrCreate === 'Edit' ? 
                                                imageInReview?.fileName : 
                                                <input 
                                                onChange={(e) => setImageName(e.target.value)} 
                                                id="imageName" 
                                                value={imageName} 
                                                disabled={!isAdminOrScorekeeper} 
                                                className="text-center width-100"
                                                autoComplete="off"></input>
                                        }
                                    </div>
                                </div>
                                <div className="row my-1">
                                    <div className="col-4 text-center">Image Sort Value</div>
                                    <div className="col-8 text-center px-4">
                                        <input 
                                            type="number"
                                            onChange={(e) => setImageSortOrder(parseInt(e.target.value))} 
                                            id="sortOrder" 
                                            value={imageSortOrder} 
                                            disabled={!isAdminOrScorekeeper} 
                                            className="text-center width-100"
                                            autoComplete="off"></input>
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
                            <div className="text-center my-3">
                                {disableImageOnDupe && <span className="text-danger">Name already in use.</span>}
                            </div>

                            <div className="">
                                <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                {
                                    imageEditOrCreate === 'Edit' ? 
                                        <button type="button" className="btn btn-primary mx-2" disabled={!isAdminOrScorekeeper || reqSubmitted} onClick={updateImage}>Update Sort Order</button> :
                                        <button type="submit" className="btn btn-success mx-2" disabled={!isAdminOrScorekeeper || reqSubmitted || disableImageOnDupe} >Add Image</button>
                                }
                            </div>
                        </div>
                        </form>

                    </div>
                </div>
            </div>




            <div className="modal fade" id="deleteImageModal" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-l">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteTrackModalLabel">Delete Image?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to remove {imageInReview?.fileName}?</p>
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
                                <button type="button" className="btn btn-warning mx-2" disabled={!isAdmin || reqSubmitted} onClick={deleteImage}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



        </div>
    )
}
