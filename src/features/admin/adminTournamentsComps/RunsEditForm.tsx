import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tournament, Team, Run } from "../../../types/types"
import dateUtil from '../../../utils/dateUtils';
import RunVideos from './RunVideos';
import { fetchPost, logUpdate } from "../../../utils/network";
import { useLoginContext } from "../../../utils/context";

interface EditRunsFormProps {
    isAdmin: boolean,
    tournInReview: Tournament,
    teams: Team[],
    runsEditContest: string,
    runInReview: Run,
    setRunInReview: React.Dispatch<React.SetStateAction<Run>>,
    editOrInsertRun: 'edit' | 'insert',
    reqResult: { error: boolean, message: string } | null,
    setReqResult: React.Dispatch<React.SetStateAction<{ error: boolean, message: string } | null>>,
    showingDeleteWarning: boolean,
    setShowingDeleteWarning: React.Dispatch<React.SetStateAction<boolean>>
}

declare var SERVICE_URL: string;

const POINTS_FLAGS = [
    { id: 'nassauPoints', label: 'Nassau Points' },
    { id: 'northernPoints', label: 'Northern Points' },
    { id: 'suffolkPoints', label: 'Suffolk Points' },
    { id: 'westernPoints', label: 'Western Points' },
    { id: 'juniorPoints', label: 'Jr Points' },
    { id: 'nassauOfPoints', label: 'Nassau OF Points' },
    { id: 'suffolkOfPoints', label: 'Suffolk OF Points' },
    { id: 'liOfPoints', label: 'LI OF Points' },
    { id: 'sanctioned', label: 'Sanctioned' },
];

export default function RunsEditForm(props: EditRunsFormProps) {
    const { isAdmin, runInReview, setRunInReview, tournInReview } = props;
    const { editOrInsertRun, reqResult, setReqResult, showingDeleteWarning, setShowingDeleteWarning } = props;
    const queryClient = useQueryClient();
    const { sessionId, username } = useLoginContext();

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (editOrInsertRun === 'insert') {
                await fetchPost(`${SERVICE_URL}/runs/insertRun`, { runsData: runInReview }, sessionId);
                logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Inserted Run: ${dateUtil.getMMDDYYYY(runInReview.date)} - ${runInReview.tournament} - ${runInReview.contest} - ${runInReview.team} - ${runInReview.time}`);
            } else {
                const runId = runInReview._id;
                const { _id: _, ...runData } = runInReview;
                await fetchPost(`${SERVICE_URL}/runs/updateRun`, { runId, fieldsToUpdate: runData }, sessionId);
                logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Updated Run: ${dateUtil.getMMDDYYYY(runInReview.date)} - ${runInReview.tournament} - ${runInReview.contest} - ${runInReview.team} - ${runInReview.time}`);
            }
        },
        onSuccess: () => {
            setReqResult({ error: false, message: "Record saved successfully." });
            setRunInReview(null);
            queryClient.invalidateQueries({ queryKey: ['runsForTournament', tournInReview.id] });
        },
        onError: () => {
            setReqResult({ error: true, message: "An error occurred. Can you try again?" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await fetchPost(`${SERVICE_URL}/runs/deleteRun`, { runId: runInReview._id }, sessionId);
            logUpdate(`${SERVICE_URL}/updates/insertUpdate`, sessionId, username, `Deleted Run: ${dateUtil.getMMDDYYYY(runInReview.date)} - ${runInReview.tournament} - ${runInReview.contest} - ${runInReview.team} - ${runInReview.time}`);
        },
        onSuccess: () => {
            setReqResult({ error: false, message: "Record deleted successfully." });
            setRunInReview(null);
            setShowingDeleteWarning(false);
            queryClient.invalidateQueries({ queryKey: ['runsForTournament', tournInReview.id] });
        },
        onError: () => {
            setShowingDeleteWarning(false);
            setReqResult({ error: true, message: "An error occurred. Can you try again?" });
        },
    });

    function handleTextInput(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
        setRunInReview({ ...runInReview, [e.target.id]: e.target.value });
    }

    function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
        setRunInReview({ ...runInReview, time: e.target.value, timeNum: parseFloat(e.target.value) });
    }

    function handlePointsChange(e: React.ChangeEvent<HTMLInputElement>, field: 'points' | 'totalPointsOverride') {
        setRunInReview({ ...runInReview, [field]: parseFloat(e.target.value) });
    }

    function handleCheck(e: React.ChangeEvent<HTMLInputElement>) {
        setRunInReview({ ...runInReview, [e.target.id]: e.target.checked });
    }

    function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        setRunInReview({ ...runInReview, [e.target.id]: e.target.value });
    }

    function tryDelete() {
        if (!showingDeleteWarning) {
            setShowingDeleteWarning(true);
            return;
        }
        deleteMutation.mutate();
    }

    if (reqResult) {
        return (
            <div className={`text-center py-5 ${reqResult.error ? "text-danger" : "text-success"}`}>
                {reqResult.message}
            </div>
        );
    }

    if (!runInReview) {
        return <div className="text-muted text-center py-5 small fst-italic">Select a team from the list to edit or add a run.</div>;
    }

    return (
        <div className="w-100">
            {/* Info summary */}
            <div className="card bg-light mb-3">
                <div className="card-body py-2 px-3">
                    <div className="row g-1 small">
                        <div className="col-6"><span className="text-muted">Team:</span> <strong>{runInReview.team}</strong></div>
                        <div className="col-6"><span className="text-muted">Tournament:</span> {runInReview.tournament}</div>
                        <div className="col-6"><span className="text-muted">Track:</span> {runInReview.track}</div>
                        <div className="col-6"><span className="text-muted">Date:</span> {dateUtil.getMMDDYYYY(runInReview.date)}</div>
                        <div className="col-6"><span className="text-muted">Running Position:</span> {runInReview.runningPosition ?? '—'}</div>
                    </div>
                </div>
            </div>

            <div className="mb-3 row align-items-center">
                <label htmlFor="time" className="col-4 col-form-label fw-semibold text-end small">Time*</label>
                <div className="col-8">
                    <input
                        id="time"
                        value={runInReview.time}
                        className="form-control form-control-sm"
                        disabled={!isAdmin}
                        autoComplete="off"
                        onChange={handleTimeChange}
                    />
                </div>
            </div>
            <div className="mb-3 row align-items-center">
                <label htmlFor="rank" className="col-4 col-form-label fw-semibold text-end small">Place</label>
                <div className="col-8">
                    <select id="rank" onChange={handleSelect} className="form-select form-select-sm" value={runInReview.rank} disabled={!isAdmin}>
                        <option value="">Did not place / In Progress</option>
                        <option value="1">1st Place</option>
                        <option value="2">2nd Place</option>
                        <option value="3">3rd Place</option>
                        <option value="4">4th Place</option>
                        <option value="5">5th Place</option>
                    </select>
                </div>
            </div>
            <div className="mb-3 row align-items-center">
                <label htmlFor="points" className="col-4 col-form-label fw-semibold text-end small">Points</label>
                <div className="col-8">
                    <input
                        id="points"
                        value={runInReview.points ? runInReview.points : ''}
                        className="form-control form-control-sm"
                        type="number"
                        step=".01"
                        disabled={!isAdmin}
                        autoComplete="off"
                        onChange={(e) => handlePointsChange(e, 'points')}
                    />
                </div>
            </div>

            <hr className="my-2" />
            <div className="row g-3 mb-3">
                <div className="col-6">
                    <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" role="switch" id="stateRecord" name="stateRecord" checked={runInReview?.stateRecord} onChange={handleCheck} disabled={!isAdmin} />
                        <label className="form-check-label small" htmlFor="stateRecord">State Record</label>
                    </div>
                </div>
                <div className="col-6">
                    <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" role="switch" id="currentStateRecord" name="currentStateRecord" checked={runInReview?.currentStateRecord} onChange={handleCheck} disabled={!isAdmin} />
                        <label className="form-check-label small" htmlFor="currentStateRecord">Current State Record</label>
                    </div>
                </div>
            </div>

            <div className="mb-3 row align-items-start">
                <label htmlFor="notes" className="col-4 col-form-label fw-semibold text-end small">Notes</label>
                <div className="col-8">
                    <textarea
                        id="notes"
                        name="notes"
                        className="form-control form-control-sm"
                        rows={2}
                        onChange={handleTextInput}
                        value={runInReview.notes}
                    />
                </div>
            </div>

            <RunVideos runInReview={runInReview} setRunInReview={setRunInReview} />

            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center gap-2">
                    {showingDeleteWarning && <span className="text-danger small">Are you sure?</span>}
                    <button type="button" className="btn btn-danger btn-sm" disabled={!isAdmin || deleteMutation.isPending} onClick={tryDelete}>
                        {!showingDeleteWarning ? 'Delete Run' : 'Yes, Delete'}
                    </button>
                </div>
                <button type="button" className="btn btn-success btn-sm" disabled={!runInReview.time || saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save</button>
            </div>

            <details className="mt-3 border rounded p-3">
                <summary className="fw-semibold small text-muted" style={{ cursor: 'pointer' }}>Advanced Settings</summary>
                <div className="mt-2 small text-muted fst-italic mb-3">
                    Pre-populated from tournament settings. Only change if necessary. These show total points for the <strong>run</strong>, not the tournament.
                </div>
                <div className="mb-3 row align-items-start">
                    <label htmlFor="totalPointsOverride" className="col-5 col-form-label fw-semibold text-end small">Area Total Points Override</label>
                    <div className="col-7">
                        <input
                            id="totalPointsOverride"
                            value={runInReview.totalPointsOverride || runInReview.totalPointsOverride === 0 ? runInReview.totalPointsOverride : ''}
                            className="form-control form-control-sm"
                            type="number"
                            step=".01"
                            disabled={!isAdmin}
                            autoComplete="off"
                            onChange={(e) => handlePointsChange(e, 'totalPointsOverride')}
                        />
                        <div className="form-text small">For Northern/Western only — excludes visiting teams. Leave blank in most cases.</div>
                    </div>
                </div>
                <div className="row g-2">
                    {POINTS_FLAGS.map(({ id, label }) => (
                        <div key={id} className="col-6">
                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id={id}
                                    name={id}
                                    checked={(runInReview as any)[id]}
                                    onChange={handleCheck}
                                    disabled={!isAdmin}
                                />
                                <label className="form-check-label small" htmlFor={id}>{label}</label>
                            </div>
                        </div>
                    ))}
                </div>
            </details>
        </div>
    );
}
