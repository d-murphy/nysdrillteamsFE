import * as React from "react";
import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoginContext } from "../../utils/context";
import { ImageDbEntry, Track } from "../../types/types"
import { fetchGet, fetchPost, fetchPostFile, logUpdate } from "../../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEyeSlash, faPenToSquare, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import MutationStatus from "../../shared/components/MutationStatus";


declare var SERVICE_URL: string;

interface AdminTracksProps {
    tracks: Track[];
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
    let [trackInReview, setTrackInReview] = useState<Track>({...initialTrack})

    let [imageEditOrCreate, setImageEditOrCreate] = useState<"Edit" | "Create">("Create");
    let [imageInReview, setImageInReview] = useState<ImageDbEntry>(null);
    let [imageFileName, setImageFileName] = useState<string>("");
    let [imageName, setImageName] = useState("");
    let [imageCaption, setImageCaption] = useState("");
    let [imageSortOrder, setImageSortOrder] = useState(0);

    let [editOrCreate, setEditOrCreate] = useState<"Edit" | "Create">("Create");
    const { sessionId, role, username  } = useLoginContext();
    const queryClient = useQueryClient();

    const isAdmin = role === "admin";
    const isAdminOrScorekeeper = role === 'admin' || role === 'scorekeeper'

    const imagesQuery = useQuery<ImageDbEntry[]>({
        queryKey: ['trackImages', trackInReview.name],
        queryFn: () => fetchGet(`${SERVICE_URL}/images/getImages?track=${trackInReview.name}`, sessionId)
            .then(res => res.json())
            .then(data => data.results),
        enabled: Boolean(trackInReview.name),
    });
    const images = imagesQuery.data ?? [];

    const disableOnDupe = editOrCreate === "Create" && tracks.map(el => el.name.toLowerCase()).includes(trackInReview.name.toLowerCase());
    const disableImageOnDupe = imageEditOrCreate === "Create" && images.map(el => el.fileName.toLowerCase()).includes(imageName.toLowerCase());
    const isFormComplete = trackInReview.name && trackInReview.address && trackInReview.city;
    const imageFormRef = useRef<HTMLInputElement>(null);

    const saveTrackMutation = useMutation({
        mutationFn: async () => {
            let url: string;
            let body: {trackId: string, fieldsToUpdate: {}} | Track;
            if (editOrCreate === "Edit") {
                url = `${SERVICE_URL}/tracks/updateTrack`
                let fieldsToUpdate = {...trackInReview}
                delete fieldsToUpdate._id;
                body = { trackId: trackInReview._id, fieldsToUpdate }
            } else {
                url = `${SERVICE_URL}/tracks/insertTrack`
                body = { ...trackInReview, afterMigrate: true }
                delete body._id;
            }
            await fetchPost(url, body, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `${editOrCreate} Track: ${trackInReview.name}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracks'] }),
    });

    const deleteTrackMutation = useMutation({
        mutationFn: async () => {
            await fetchPost(`${SERVICE_URL}/tracks/deleteTrack`, { trackId: trackInReview._id }, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Delete Track: ${trackInReview.name}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracks'] }),
    });

    const uploadImageMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', imageFileName);
            formData.append('imageName', imageName);
            formData.append('imageCaption', imageCaption);
            formData.append('sortOrder', imageSortOrder.toString());
            formData.append('track', trackInReview.name);
            await fetchPostFile(`${SERVICE_URL}/images/uploadImage`, formData, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Upload Image: ${trackInReview.name}-${imageFileName}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trackImages', trackInReview.name] });
            clearImageForm();
        },
    });

    const updateImageMutation = useMutation({
        mutationFn: async () => {
            const body = {
                fileName: imageInReview.fileName, sortOrder: imageSortOrder,
                imageName: imageName, imageCaption: imageCaption
            };
            await fetchPost(`${SERVICE_URL}/images/updateImage`, body, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Image Update: ${imageInReview.fileName}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trackImages', trackInReview.name] });
            clearImageForm();
        },
    });

    const deleteImageMutation = useMutation({
        mutationFn: async () => {
            await fetchPost(`${SERVICE_URL}/images/deleteImage`, { imageName: imageInReview?.fileName }, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Delete Image: ${imageInReview?.fileName}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trackImages', trackInReview.name] }),
    });

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setTrackInReview({ ...trackInReview, [e.target.id]: e.target.value })
    }

    function handleCheck(e:React.ChangeEvent<HTMLInputElement>){
        setTrackInReview({ ...trackInReview, [e.target.id]: e.target.checked })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setTrackInReview({ ...trackInReview, [e.target.id]: e.target.value })
    }

    function loadTrack(track:Track){
        setTrackInReview({
            ...track,
            longitude: track.longitude || "",
            latitude: track.latitude || "",
            archHeightFt: track.archHeightFt || null,
            archHeightInches: track.archHeightInches || null,
            distanceToHydrant: track.distanceToHydrant || null,
            notes: track.notes || "",
        })
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //@ts-expect-error
        const file = e.target[0].files[0];
        uploadImageMutation.mutate(file);
    }

    function clearImageForm(){
        if (imageFormRef.current) imageFormRef.current.value = "";
        setImageName("");
        setImageSortOrder(0);
        setImageCaption("");
        setImageFileName("");
    }

    function modalCleanup(clearImages: boolean = false){
        saveTrackMutation.reset();
        deleteTrackMutation.reset();
        uploadImageMutation.reset();
        updateImageMutation.reset();
        deleteImageMutation.reset();
        if(clearImages) imagesQuery.refetch();
    }

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
                        loadTrack({...initialTrack});
                    }}>Add New Track
                </div>

                <div className="w-100 mx-5 rounded bg-light py-4 mb-2">
                    {
                        tracks?.map((track, ind) => {
                            return (
                                <div className="row my-1" key={ind}>
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
                                    {Array(12).fill(undefined).map((_,i) => i).map(el => {
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
                                                            deleteImageMutation.reset();
                                                            clearImageForm()
                                                            setImageInReview(el);
                                                        }}
                                                        ><FontAwesomeIcon className="crud-links font-x-large" icon={faTrash}/>
                                                    </div>
                                                    <div className="pointer px-2 pt-1"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addImageModal"
                                                        onClick={()=>{
                                                            uploadImageMutation.reset();
                                                            updateImageMutation.reset();
                                                            clearImageForm()
                                                            setImageEditOrCreate("Edit");
                                                            setImageSortOrder(el.sortOrder);
                                                            setImageName(el.imageName || "");
                                                            setImageCaption(el.imageCaption || "");
                                                            setImageFileName(el.fileName);
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
                            <MutationStatus isSuccess={saveTrackMutation.isSuccess} isError={saveTrackMutation.isError} errorMessage="An error occurred. Make sure all required fields are complete or try again later." />
                            {disableOnDupe && !saveTrackMutation.isSuccess && <span className="text-danger">Name already in use.</span>}
                        </div>
                        <div className="">
                            <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                            <button type="button" className="btn btn-primary mx-2" disabled={!isAdminOrScorekeeper || saveTrackMutation.isPending || (!saveTrackMutation.isSuccess && disableOnDupe) || !isFormComplete} onClick={() => saveTrackMutation.mutate()}>Save changes</button>
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
                                <MutationStatus isSuccess={deleteTrackMutation.isSuccess} isError={deleteTrackMutation.isError} />
                            </div>
                            <div className="">
                                <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                <button type="button" className="btn btn-warning mx-2" disabled={!isAdmin || deleteTrackMutation.isPending} onClick={() => deleteTrackMutation.mutate()}>Delete</button>
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
                                    <div className="col-4 text-center">File Name</div>
                                    <div className="col-8 text-center px-4">
                                        {
                                            imageEditOrCreate === 'Edit' ?
                                                imageInReview?.fileName :
                                                <input
                                                onChange={(e) => setImageFileName(e.target.value)}
                                                id="imageFileName"
                                                value={imageFileName}
                                                disabled={!isAdminOrScorekeeper}
                                                className="text-center width-100"
                                                autoComplete="off"></input>
                                        }
                                    </div>
                                </div>

                                <div className="row my-1">
                                    <div className="col-4 text-center">Image Name</div>
                                    <div className="col-8 text-center px-4">
                                        <input
                                        onChange={(e) => setImageName(e.target.value)}
                                        id="imageName"
                                        value={imageName}
                                        disabled={!isAdminOrScorekeeper}
                                        className="text-center width-100"
                                        autoComplete="off"></input>
                                    </div>
                                </div>

                                <div className="row my-1">
                                    <div className="col-4 text-center">Image Caption</div>
                                    <div className="col-8 text-center px-4">
                                        <input
                                        onChange={(e) => setImageCaption(e.target.value)}
                                        id="imageCaption"
                                        value={imageCaption}
                                        disabled={!isAdminOrScorekeeper}
                                        className="text-center width-100"
                                        autoComplete="off"></input>
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
                                <MutationStatus
                                    isSuccess={imageEditOrCreate === 'Edit' ? updateImageMutation.isSuccess : uploadImageMutation.isSuccess}
                                    isError={imageEditOrCreate === 'Edit' ? updateImageMutation.isError : uploadImageMutation.isError}
                                    errorMessage="An error occurred. Make sure all required fields are complete or try again later."
                                />
                                {disableImageOnDupe && <span className="text-danger">Name already in use.</span>}
                            </div>

                            <div className="">
                                <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                {
                                    imageEditOrCreate === 'Edit' ?
                                        <button type="button" className="btn btn-primary mx-2" disabled={!isAdminOrScorekeeper || updateImageMutation.isPending} onClick={() => updateImageMutation.mutate()}>Update Image</button> :
                                        <button type="submit" className="btn btn-success mx-2" disabled={!isAdminOrScorekeeper || uploadImageMutation.isPending || disableImageOnDupe} >Add Image</button>
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
                                <MutationStatus isSuccess={deleteImageMutation.isSuccess} isError={deleteImageMutation.isError} successMessage="Deletion successful." />
                            </div>
                            <div className="">
                                <button type="button" className="btn btn-secondary mx-2" data-bs-dismiss="modal" >Close</button>
                                <button type="button" className="btn btn-warning mx-2" disabled={!isAdmin || deleteImageMutation.isPending} onClick={() => deleteImageMutation.mutate()}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
