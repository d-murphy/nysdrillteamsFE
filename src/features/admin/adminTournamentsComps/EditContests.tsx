import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Tournament, Team } from "../../../types/types"
import ContestOptions from "./ContestOptions";

interface EditContestsProps {
    isAdmin: boolean,
    tournInReview: Tournament,
    setTournInReview: React.Dispatch<React.SetStateAction<Tournament>>,
    teams: Team[]
}

export default function EditContests(props: EditContestsProps) {
    const { isAdmin, tournInReview, setTournInReview } = props;

    function addContest() {
        setTournInReview({
            ...tournInReview,
            contests: [...tournInReview.contests, { name: null, cfp: true, sanction: true }]
        });
    }

    function removeContest() {
        const contests = [...tournInReview.contests];
        contests.pop();
        setTournInReview({ ...tournInReview, contests });
    }

    function selectContest(e: React.ChangeEvent<HTMLSelectElement>, ind: number) {
        const contests = [...tournInReview.contests];
        contests[ind] = { ...contests[ind], name: e.target.value };
        setTournInReview({ ...tournInReview, contests });
    }

    function handleContestCheck(e: React.ChangeEvent<HTMLInputElement>, ind: number, contestObjKey: 'cfp' | 'sanction') {
        const contests = [...tournInReview.contests];
        contests[ind] = { ...contests[ind], [contestObjKey]: e.target.checked };
        setTournInReview({ ...tournInReview, contests });
    }

    return (
        <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-semibold small">Contests</span>
                {isAdmin && (
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addContest}>
                        <FontAwesomeIcon icon={faPlus} className="me-1" />Add Contest
                    </button>
                )}
            </div>

            <div className="d-flex flex-column gap-2">
                {tournInReview.contests.map((contest, ind) => (
                    <div key={ind} className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
                        <span className="text-muted small fw-semibold" style={{ width: '20px', flexShrink: 0 }}>{ind + 1}.</span>
                        <select
                            onChange={(e) => selectContest(e, ind)}
                            className="form-select form-select-sm flex-grow-1"
                            value={contest.name}
                            disabled={!isAdmin}
                        >
                            <ContestOptions />
                        </select>
                        <div className="form-check form-switch mb-0 d-flex align-items-center gap-1" style={{ flexShrink: 0 }}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`cfp-${ind}`}
                                checked={contest.cfp}
                                onChange={(e) => handleContestCheck(e, ind, "cfp")}
                                disabled={!isAdmin}
                            />
                            <label className="form-check-label small" htmlFor={`cfp-${ind}`}>Points</label>
                        </div>
                        <div className="form-check form-switch mb-0 d-flex align-items-center gap-1" style={{ flexShrink: 0 }}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`sanction-${ind}`}
                                checked={contest.sanction}
                                onChange={(e) => handleContestCheck(e, ind, "sanction")}
                                disabled={!isAdmin}
                            />
                            <label className="form-check-label small" htmlFor={`sanction-${ind}`}>Sanctioned</label>
                        </div>
                        {isAdmin && ind + 1 === tournInReview.contests.length && (
                            <button
                                type="button"
                                className="btn btn-link btn-sm text-danger p-0"
                                onClick={removeContest}
                                title="Remove last contest"
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
