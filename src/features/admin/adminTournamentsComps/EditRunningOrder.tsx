import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Tournament, Team, Run } from "../../../types/types"

interface EditRunningOrderProps {
    isAdmin: boolean,
    tournInReview: Tournament,
    setTournInReview: React.Dispatch<React.SetStateAction<Tournament>>,
    teams: Team[],
    runsForTourn: Run[]
}

export default function EditRunningOrder(props: EditRunningOrderProps) {
    const { isAdmin, tournInReview, setTournInReview, teams, runsForTourn } = props;

    const runsTeamArr = runsForTourn
        .filter(el => !Object.values(tournInReview.runningOrder).includes(el.team))
        .map(el => el.team);
    const teamsWithRunsNotInRO = Array.from(new Set(runsTeamArr)).sort((a, b) => a < b ? -1 : 1);

    function addTeamToRunningOrder(addOrDelete: 'add' | 'delete') {
        const runOrder = { ...tournInReview.runningOrder };
        const max = Object.keys(runOrder).length ? Math.max(...Object.keys(runOrder).map(el => parseInt(el))) : 0;
        if (addOrDelete === 'add') {
            runOrder[max + 1] = '';
        } else {
            delete runOrder[max];
        }
        setTournInReview({ ...tournInReview, runningOrder: runOrder });
    }

    function selectTeamInRunningOrder(e: React.ChangeEvent<HTMLSelectElement>, key: number) {
        const runOrder = { ...tournInReview.runningOrder };
        runOrder[key] = e.target.value;
        setTournInReview({ ...tournInReview, runningOrder: runOrder });
    }

    return (
        <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-semibold small">Running Order</span>
                {isAdmin && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => addTeamToRunningOrder('add')}
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-1" />Add Team
                    </button>
                )}
            </div>

            {teamsWithRunsNotInRO.length > 0 && (
                <div className="alert alert-warning py-2 small mb-3">
                    <strong>Note:</strong> {teamsWithRunsNotInRO.join(', ')} {teamsWithRunsNotInRO.length === 1 ? 'has' : 'have'} runs but {teamsWithRunsNotInRO.length === 1 ? 'is' : 'are'} not in the running order.
                </div>
            )}

            <div className="d-flex flex-column gap-1" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {Object.keys(tournInReview.runningOrder).map((key: string, index: number) => (
                    <div key={key} className="d-flex align-items-center gap-2">
                        <span className="text-muted small fw-semibold" style={{ width: '24px', textAlign: 'right', flexShrink: 0 }}>{key}.</span>
                        <select
                            onChange={(e) => selectTeamInRunningOrder(e, parseInt(key))}
                            className="form-select form-select-sm flex-grow-1"
                            value={tournInReview.runningOrder[parseInt(key)]}
                            disabled={!isAdmin}
                        >
                            <option value="">— Select Team —</option>
                            {teams.map(el => (
                                <option key={el.fullName} value={el.fullName}>{el.fullName}</option>
                            ))}
                        </select>
                        {isAdmin && index + 1 === Object.keys(tournInReview.runningOrder).length && (
                            <button
                                type="button"
                                className="btn btn-link btn-sm text-danger p-0"
                                onClick={() => addTeamToRunningOrder('delete')}
                                title="Remove last entry"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
