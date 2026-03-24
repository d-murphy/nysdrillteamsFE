import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoginContext } from "../../utils/context";
import { Tournament, Track, Team, Run } from "../../types/types"
import { fetchPost, fetchGet, logUpdate } from "../../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faPersonRunning } from "@fortawesome/free-solid-svg-icons";
import dateUtil from '../../utils/dateUtils';
import EditTop5 from "./adminTournamentsComps/EditTop5";
import EditRunningOrder from "./adminTournamentsComps/EditRunningOrder";
import EditContests from "./adminTournamentsComps/EditContests";
import EditScheduleAndTotalPoints from "./adminTournamentsComps/EditScheduleAndTotalPoints";
import TournVideos from "./adminTournamentsComps/TournVideos";
import RunsEdit from "./adminTournamentsComps/RunsEdit";
import MutationStatus from "../../shared/components/MutationStatus";

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
    waterTime: '',
    notes: '',
    urlToEntryForm: '',
    host: '',
    isParade: false
}

export default function AdminTournaments(props:AdminTournamentProps) {
    const currentYear = new Date().getFullYear();
    const tracks = props.tracks;
    const teams = props.teams;
    let [yearInput, setYearInput] = useState(currentYear);
    let [year, setYear] = useState(currentYear);
    let [tournInReview, setTournInReview] = useState<Tournament>(initialTourn);
    let [editOrCreate, setEditOrCreate] = useState("");
    let [runsEditContest, setRunsEditContest] = useState("");
    let [showNewTournName, setShowNewTournName] = useState(false);
    let [showNewHostName, setShowNewHostName] = useState(false);
    const { sessionId, role, username  } = useLoginContext();
    const queryClient = useQueryClient();
    const isAdmin = role === "admin" || role === 'scorekeeper';

    const tournsQuery = useQuery<Tournament[]>({
        queryKey: ['tournaments', year],
        queryFn: () => fetchGet(`${SERVICE_URL}/tournaments/getFilteredTournaments?years=${year}`)
            .then(res => res.json())
            .then((data: Tournament[]) => data.sort((a, b) => a.date < b.date ? -1 : 1)),
    });

    const tournamentNamesQuery = useQuery<{_id:string, nameCount:number}[]>({
        queryKey: ['tournamentNames'],
        queryFn: () => fetchGet(`${SERVICE_URL}/tournaments/getTournamentNames`)
            .then(res => res.json())
            .then((data: {_id:string, nameCount:number}[]) => data.filter(el => el._id)),
    });

    const hostNamesQuery = useQuery<{_id:string, nameCount:number}[]>({
        queryKey: ['hostNames'],
        queryFn: () => fetchGet(`${SERVICE_URL}/tournaments/getHostNames`)
            .then(res => res.json())
            .then((data: {_id:string, nameCount:number}[]) => data.filter(el => el._id)),
    });

    const runsQuery = useQuery<Run[]>({
        queryKey: ['runsForTournament', tournInReview.id],
        queryFn: () => fetch(`${SERVICE_URL}/runs/getRunsFromTournament?tournamentId=${tournInReview.id}`)
            .then(res => res.json()),
        enabled: Boolean(tournInReview.id),
    });

    const tourns: Tournament[] = tournsQuery.data ?? [];
    const tournamentNames = tournamentNamesQuery.data ?? [];
    const hostNames = hostNamesQuery.data ?? [];
    const runsForTourn: Run[] = tournInReview.id ? (runsQuery.data ?? []) : [];
    const isError = tournsQuery.isError;
    const hasRuns = Boolean(runsForTourn.length);

    const saveTournMutation = useMutation({
        mutationFn: async () => {
            let url: string;
            let body: {tournamentId: string, fieldsToUpdate: {}} | Tournament;
            if (editOrCreate === "Edit") {
                url = `${SERVICE_URL}/tournaments/updateTournament`
                let fieldsToUpdate = {...tournInReview}
                delete fieldsToUpdate._id;
                body = { tournamentId: tournInReview._id, fieldsToUpdate }
            } else {
                url = `${SERVICE_URL}/tournaments/insertTournament`
                body = { ...tournInReview, afterMigrate: true }
                delete body._id;
            }
            await fetchPost(url, body, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `${editOrCreate} Tournament: ${tournInReview.name} - ${dateUtil.getMMDDYYYY(tournInReview.date)}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tournaments', year] });
            queryClient.invalidateQueries({ queryKey: ['tournamentNames'] });
        },
    });

    const deleteTournMutation = useMutation({
        mutationFn: async () => {
            await fetchPost(`${SERVICE_URL}/tournaments/deleteTournament`, { tournamentId: tournInReview._id }, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Delete Tournament: ${tournInReview.name} - ${dateUtil.getMMDDYYYY(tournInReview.date)}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments', year] }),
    });

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
        setTournInReview({ ...tournInReview, [e.target.id]: e.target.value })
    }

    function handleDateInput(e:React.ChangeEvent<HTMLInputElement>){
        setTournInReview({
            ...tournInReview,
            year: new Date(`${e.target.value} 12:00:00`).getFullYear(),
            [e.target.id]: new Date(`${e.target.value} 12:00:00`)
        })
    }

    function handleTimeInput(e:React.ChangeEvent<HTMLInputElement>){
        setTournInReview({ ...tournInReview, [e.target.id]: new Date(`2022-01-01 ${e.target.value}`) })
    }

    function handleCheck(e:React.ChangeEvent<HTMLInputElement>){
        setTournInReview({ ...tournInReview, [e.target.id]: e.target.checked })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setTournInReview({ ...tournInReview, [e.target.id]: e.target.value })
    }

    function handleYearChange(e:React.ChangeEvent<HTMLInputElement>){
        setYearInput(parseInt(e.target.value))
    }

    function handleNameList(e:React.ChangeEvent<HTMLSelectElement>){
        if(e.target.value == 'Name not listed') {
            setTournInReview({ ...tournInReview, name: '' })
            setShowNewTournName(true);
        }else{
            setShowNewTournName(false)
            setTournInReview({ ...tournInReview, name: e.target.value })
        }
    }

    function handleHostList(e:React.ChangeEvent<HTMLSelectElement>){
        if(e.target.value == 'Name not listed') {
            setTournInReview({ ...tournInReview, host: '' })
            setShowNewHostName(true);
        }else{
            setShowNewHostName(false)
            setTournInReview({ ...tournInReview, host: e.target.value })
        }
    }

    function loadTournament(tournament:Tournament){
        setTournInReview({ ...initialTourn, ...tournament })
    }

    function modalCleanup(){
        saveTournMutation.reset();
        deleteTournMutation.reset();
        setShowNewTournName(false);
        setShowNewHostName(false);
    }

    return (
        <div>
            {isError ? (
                <div className="alert alert-danger">An error occurred. Please try another time.</div>
            ) : (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <h6 className="mb-0">Tournaments — {year}</h6>
                            <div className="input-group input-group-sm" style={{ width: '160px' }}>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={yearInput}
                                    onChange={handleYearChange}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                />
                                <button className="btn btn-outline-secondary" onClick={() => setYear(yearInput)}>Go</button>
                            </div>
                        </div>
                        <button
                            className="btn btn-success btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#editTournModal"
                            onClick={() => { modalCleanup(); setEditOrCreate("Create"); loadTournament(initialTourn); }}
                        >+ Add Tournament</button>
                    </div>

                    <div className="border rounded" style={{ maxHeight: '460px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover mb-0">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th style={{ width: '100px' }}>Date</th>
                                    <th>Name</th>
                                    <th style={{ width: '100px' }} className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tourns.map((tourn, ind) => (
                                    <tr key={ind}>
                                        <td className="align-middle text-muted small">{dateUtil.getMMDDYYYY(tourn.date)}</td>
                                        <td className="align-middle">
                                            {tourn.name}
                                            {tourn.cancelled && <span className="badge bg-danger ms-2 small">Cancelled</span>}
                                            {tourn.isParade && <span className="badge bg-info-subtle text-info-emphasis ms-2 small">Parade</span>}
                                        </td>
                                        <td className="align-middle text-center">
                                            <span
                                                className="pointer me-2"
                                                data-bs-toggle="modal"
                                                data-bs-target="#editTournModal"
                                                onClick={() => { setEditOrCreate("Edit"); modalCleanup(); loadTournament(tourn); }}
                                                title="Edit tournament"
                                            ><FontAwesomeIcon className="crud-links" icon={faPenToSquare} /></span>
                                            {!tourn?.isParade && (
                                                <span
                                                    className="pointer me-2"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#editRunsModal"
                                                    onClick={() => { setRunsEditContest(""); loadTournament(tourn); }}
                                                    title="Edit runs"
                                                ><FontAwesomeIcon className="crud-links" icon={faPersonRunning} /></span>
                                            )}
                                            {tourn.afterMigrate && (
                                                <span
                                                    className="pointer"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#deleteTournModal"
                                                    onClick={() => { deleteTournMutation.reset(); loadTournament(tourn); }}
                                                    title="Delete"
                                                ><FontAwesomeIcon className="crud-links" icon={faTrash}/></span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Edit / Create Tournament Modal */}
            <div className="modal fade" id="editTournModal" aria-labelledby="editTournModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editTournModalLabel">{editOrCreate === "Edit" ? "Edit Tournament" : "Add Tournament"}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {editOrCreate === "Edit" && (
                                <p className="text-center text-muted small fst-italic mb-1">
                                    {tournInReview?.afterMigrate ? "Created after 2022 migration." : "Migrated from previous site."}
                                </p>
                            )}
                            {editOrCreate === 'Edit' && (
                                <p className="text-center small mb-3">
                                    <span className="badge bg-secondary">{runsForTourn.length} runs</span>
                                    {hasRuns && <span className="text-muted ms-2 small">Some fields cannot be changed once runs have been added.</span>}
                                </p>
                            )}

                            <div className="mb-3 row align-items-center">
                                <label className="col-4 col-form-label fw-semibold text-end">Name*</label>
                                <div className="col-8">
                                    {!showNewTournName ? (
                                        <select
                                            id="nameList"
                                            onChange={handleNameList}
                                            className="form-select form-select-sm"
                                            value={tournInReview.name}
                                            disabled={!isAdmin || hasRuns}
                                        >
                                            <option value={null}></option>
                                            {tournamentNames.map(el => (
                                                <option key={el._id} value={el._id}>{el._id} ({el.nameCount}×)</option>
                                            ))}
                                            <option value="Name not listed">Name not listed — add a new one</option>
                                        </select>
                                    ) : (
                                        <input
                                            id="name"
                                            onChange={(e) => handleTextInput(e)}
                                            value={tournInReview.name}
                                            className="form-control form-control-sm"
                                            disabled={!isAdmin || hasRuns}
                                            autoComplete="off"
                                            placeholder="Enter new tournament name"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="mb-3 row align-items-center">
                                <label className="col-4 col-form-label fw-semibold text-end">Host</label>
                                <div className="col-8">
                                    {!showNewHostName ? (
                                        <select
                                            id="hostList"
                                            onChange={handleHostList}
                                            className="form-select form-select-sm"
                                            value={tournInReview.host}
                                            disabled={!isAdmin}
                                        >
                                            <option value={null}></option>
                                            {hostNames.map(el => (
                                                <option key={el._id} value={el._id}>{el._id} ({el.nameCount}×)</option>
                                            ))}
                                            <option value="Name not listed">Host not listed — add a new one</option>
                                        </select>
                                    ) : (
                                        <input
                                            id="host"
                                            onChange={(e) => handleTextInput(e)}
                                            value={tournInReview.host}
                                            className="form-control form-control-sm"
                                            disabled={!isAdmin}
                                            autoComplete="off"
                                            placeholder="Enter new host name"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="mb-3 row align-items-center">
                                <label htmlFor="date" className="col-4 col-form-label fw-semibold text-end">Date*</label>
                                <div className="col-8">
                                    <input
                                        type="date"
                                        id="date"
                                        onChange={(e) => handleDateInput(e)}
                                        value={dateUtil.getYYYYMMDD(tournInReview.date)}
                                        className="form-control form-control-sm"
                                        disabled={!isAdmin || hasRuns}
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="startTime" className="col-4 col-form-label fw-semibold text-end">Start Time</label>
                                <div className="col-8">
                                    <input
                                        type="time"
                                        id="startTime"
                                        onChange={(e) => handleTimeInput(e)}
                                        value={dateUtil.getTimeForInput(tournInReview.startTime)}
                                        className="form-control form-control-sm"
                                        disabled={!isAdmin}
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="track" className="col-4 col-form-label fw-semibold text-end">Track*</label>
                                <div className="col-8">
                                    <select
                                        id="track"
                                        onChange={handleSelect}
                                        className="form-select form-select-sm"
                                        value={tournInReview.track}
                                        disabled={!isAdmin || hasRuns}
                                    >
                                        <option value={null}></option>
                                        {tracks.map(el => (
                                            <option key={el.name} value={el.name}>{el.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="waterTime" className="col-4 col-form-label fw-semibold text-end">Water Time</label>
                                <div className="col-8">
                                    <input
                                        id="waterTime"
                                        onChange={(e) => handleTextInput(e)}
                                        value={tournInReview.waterTime}
                                        className="form-control form-control-sm"
                                        disabled={!isAdmin}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row align-items-center">
                                <label htmlFor="urlToEntryForm" className="col-4 col-form-label fw-semibold text-end">Entry Form URL</label>
                                <div className="col-8">
                                    <input
                                        id="urlToEntryForm"
                                        onChange={(e) => handleTextInput(e)}
                                        value={tournInReview.urlToEntryForm}
                                        className="form-control form-control-sm"
                                        disabled={!isAdmin}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div className="mb-3 row">
                                <label htmlFor="notes" className="col-4 col-form-label fw-semibold text-end">Notes</label>
                                <div className="col-8">
                                    <textarea
                                        id="notes"
                                        onChange={(e) => handleTextInput(e)}
                                        value={tournInReview.notes}
                                        className="form-control form-control-sm"
                                        rows={2}
                                        disabled={!isAdmin}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <hr />
                            <div className="row g-3 mb-3">
                                <div className="col-6 col-sm-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="sanctioned" checked={tournInReview?.sanctioned} onChange={handleCheck} disabled={!isAdmin} />
                                        <label className="form-check-label" htmlFor="sanctioned">Sanctioned</label>
                                    </div>
                                </div>
                                <div className="col-6 col-sm-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="cfp" checked={tournInReview?.cfp} onChange={handleCheck} disabled={!isAdmin} />
                                        <label className="form-check-label" htmlFor="cfp">Counts for Points</label>
                                    </div>
                                </div>
                                <div className="col-6 col-sm-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="liveStreamPlanned" checked={tournInReview?.liveStreamPlanned} onChange={handleCheck} disabled={!isAdmin} />
                                        <label className="form-check-label" htmlFor="liveStreamPlanned">Live Stream Planned</label>
                                    </div>
                                </div>
                                <div className="col-6 col-sm-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="isParade" checked={tournInReview?.isParade} onChange={handleCheck} disabled={!isAdmin} />
                                        <label className="form-check-label" htmlFor="isParade">Parade</label>
                                    </div>
                                </div>
                                <div className="col-6 col-sm-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="cancelled" checked={tournInReview?.cancelled} onChange={handleCheck} disabled={!isAdmin} />
                                        <label className="form-check-label" htmlFor="cancelled">Cancelled</label>
                                    </div>
                                </div>
                                <div className="col-6 col-sm-9 d-flex align-items-center">
                                    <TournVideos tournInReview={tournInReview} setTournInReview={setTournInReview}/>
                                </div>
                            </div>

                            {tournInReview.isParade && (
                                <div className="alert alert-info small py-2">
                                    Don't select any Total Points regions for parades, but schedule regions are fine.
                                </div>
                            )}

                            <EditScheduleAndTotalPoints isAdmin={isAdmin} tournInReview={tournInReview} handleCheck={handleCheck} hasRuns={hasRuns} />
                            <EditContests isAdmin={isAdmin} tournInReview={tournInReview} setTournInReview={setTournInReview} teams={teams}/>
                            <EditRunningOrder isAdmin={isAdmin} tournInReview={tournInReview} setTournInReview={setTournInReview} teams={teams} runsForTourn={runsForTourn}/>
                            <EditTop5 isAdmin={isAdmin} tournInReview={tournInReview} setTournInReview={setTournInReview} teams={teams}/>
                        </div>
                        <div className="modal-footer flex-column align-items-stretch gap-2">
                            <MutationStatus isSuccess={saveTournMutation.isSuccess} isError={saveTournMutation.isError} />
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    disabled={saveTournMutation.isPending || (!tournInReview.name || !tournInReview.date || !tournInReview.track)}
                                    onClick={() => saveTournMutation.mutate()}
                                >Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Tournament Modal */}
            <div className="modal fade" id="deleteTournModal" aria-labelledby="deleteTournModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteTournModalLabel">Delete Tournament?</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {deleteTournMutation.isSuccess || deleteTournMutation.isError ? null :
                             deleteTournMutation.isPending ? <p>Processing...</p> :
                             runsForTourn.length ?
                                <div className="alert alert-warning small mb-0">Cannot delete this tournament — it has {runsForTourn.length} run{runsForTourn.length !== 1 ? 's' : ''} attached.</div> :
                                <p>Are you sure you want to remove <strong>{tournInReview.name}</strong> on {dateUtil.getMMDDYYYY(tournInReview.date)}?</p>
                            }
                        </div>
                        <div className="modal-footer flex-column align-items-stretch gap-2">
                            {!isAdmin && <div className="text-center small text-muted">Only admin can make changes.</div>}
                            <MutationStatus isSuccess={deleteTournMutation.isSuccess} isError={deleteTournMutation.isError} successMessage="Deletion successful." />
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                                <button
                                    type="button"
                                    className="btn btn-warning btn-sm"
                                    disabled={!isAdmin || deleteTournMutation.isPending || deleteTournMutation.isSuccess || runsForTourn.length > 0}
                                    onClick={() => deleteTournMutation.mutate()}
                                >Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Runs Modal */}
            <div className="modal fade" id="editRunsModal" aria-labelledby="editRunsModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editRunsModalLabel">Edit Runs — {tournInReview.name}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <RunsEdit
                                isAdmin={isAdmin}
                                tournInReview={tournInReview}
                                teams={teams}
                                runsForTourn={runsForTourn}
                                runsEditContest={runsEditContest}
                                setRunsEditContest={setRunsEditContest}
                                isLoading={runsQuery.isLoading}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
