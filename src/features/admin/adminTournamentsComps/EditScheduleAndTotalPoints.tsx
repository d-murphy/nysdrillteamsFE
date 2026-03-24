import React from 'react';
import { Tournament } from "../../../types/types"

interface EditScheduleAndTotalPointsProps {
    isAdmin: boolean;
    tournInReview: Tournament;
    handleCheck: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasRuns: boolean;
}

const POINTS_REGIONS = [
    { id: 'nassauPoints',    label: 'Nassau' },
    { id: 'northernPoints',  label: 'Northern' },
    { id: 'suffolkPoints',   label: 'Suffolk' },
    { id: 'westernPoints',   label: 'Western' },
    { id: 'juniorPoints',    label: 'Junior' },
    { id: 'nassauOfPoints',  label: 'Nassau OF' },
    { id: 'suffolkOfPoints', label: 'Suffolk OF' },
    { id: 'liOfPoints',      label: 'LI OF' },
];

const SCHEDULE_REGIONS = [
    { id: 'nassauSchedule',   label: 'Nassau' },
    { id: 'northernSchedule', label: 'Northern' },
    { id: 'suffolkSchedule',  label: 'Suffolk' },
    { id: 'westernSchedule',  label: 'Western' },
    { id: 'juniorSchedule',   label: 'Junior' },
    { id: 'liOfSchedule',     label: 'OF' },
];

export default function EditScheduleAndTotalPoints(props: EditScheduleAndTotalPointsProps) {
    const { isAdmin, tournInReview, handleCheck, hasRuns } = props;

    return (
        <div className="row g-3 mt-1 border-top pt-3">
            <div className="col-md-6">
                <div className="card h-100">
                    <div className="card-header py-2 d-flex align-items-center justify-content-between">
                        <span className="fw-semibold small">Total Points Regions</span>
                        {hasRuns && <span className="badge bg-warning-subtle text-warning-emphasis small">Locked — has runs</span>}
                    </div>
                    <div className="card-body py-2">
                        <div className="d-flex flex-column gap-2">
                            {POINTS_REGIONS.map(({ id, label }) => (
                                <div className="form-check form-switch mb-0" key={id}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id={id}
                                        name={id}
                                        checked={(tournInReview as any)?.[id] ?? false}
                                        onChange={handleCheck}
                                        disabled={!isAdmin || hasRuns}
                                    />
                                    <label className="form-check-label small" htmlFor={id}>{label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-6">
                <div className="card h-100">
                    <div className="card-header py-2">
                        <span className="fw-semibold small">Schedule Regions</span>
                    </div>
                    <div className="card-body py-2">
                        <div className="d-flex flex-column gap-2">
                            {SCHEDULE_REGIONS.map(({ id, label }) => (
                                <div className="form-check form-switch mb-0" key={id}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id={id}
                                        name={id}
                                        checked={(tournInReview as any)?.[id] ?? false}
                                        onChange={handleCheck}
                                        disabled={!isAdmin}
                                    />
                                    <label className="form-check-label small" htmlFor={id}>{label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
