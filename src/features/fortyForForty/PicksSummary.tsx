import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

interface Pick {
    contest: string;
    key: string;
}

interface PicksSummaryProps {
    contests: string[];
    picks: Pick[];
}

export function PicksSummary({ contests, picks }: PicksSummaryProps) {
    return (
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
            {contests.map(contest => {
                const pick = picks.find(p => p.contest === contest);
                const [team, year] = pick ? pick.key.split('|') : [];
                return (
                    <div
                        key={contest}
                        className={`rounded p-2 text-center ${pick ? 'bg-success text-white' : 'bg-light text-muted'}`}
                        style={{ minWidth: '110px', fontSize: '0.75rem', opacity: pick ? 1 : 0.6 }}
                    >
                        <div className="fw-bold text-truncate">{contest}</div>
                        {pick ? (
                            <div className="text-truncate">
                                <FontAwesomeIcon icon={faCheck} className="me-1" />
                                {team} ({year})
                            </div>
                        ) : (
                            <div>—</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
