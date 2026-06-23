import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FortyForFortyGame } from "../../types/types";

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

interface ShareCardProps {
    game: FortyForFortyGame;
    grade: Grade;
}

function ShareCard({ game, grade }: ShareCardProps) {
    return (
        <div
            className="rounded-3 p-3 mb-3"
            style={{ backgroundColor: '#0d1b2a', color: '#fff' }}
        >
            {/* Top stat row */}
            <div className="d-flex align-items-end justify-content-between mb-2">
                <div>
                    <div
                        className="fw-semibold mb-1"
                        style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8899aa' }}
                    >
                        Total Points
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold" style={{ fontSize: '2.4rem', lineHeight: 1 }}>
                            {game.totalPoints}
                        </span>
                        <span
                            className="fw-bold text-center"
                            style={{ fontSize: '2rem', lineHeight: 1, color: grade.color }}
                        >
                            {grade.label}
                        </span>
                    </div>
                </div>
                <div className="text-end">
                    <div
                        className="fw-semibold mb-1"
                        style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8899aa' }}
                    >
                        Grade
                    </div>
                    <div className="fw-bold" style={{ fontSize: '1.1rem', color: grade.color }}>
                        {grade.title}
                    </div>
                </div>
            </div>

            {/* Mode badge */}
            {game.gameMode && (
                <div className="mb-3">
                    <span
                        className="badge"
                        style={{
                            backgroundColor: 'transparent',
                            border: `1px solid ${NAVY}`,
                            color: '#aab8cc',
                            fontSize: '0.65rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {game.gameMode === 'classic' ? 'Classic Mode' : 'Lifer Mode'}
                    </span>
                </div>
            )}

            {/* Pick rows */}
            <div className="d-flex flex-column gap-1 mb-3">
                {game.contestSummaryKeys.map((key, i) => {
                    const [team, year, contest] = key.split('|');
                    const abbr = CONTEST_ABBR[contest] ?? contest;
                    const finalTime = game.finalTimes?.[i];
                    const points = game.contestPoints[i];
                    const displayTime = finalTime != null
                        ? (typeof finalTime === 'number' || !isNaN(Number(finalTime))
                            ? Number(finalTime).toFixed(2)
                            : String(finalTime))
                        : null;
                    return (
                        <div key={key} className="d-flex align-items-center gap-2">
                            <div
                                className="d-flex align-items-center justify-content-center flex-shrink-0 rounded"
                                style={{ width: 36, height: 36, backgroundColor: NAVY }}
                            >
                                <span className="fw-bold text-white" style={{ fontSize: '0.6rem', letterSpacing: '0.02em' }}>
                                    {abbr}
                                </span>
                            </div>
                            <div className="flex-grow-1">
                                <div className="fw-bold" style={{ fontSize: '0.88rem' }}>{team}</div>
                                <div style={{ fontSize: '0.72rem', color: '#8899aa' }}>
                                    {contest} &middot; {year}
                                </div>
                            </div>
                            <div className="d-flex gap-2 flex-shrink-0 text-end">
                                {displayTime != null && (
                                    <div>
                                        <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{displayTime}</div>
                                        <div style={{ fontSize: '0.58rem', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>time</div>
                                    </div>
                                )}
                                <div>
                                    <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{points}</div>
                                    <div style={{ fontSize: '0.58rem', color: '#8899aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>pts</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Card footer */}
            <div
                className="d-flex align-items-center justify-content-between pt-2"
                style={{ borderTop: '1px solid #1e3050' }}
            >
                <span style={{ fontSize: '0.78rem', color: '#8899aa' }}>Can you go 40 for 40?</span>
                <span style={{ fontSize: '0.78rem', color: '#8899aa' }}>nysdrillteams.com</span>
            </div>
        </div>
    );
}

interface ShareModalProps {
    show: boolean;
    onHide: () => void;
    game: FortyForFortyGame;
    grade: Grade;
}

export function ShareModal({ show, onHide, game, grade }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = window.location.href;
    const shareText = `I just scored ${game.totalPoints} points in 40 for 40 - a NYS FD Drill Teams game! Think you can do better?`;

    const handleCopy = async () => {
        const fullText = `${shareText}\n${shareUrl}`;
        try {
            await navigator.clipboard.writeText(fullText);
        } catch {
            const input = document.createElement('input');
            input.value = fullText;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold" style={{ fontSize: '1.15rem' }}>
                    Share your team
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
                <ShareCard game={game} grade={grade} />

                {/* Share blurb */}
                <div className="mb-3 px-1">
                    <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>
                        {shareText}
                    </div>
                    <div className="mt-1" style={{ fontSize: '0.82rem', color: NAVY, fontWeight: 600 }}>
                        Play 40 for 40
                    </div>
                </div>

                {/* Copy link */}
                <button
                    className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                    style={{ fontSize: '0.92rem' }}
                    onClick={handleCopy}
                >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                    {copied ? 'Copied!' : 'Copy link'}
                </button>
            </Modal.Body>
        </Modal>
    );
}
