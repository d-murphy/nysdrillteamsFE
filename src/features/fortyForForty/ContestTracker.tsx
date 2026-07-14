import React from "react";
import getImgLocation from "../../utils/imgLU";
import { SizedImage } from "../../shared/components/SizedImage";

interface Pick {
    contest: string;
    key: string;
}

interface ContestTrackerProps {
    contests: string[];
    picks: Pick[];
    selectedContest: string;
    onSelectContest: (contest: string) => void;
    disabled?: boolean;
}

export function ContestTracker({ contests, picks, selectedContest, onSelectContest, disabled }: ContestTrackerProps) {
    return (
        <div className="mb-3">
            <div className="text-muted small fw-semibold mb-2 text-uppercase" style={{ letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                Contests — {picks.length} / {contests.length}
            </div>
            <div className="d-flex flex-column gap-1">
                {contests.map(contest => {
                    const pick = picks.find(p => p.contest === contest);
                    const [team, year] = pick ? pick.key.split('|') : [];
                    const isSelected = !pick && contest === selectedContest;
                    const isClickable = !pick && !disabled;

                    return (
                        <div
                            key={contest}
                            onClick={() => isClickable && onSelectContest(contest)}
                            className={`rounded px-3 py-2 d-flex justify-content-between align-items-center ${
                                isSelected ? 'border border-primary bg-primary bg-opacity-10' :
                                pick ? 'border border-success bg-success bg-opacity-10' :
                                'border border-light bg-light'
                            }`}
                            style={{ cursor: isClickable ? 'pointer' : 'default', transition: 'all 0.12s' }}
                        >
                            <div>
                                <div className={`fw-semibold ${isSelected ? 'text-primary' : ''}`} style={{ fontSize: '0.875rem' }}>
                                    {contest}
                                </div>
                                {pick && (
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {team} &middot; {year}
                                    </div>
                                )}
                            </div>
                            {pick && (
                                <SizedImage imageSrc={getImgLocation(team)} size="sm" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
