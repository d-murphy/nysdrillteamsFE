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

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
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
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Tracks <span className="text-muted fw-normal small">({tracks.length})</span></h6>
                <button
                    className="btn btn-success btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editTrackModal"
                    onClick={() => { modalCleanup(true); setEditOrCreate("Create"); loadTrack({...initialTrack}); }}
                >+ Add Track</button>
            </div>

            <div className="border rounded" style={{ maxHeight: '460px', overflowY: 'auto' }}>
                <table className="table table-sm table-hover mb-0">
                    <thead className="table-light sticky-top">
                        <tr>
                            <th>Track Name</th>
                            <th style={{ width: '80px' }} className="text-center">Status</th>
                            <th style={{ width: '80px' }} className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tracks?.map((track, ind) => (
                            <tr key={ind}>
                                <td className="align-middle">
                                    <span
                                        className="pointer"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editTrackModal"
                                        onClick={() => { setEditOrCreate("Edit"); modalCleanup(true); loadTrack(track); }}
                                    >{track.name}</span>
                                    {(!track?.latitude || !track?.longitude) && (
                                        <span className="badge bg-warning-subtle text-warning-emphasis ms-2 small">No GPS</span>
                                    )}
                                </td>
                                <td className="align-middle text-center">
                                    {track.active && <span className="badge bg-success-subtle text-success-emphasis">Active</span>}
                                    {!track.display && <FontAwesomeIcon className="text-muted ms-1" icon={faEyeSlash} title="Hidden" />}
                                </td>
                                <td className="align-middle text-center">
                                    <span
                                        className="pointer me-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editTrackModal"
                                        onClick={() => { setEditOrCreate("Edit"); modalCleanup(); loadTrack(track); }}
                                        title="Edit"
                                    ><FontAwesomeIcon className="crud-links" icon={faPenToSquare} /></span>
                                    {track.afterMigrate && (
                                        <span
                                            className="pointer"
                                            data-bs-toggle="modal"
                                            data-bs-target="#deleteTrackModal"
                                            onClick={() => { modalCleanup(); loadTrack(track); }}
                                            title="Delete"
                                        ><FontAwesomeIcon className="crud-links" icon={faTrash}/></span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit / Create Modal */}
            <div className="modal fade" id="editTrackModal" aria-labelledby="trackModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="trackModalLabel">{editOrCreate === "Edit" ? "Edit Track" : "Add Track"}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body px-4">
                            {editOrCreate === "Edit" && (
                                <p className="text-center text-muted small fst-italic mb-3">
                                    {trackInReview?.afterMigrate ? "Created after 2022 migration." : "Migrated from previous site."}
                                </p>
                            )}

                            <div className="mb-3 row align-items-center">
                                <label htmlFor="name" className="col-4 col-form-label fw-semibold text-end">Name*</label>
                                <div className="col-8">
                                    <input
                                        id="name"
                                        onChange={(e) => handleTextInput(e)}
                                        value={trackInReview.name}
                                        className="form-control form-control-sm"
                                        disabled={editOrCreate === 'Edit' && !isAdmin}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="address" className="col-4 col-form-label fw-semibold text-end">Address*</label>
                                <div className="col-8">
                                    <input
                                        id="address"
                                        onChange={(e) => handleTextInput(e)}
                                        value={trackInReview.address}
                                        className="form-control form-control-sm"
                                        disabled={!isAdminOrScorekeeper}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="city" className="col-4 col-form-label fw-semibold text-end">City*</label>
                                <div className="col-8">
                                    <input
                                        id="city"
                                        onChange={(e) => handleTextInput(e)}
                                        value={trackInReview.city}
                                        className="form-control form-control-sm"
                                        disabled={!isAdminOrScorekeeper}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-start">
                                <label htmlFor="notes" className="col-4 col-form-label fw-semibold text-end">Notes</label>
                                <div className="col-8">
                                    <textarea
                                        id="notes"
                                        onChange={(e) => handleTextInput(e)}
                                        value={trackInReview.notes}
                                        className="form-control form-control-sm"
                                        rows={3}
                                        disabled={!isAdminOrScorekeeper}
                                    />
                                </div>
                            </div>

                            <div className="mb-3 row align-items-center">
                                <label className="col-4 col-form-label fw-semibold text-end">Arch Height</label>
                                <div className="col-8 d-flex gap-2">
                                    <select
                                        id="archHeightFt"
                                        onChange={handleSelect}
                                        className="form-select form-select-sm"
                                        value={trackInReview.archHeightFt}
                                        disabled={!isAdminOrScorekeeper}
                                    >
                                        <option value={null}>-- ft</option>
                                        <option value={19}>19</option>
                                        <option value={20}>20</option>
                                        <option value={21}>21</option>
                                    </select>
                                    <select
                                        id="archHeightInches"
                                        onChange={handleSelect}
                                        className="form-select form-select-sm"
                                        value={trackInReview.archHeightInches}
                                        disabled={!isAdminOrScorekeeper}
                                    >
                                        <option value={null}>-- in</option>
                                        {Array(12).fill(undefined).map((_,i) => i).map(el => (
                                            <option key={el} value={el}>{el}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="distanceToHydrant" className="col-4 col-form-label fw-semibold text-end">Distance to Hydrant</label>
                                <div className="col-8">
                                    <select
                                        id="distanceToHydrant"
                                        onChange={handleSelect}
                                        className="form-select form-select-sm"
                                        value={trackInReview.distanceToHydrant}
                                        disabled={!isAdminOrScorekeeper}
                                    >
                                        <option value={null}></option>
                                        <option value={200}>200 ft</option>
                                        <option value={225}>225 ft</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="longitude" className="col-4 col-form-label fw-semibold text-end">Longitude</label>
                                <div className="col-8">
                                    <input
                                        id="longitude"
                                        onChange={(e) => handleTextInput(e)}
                                        value={trackInReview?.longitude}
                                        className="form-control form-control-sm"
                                        disabled={!isAdminOrScorekeeper}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="latitude" className="col-4 col-form-label fw-semibold text-end">Latitude</label>
                                <div className="col-8">
                                    <input
                                        id="latitude"
                                        onChange={(e) => handleTextInput(e)}
                                        value={trackInReview?.latitude}
                                        className="form-control form-control-sm"
                                        disabled={!isAdminOrScorekeeper}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <hr />
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <div className="form-check form-switch mb-0">
                                        <input className="form-check-input" type="checkbox" role="switch" id="active" name="active" checked={trackInReview?.active} onChange={handleCheck} disabled={!isAdminOrScorekeeper} />
                                        <label className="form-check-label fw-semibold" htmlFor="active">Active</label>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="form-check form-switch mb-0">
                                        <input className="form-check-input" type="checkbox" role="switch" id="display" name="display" checked={trackInReview?.display} onChange={handleCheck} disabled={!isAdminOrScorekeeper} />
                                        <label className="form-check-label fw-semibold" htmlFor="display">Show in Lists</label>
                                    </div>
                                </div>
                            </div>

                            {/* Images section */}
                            <hr />
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="fw-semibold">Track Images</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    data-bs-toggle="modal"
                                    data-bs-target="#addImageModal"
                                    onClick={() => { setImageEditOrCreate("Create"); clearImageForm(); }}
                                ><FontAwesomeIcon icon={faPlus} className="me-1" />Add Image</button>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                {images
                                    .sort((a,b) => a.sortOrder < b.sortOrder ? -1 : 1)
                                    .map(el => (
                                        <div key={el.fileName} className="border rounded p-1 text-center" style={{ width: '120px' }}>
                                            <img src={el.thumbnailUrl} alt={el?.fileName || ''} className="img-fluid mb-1" />
                                            <div className="d-flex justify-content-center gap-2">
                                                <span
                                                    className="pointer"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#deleteImageModal"
                                                    onClick={() => { deleteImageMutation.reset(); clearImageForm(); setImageInReview(el); }}
                                                    title="Delete"
                                                ><FontAwesomeIcon className="crud-links" icon={faTrash}/></span>
                                                <span
                                                    className="pointer"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#addImageModal"
                                                    onClick={() => {
                                                        uploadImageMutation.reset(); updateImageMutation.reset(); clearImageForm();
                                                        setImageEditOrCreate("Edit");
                                                        setImageSortOrder(el.sortOrder);
                                                        setImageName(el.imageName || "");
                                                        setImageCaption(el.imageCaption || "");
                                                        setImageFileName(el.fileName);
                                                        setImageInReview(el);
                                                    }}
                                                    title="Edit"
                                                ><FontAwesomeIcon className="crud-links" icon={faEdit}/></span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="modal-footer flex-column align-items-stretch gap-2">
                            {!isAdminOrScorekeeper && <div className="text-center small text-muted">Only admin or scorekeepers can make changes.</div>}
                            <MutationStatus isSuccess={saveTrackMutation.isSuccess} isError={saveTrackMutation.isError} errorMessage="An error occurred. Make sure all required fields are complete or try again later." />
                            {disableOnDupe && !saveTrackMutation.isSuccess && <div className="text-danger text-center small">Name already in use.</div>}
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary btn-sm" disabled={!isAdminOrScorekeeper || saveTrackMutation.isPending || (!saveTrackMutation.isSuccess && disableOnDupe) || !isFormComplete} onClick={() => saveTrackMutation.mutate()}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Track Modal */}
            <div className="modal fade" id="deleteTrackModal" aria-labelledby="deleteTrackModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteTrackModalLabel">Delete Track?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body px-4">
                            <p>Are you sure you want to remove <strong>{trackInReview.name}</strong>?</p>
                            <p className="text-muted small">This removes the track from future lists, but previously saved tournaments and runs will still reference it.</p>
                            <p className="text-muted small fst-italic">It's probably not a good idea to delete it if it's been added to tournaments.</p>
                        </div>
                        <div className="modal-footer flex-column align-items-stretch gap-2">
                            {!isAdmin && <div className="text-center small text-muted">Only admin can make changes.</div>}
                            <MutationStatus isSuccess={deleteTrackMutation.isSuccess} isError={deleteTrackMutation.isError} />
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-warning btn-sm" disabled={!isAdmin || deleteTrackMutation.isPending} onClick={() => deleteTrackMutation.mutate()}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add / Edit Image Modal */}
            <div className="modal fade" id="addImageModal" aria-labelledby="addImageModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addImageModalLabel">{imageEditOrCreate === 'Edit' ? 'Edit Image' : 'Add Image'}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body px-4">
                                <p className="text-muted small mb-3">Image for: <strong>{trackInReview?.name || "—"}</strong></p>

                                {imageEditOrCreate !== 'Edit' && (
                                    <div className="mb-3 row align-items-center">
                                        <label htmlFor="file" className="col-4 col-form-label fw-semibold text-end">File</label>
                                        <div className="col-8">
                                            <input type="file" name="file" id="file" className="form-control form-control-sm" ref={imageFormRef} />
                                        </div>
                                    </div>
                                )}
                                <div className="mb-3 row align-items-center">
                                    <label htmlFor="imageFileName" className="col-4 col-form-label fw-semibold text-end">File Name</label>
                                    <div className="col-8">
                                        {imageEditOrCreate === 'Edit'
                                            ? <span className="form-control-plaintext form-control-sm">{imageInReview?.fileName}</span>
                                            : <input
                                                id="imageFileName"
                                                onChange={(e) => setImageFileName(e.target.value)}
                                                value={imageFileName}
                                                className="form-control form-control-sm"
                                                disabled={!isAdminOrScorekeeper}
                                                autoComplete="off"
                                            />
                                        }
                                    </div>
                                </div>
                                <div className="mb-3 row align-items-center">
                                    <label htmlFor="imageName" className="col-4 col-form-label fw-semibold text-end">Image Name</label>
                                    <div className="col-8">
                                        <input
                                            id="imageName"
                                            onChange={(e) => setImageName(e.target.value)}
                                            value={imageName}
                                            className="form-control form-control-sm"
                                            disabled={!isAdminOrScorekeeper}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                <div className="mb-3 row align-items-center">
                                    <label htmlFor="imageCaption" className="col-4 col-form-label fw-semibold text-end">Caption</label>
                                    <div className="col-8">
                                        <input
                                            id="imageCaption"
                                            onChange={(e) => setImageCaption(e.target.value)}
                                            value={imageCaption}
                                            className="form-control form-control-sm"
                                            disabled={!isAdminOrScorekeeper}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                                <div className="mb-3 row align-items-center">
                                    <label htmlFor="sortOrder" className="col-4 col-form-label fw-semibold text-end">Sort Order</label>
                                    <div className="col-8">
                                        <input
                                            type="number"
                                            id="sortOrder"
                                            onChange={(e) => setImageSortOrder(parseInt(e.target.value))}
                                            value={imageSortOrder}
                                            className="form-control form-control-sm"
                                            disabled={!isAdminOrScorekeeper}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer flex-column align-items-stretch gap-2">
                                {!isAdmin && <div className="text-center small text-muted">Only admin can make changes.</div>}
                                <MutationStatus
                                    isSuccess={imageEditOrCreate === 'Edit' ? updateImageMutation.isSuccess : uploadImageMutation.isSuccess}
                                    isError={imageEditOrCreate === 'Edit' ? updateImageMutation.isError : uploadImageMutation.isError}
                                    errorMessage="An error occurred. Make sure all required fields are complete or try again later."
                                />
                                {disableImageOnDupe && <div className="text-danger text-center small">File name already in use.</div>}
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                    {imageEditOrCreate === 'Edit'
                                        ? <button type="button" className="btn btn-primary btn-sm" disabled={!isAdminOrScorekeeper || updateImageMutation.isPending} onClick={() => updateImageMutation.mutate()}>Update</button>
                                        : <button type="submit" className="btn btn-success btn-sm" disabled={!isAdminOrScorekeeper || uploadImageMutation.isPending || disableImageOnDupe}>Upload</button>
                                    }
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Delete Image Modal */}
            <div className="modal fade" id="deleteImageModal" aria-labelledby="deleteImageModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteImageModalLabel">Delete Image?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body px-4">
                            <p>Are you sure you want to remove <strong>{imageInReview?.fileName}</strong>?</p>
                        </div>
                        <div className="modal-footer flex-column align-items-stretch gap-2">
                            {!isAdmin && <div className="text-center small text-muted">Only admin can make changes.</div>}
                            <MutationStatus isSuccess={deleteImageMutation.isSuccess} isError={deleteImageMutation.isError} successMessage="Deletion successful." />
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-warning btn-sm" disabled={!isAdmin || deleteImageMutation.isPending} onClick={() => deleteImageMutation.mutate()}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
