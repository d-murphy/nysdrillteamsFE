import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { useFortyForFortyGame } from "../../hooks/fortyForForty/useFortyForFortyGame";
import { useSimTeamSummariesKey } from "../../hooks/fantasy/useSimTeamSummariesKey";
import { ShareModal } from "../../features/fortyForForty/ShareModal";

const CONTEST_ABBR: Record<string, string> = {
    "Three Man Ladder": "3ML",
    "B Ladder":         "BL",
    "C Ladder":         "CL",
    "C Hose":           "CH",
    "B Hose":           "BH",
    "Efficiency":       "EFF",
    "Motor Pump":       "MP",
    "Buckets":          "BUC",
};

const NAVY = "#013369";

type Grade = { label: string; title: string; color: string; isPerfect: boolean };

function getGrade(points: number): Grade {
    if (points >= 40) return { label: 'S',  title: 'Perfect Team',   color: '#c9a000', isPerfect: true  };
    if (points >= 30) return { label: 'A',  title: 'Potential Dynasty',       color: '#198754', isPerfect: false };
    if (points >= 20) return { label: 'B',  title: 'Solid Squad - Could be a Contender',  color: '#013369', isPerfect: false };
    if (points >= 10) return { label: 'C',  title: 'Young Team - Keep it up',     color: '#fd7e14', isPerfect: false };
    return                   { label: 'D',  title: 'Just Here for the Beer', color: '#dc3545', isPerfect: false };
}

export default function FortyForFortyEnd() {
    const { id: gameId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [showShare, setShowShare] = useState(false);

    const { data: game, isLoading, isError } = useFortyForFortyGame(gameId ?? '');
    const { data: teamSummaries, isLoading: isLoadingTeams } = useSimTeamSummariesKey(
        game?.contestSummaryKeys ?? []
    );

    if (isLoading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-secondary" role="status" />
            </div>
        );
    }

    if (isError || !game) {
        return (
            <div className="container py-5 text-center text-muted">
                Game not found.
            </div>
        );
    }

    const grade = getGrade(game.totalPoints);
    const rows = game.contestSummaryKeys.map((key, i) => {
        const [team, year, contest] = key.split('|');
        const summary = teamSummaries.find(
            s => s.team === team && String(s.year) === year && s.contest === contest
        );
        return {
            key, team, year, contest,
            points: game.contestPoints[i],
            finalTime: game.finalTimes?.[i],
            summary,
        };
    });

    return (
        <div className="container py-4" style={{ maxWidth: 760 }}>

            {/* Score header */}
            <div className="text-center mb-4">
                {/* Question */}
                <div
                    className="text-muted fw-semibold mb-2"
                    style={{ fontSize: '1.32rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                >
                    Can you go 40 for 40?
                </div>

                {/* Mode badge */}
                {game.gameMode && (
                    <div className="mb-3">
                        <span
                            className="badge rounded-pill text-white"
                            style={{ backgroundColor: NAVY, fontSize: '0.75rem', letterSpacing: '0.04em' }}
                        >
                            {game.gameMode === 'classic' ? 'Classic Mode' : 'Lifer Mode'}
                        </span>
                    </div>
                )}

                {/* Total points label */}
                <div
                    className="text-muted fw-semibold mb-1"
                    style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}
                >
                    Total Points
                </div>

                {/* Big number */}
                <div className="fw-bold" style={{ fontSize: '5rem', lineHeight: 1, color: grade.isPerfect ? grade.color : undefined }}>
                    {game.totalPoints}
                </div>

                {/* Perfect banner */}
                {grade.isPerfect && (
                    <div
                        className="fw-bold mt-2 mb-1"
                        style={{ fontSize: '1rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: grade.color }}
                    >
                        ★ You did it! ★
                    </div>
                )}

                {/* Grade badge + title */}
                <div
                    className="d-flex align-items-center justify-content-center gap-3 mt-3 mx-auto px-4 py-3 rounded"
                    style={{
                        border: `2px solid ${grade.color}`,
                        display: 'inline-flex',
                        maxWidth: 320,
                        boxShadow: grade.isPerfect ? `0 0 12px ${grade.color}55` : undefined,
                    }}
                >
                    <div
                        className="fw-bold text-white d-flex align-items-center justify-content-center rounded"
                        style={{
                            backgroundColor: grade.color,
                            width: 48, height: 48,
                            fontSize: '1.4rem',
                            boxShadow: grade.isPerfect ? `0 0 16px ${grade.color}88` : undefined,
                        }}
                    >
                        {grade.label}
                    </div>
                    <div className="text-start">
                        <div className="fw-bold" style={{ fontSize: '1.15rem', color: grade.color }}>
                            {grade.title}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="row g-2 mb-4 mx-auto" style={{ maxWidth: 480 }}>
                <div className="col-6">
                    <Button
                        className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '1rem' }}
                        onClick={() => setShowShare(true)}
                    >
                        <FontAwesomeIcon icon={faShareNodes} />
                        Share
                    </Button>
                </div>
                <div className="col-6">
                    <Button
                        variant="outline-secondary"
                        className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '1rem' }}
                        onClick={() => navigate('/Forty-for-Forty')}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Build Another
                    </Button>
                </div>
            </div>

            {/* Result rows */}
            <div className="d-flex flex-column gap-2">
                {rows.map(row => {
                    const abbr = CONTEST_ABBR[row.contest] ?? row.contest;
                    return (
                        <div
                            key={row.key}
                            className="bg-white rounded shadow-sm d-flex align-items-center overflow-hidden"
                        >
                            {/* Left accent bar */}
                            <div style={{ width: 5, backgroundColor: NAVY, alignSelf: 'stretch', flexShrink: 0 }} />

                            {/* Contest badge */}
                            <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0 ms-3 rounded"
                                style={{ width: 48, height: 48, backgroundColor: NAVY }}
                            >
                                <span className="fw-bold text-white" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>
                                    {abbr}
                                </span>
                            </div>

                            {/* Team info */}
                            <div className="flex-grow-1 px-3 py-3 min-w-0">
                                <div className="fw-bold text-truncate">{row.team}</div>
                                <div className="text-muted small">{row.contest} &middot; {row.year}</div>

                                {/* Mobile-only: time + pts stacked below team name */}
                                <div className="d-flex d-sm-none gap-3 mt-1">
                                    {row.finalTime != null && (
                                        <div>
                                            <span className="fw-bold" style={{ fontSize: '0.9rem' }}>
                                                {typeof row.finalTime === 'number' || !isNaN(Number(row.finalTime))
                                                    ? Number(row.finalTime).toFixed(2)
                                                    : row.finalTime}
                                            </span>
                                            <span className="text-muted ms-1" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>time</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{row.points}</span>
                                        <span className="text-muted ms-1" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* SPD / CON / OVR */}
                            {!isLoadingTeams && row.summary && (
                                <div className="d-none d-sm-flex gap-3 px-3 flex-shrink-0">
                                    {[
                                        { label: 'SPD', value: (row.summary.speedRating  * 100).toFixed(0) },
                                        { label: 'CON', value: (row.summary.consistency  * 100).toFixed(0) },
                                        { label: 'OVR', value: (row.summary.overallScore * 100).toFixed(0) },
                                    ].map(({ label, value }) => (
                                        <div className="text-center" key={label}>
                                            <div className="fw-bold" style={{ fontSize: '1rem' }}>{value}</div>
                                            <div className="text-muted" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Final time — desktop only */}
                            {row.finalTime != null && (
                                <div className="d-none d-sm-block text-center border-start px-3 py-3 flex-shrink-0" style={{ minWidth: 80 }}>
                                    <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                                        {typeof row.finalTime === 'number' || !isNaN(Number(row.finalTime))
                                            ? Number(row.finalTime).toFixed(2)
                                            : row.finalTime}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>time</div>
                                </div>
                            )}

                            {/* Points — desktop only */}
                            <div className="d-none d-sm-block text-center border-start px-3 py-3 flex-shrink-0" style={{ minWidth: 75 }}>
                                <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{row.points}</div>
                                <div className="text-muted" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>pts</div>
                            </div>
                        </div>
                    );
                })}

                {/* Total row */}
                <div className="rounded d-flex align-items-center justify-content-between px-4 py-3 nav-bg-color text-white mt-1 shadow-sm">
                    <div className="fw-bold fs-6">Total</div>
                    <div className="fw-bold fs-5">{game.totalPoints} pts</div>
                </div>
            </div>

            <ShareModal
                show={showShare}
                onHide={() => setShowShare(false)}
                game={game}
                grade={grade}
            />
        </div>
    );
}
