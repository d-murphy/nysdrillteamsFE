import * as React from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoginContext } from "../../utils/context";
import { Team } from "../../types/types"
import { fetchPost, logUpdate } from "../../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import MutationStatus from "../../shared/components/MutationStatus";

declare var SERVICE_URL: string;

interface AdminTeamsProps {
    teams: Team[];
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
    const { sessionId, role, username  } = useLoginContext();
    const queryClient = useQueryClient();

    const isAdmin = role === "admin";
    const isAdminOrScorekeeper = role === 'admin' || role === 'scorekeeper';
    const isFormComplete = teamInReview.hometown && teamInReview.nickname && teamInReview.circuit;

    const saveMutation = useMutation({
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
        mutationFn: async () => {
            let url: string;
            let body: {teamId: string, fieldsToUpdate: {}} | Team;
            if(editOrCreate == "Edit"){
                url = `${SERVICE_URL}/teams/updateTeam`
                let fieldsToUpdate = {...teamInReview}
                delete fieldsToUpdate._id;
                body = { teamId: teamInReview._id, fieldsToUpdate }
            } else {
                url = `${SERVICE_URL}/teams/insertTeam`
                body = { ...teamInReview, afterMigrate: true }
                delete body._id;
            }
            await fetchPost(url, body, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `${editOrCreate} Team: ${teamInReview.fullName}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await fetchPost(`${SERVICE_URL}/teams/deleteTeam`, { teamId: teamInReview._id }, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Delete Team: ${teamInReview.fullName}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
    });

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement>){
        setTeamInReview({ ...teamInReview, [e.target.id]: e.target.value })
    }

    function handleNameChange(e:React.ChangeEvent<HTMLInputElement>){
        let newFullName = e.target.id == 'hometown'
            ? `${e.target.value} ${teamInReview.nickname}`
            : `${teamInReview.hometown} ${e.target.value}`
        setTeamInReview({ ...teamInReview, fullName: newFullName, [e.target.id]: e.target.value })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setTeamInReview({ ...teamInReview, [e.target.id]: e.target.value })
    }

    function handleCheck(e:React.ChangeEvent<HTMLInputElement>){
        setTeamInReview({ ...teamInReview, [e.target.id]: e.target.checked })
    }

    function loadTeam(team:Team){
        setTeamInReview({ ...intialTeam, ...team })
    }

    function modalCleanup(){
        saveMutation.reset();
        deleteMutation.reset();
    }

    let regionsSet = new Set(teams.map(el => el.region));
    let regions = Array.from(regionsSet).sort()

    let circuitSet = new Set(teams.map(el => el.circuit));
    let circuits = Array.from(circuitSet).sort()

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Teams <span className="text-muted fw-normal small">({teams.length})</span></h6>
                <button
                    className="btn btn-success btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editTeamModal"
                    onClick={() => { setEditOrCreate("Create"); setTeamInReview({...intialTeam}); }}
                >+ Add Team</button>
            </div>

            <div className="border rounded" style={{ maxHeight: '460px', overflowY: 'auto' }}>
                <table className="table table-sm table-hover mb-0">
                    <thead className="table-light sticky-top">
                        <tr>
                            <th>Team</th>
                            <th style={{ width: '90px' }}>Circuit</th>
                            <th style={{ width: '80px' }} className="text-center">Status</th>
                            <th style={{ width: '80px' }} className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team, ind) => {
                            if(!team.fullName) return null;
                            return (
                                <tr key={ind}>
                                    <td className="align-middle">
                                        <span
                                            className="pointer"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editTeamModal"
                                            onClick={() => { setEditOrCreate("Edit"); modalCleanup(); loadTeam(team); }}
                                        >{team.fullName}</span>
                                    </td>
                                    <td className="align-middle small text-muted">{team.circuit}</td>
                                    <td className="align-middle text-center">
                                        {team.active && <span className="badge bg-success-subtle text-success-emphasis">Active</span>}
                                        {!team.display && <FontAwesomeIcon className="text-muted ms-1" icon={faEyeSlash} title="Hidden" />}
                                    </td>
                                    <td className="align-middle text-center">
                                        <span
                                            className="pointer me-2"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editTeamModal"
                                            onClick={() => { setEditOrCreate("Edit"); modalCleanup(); loadTeam(team); }}
                                            title="Edit"
                                        ><FontAwesomeIcon className="crud-links" icon={faPenToSquare} /></span>
                                        {team.afterMigrate && (
                                            <span
                                                className="pointer"
                                                data-bs-toggle="modal"
                                                data-bs-target="#deleteTeamModal"
                                                onClick={() => { modalCleanup(); loadTeam(team); }}
                                                title="Delete"
                                            ><FontAwesomeIcon className="crud-links" icon={faTrash}/></span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Edit / Create Modal */}
            <div className="modal fade" id="editTeamModal" aria-labelledby="editTeamModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editTeamModalLabel">{editOrCreate === "Edit" ? "Edit Team" : "Add Team"}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {editOrCreate === "Edit" && (
                                <p className="text-center text-muted small fst-italic mb-3">
                                    {teamInReview?.afterMigrate ? "Created after 2022 migration." : "Migrated from previous site."}
                                </p>
                            )}

                            <div className="mb-3 row align-items-center">
                                <label htmlFor="hometown" className="col-4 col-form-label fw-semibold text-end">Town*</label>
                                <div className="col-8">
                                    <input
                                        id="hometown"
                                        onChange={(e) => handleNameChange(e)}
                                        value={teamInReview.hometown}
                                        className="form-control form-control-sm"
                                        disabled={editOrCreate === "Edit" && !teamInReview?.afterMigrate}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="nickname" className="col-4 col-form-label fw-semibold text-end">Nickname*</label>
                                <div className="col-8">
                                    <input
                                        id="nickname"
                                        onChange={(e) => handleNameChange(e)}
                                        value={teamInReview.nickname}
                                        className="form-control form-control-sm"
                                        disabled={editOrCreate === "Edit" && !teamInReview?.afterMigrate}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="fullName" className="col-4 col-form-label fw-semibold text-end">Full Name</label>
                                <div className="col-8">
                                    <input
                                        id="fullName"
                                        value={teamInReview.fullName}
                                        className="form-control form-control-sm bg-light"
                                        disabled
                                        autoComplete="off"
                                    />
                                    <div className="form-text">Auto-generated from Town + Nickname</div>
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="region" className="col-4 col-form-label fw-semibold text-end">Region</label>
                                <div className="col-8">
                                    <select
                                        id="region"
                                        onChange={handleSelect}
                                        className="form-select form-select-sm"
                                        value={teamInReview.region}
                                        disabled={editOrCreate === "Edit" && !teamInReview?.afterMigrate}
                                    >
                                        {regions.map(el => <option key={el} value={el}>{el}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="circuit" className="col-4 col-form-label fw-semibold text-end">Circuit*</label>
                                <div className="col-8">
                                    <select
                                        id="circuit"
                                        onChange={handleSelect}
                                        className="form-select form-select-sm"
                                        value={teamInReview.circuit}
                                        disabled={editOrCreate === "Edit" && !teamInReview?.afterMigrate}
                                    >
                                        {circuits.map(el => <option key={el} value={el}>{el}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="twitter" className="col-4 col-form-label fw-semibold text-end">Twitter Handle</label>
                                <div className="col-8">
                                    <input id="twitter" onChange={handleTextInput} value={teamInReview.twitter} className="form-control form-control-sm" />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="instagram" className="col-4 col-form-label fw-semibold text-end">Instagram Handle</label>
                                <div className="col-8">
                                    <input id="instagram" onChange={handleTextInput} value={teamInReview.instagram} className="form-control form-control-sm" />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="tiktok" className="col-4 col-form-label fw-semibold text-end">TikTok Handle</label>
                                <div className="col-8">
                                    <input id="tiktok" onChange={handleTextInput} value={teamInReview.tiktok} className="form-control form-control-sm" />
                                </div>
                            </div>

                            <hr />
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="form-check d-flex align-items-center gap-2">
                                        <input className="form-check-input" type="checkbox" id="active" name="active" checked={teamInReview?.active} onChange={handleCheck} />
                                        <label className="form-check-label fw-semibold" htmlFor="active">Active</label>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="form-check d-flex align-items-center gap-2">
                                        <input className="form-check-input" type="checkbox" id="display" name="display" checked={teamInReview?.display} onChange={handleCheck} />
                                        <label className="form-check-label fw-semibold" htmlFor="display">Show in Lists</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer flex-column align-items-stretch gap-2">
                            {!isAdminOrScorekeeper && <div className="text-center small text-muted">Only admin or scorekeepers can make changes.</div>}
                            <MutationStatus isSuccess={saveMutation.isSuccess} isError={saveMutation.isError} errorMessage="An error occurred. Make sure all required fields are complete or try again later." />
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary btn-sm" disabled={!isAdminOrScorekeeper || saveMutation.isPending || !isFormComplete} onClick={() => saveMutation.mutate()}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <div className="modal fade" id="deleteTeamModal" aria-labelledby="deleteTeamModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteTeamModalLabel">Delete Team?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to remove <strong>{teamInReview.fullName}</strong>?</p>
                            <p className="text-muted small">This removes the team from future lists, but previously saved tournaments and runs will still reference them.</p>
                            <p className="text-muted small fst-italic">It's probably not a good idea to delete them if they've been added to tournaments.</p>
                        </div>
                        <div className="modal-footer flex-column align-items-stretch gap-2">
                            {!isAdmin && <div className="text-center small text-muted">Only admin can make changes.</div>}
                            <MutationStatus isSuccess={deleteMutation.isSuccess} isError={deleteMutation.isError} />
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-warning btn-sm" disabled={!isAdmin || deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
