import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {
    FortyForFortyModeFilter,
    useFortyForFortyLeaderboard,
} from "../../hooks/fortyForForty/useFortyForFortyLeaderboard";

const PREVIEW_LIMIT = 5;
const GOLD = "#c9a000";
const MUTED = "#8899aa";
const LIFER_FILL = "#e8edf4";
const LIFER_TEXT = "#0d1b2a";
const TOGGLE_OUTLINE = "#aab8cc";

/** null = neither selected → show both modes */
type PreviewModeSelection = 'classic' | 'lifer' | null;

function ModePill({ mode }: { mode?: string }) {
    if (mode !== 'classic' && mode !== 'lifer') return null;
    const isLifer = mode === 'lifer';
    return (
        <span
            className={`badge rounded-pill ${isLifer ? '' : 'bg-primary'}`}
            style={{
                fontSize: '0.58rem',
                letterSpacing: '0.04em',
                fontWeight: 600,
                ...(isLifer ? { backgroundColor: LIFER_FILL, color: LIFER_TEXT } : {}),
            }}
        >
            {isLifer ? 'Lifer' : 'Classic'}
        </span>
    );
}

export function FortyForFortyAllTimePreview() {
    const navigate = useNavigate();
    const [modeSelection, setModeSelection] = useState<PreviewModeSelection>(null);
    const gameMode: FortyForFortyModeFilter = modeSelection ?? 'both';
    const showModePills = modeSelection === null;

    const { data: games, isLoading, isError } = useFortyForFortyLeaderboard({
        kind: 'topGamesAllTime',
        gameMode,
        limit: PREVIEW_LIMIT,
    });

    if (isError) return null;
    // Hide the whole block only when there's nothing to show in the default (both) view
    if (modeSelection === null && !isLoading && (!games || games.length === 0)) return null;

    return (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid #1e3050' }}>
            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                <div
                    className="fw-semibold"
                    style={{
                        fontSize: '0.65rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: MUTED,
                    }}
                >
                    All-Time Leaders
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                    <button
                        type="button"
                        className={`badge rounded-pill ${
                            modeSelection === 'classic' ? 'bg-primary text-white' : ''
                        }`}
                        style={{
                            fontSize: '0.58rem',
                            letterSpacing: '0.04em',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '0.3em 0.65em',
                            ...(modeSelection === 'classic'
                                ? { border: '1px solid transparent' }
                                : { backgroundColor: 'transparent', color: TOGGLE_OUTLINE, border: `1px solid ${TOGGLE_OUTLINE}` }),
                        }}
                        onClick={() => setModeSelection('classic')}
                    >
                        Classic
                    </button>
                    <button
                        type="button"
                        className="badge rounded-pill"
                        style={{
                            fontSize: '0.58rem',
                            letterSpacing: '0.04em',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '0.3em 0.65em',
                            ...(modeSelection === 'lifer'
                                ? { backgroundColor: LIFER_FILL, color: LIFER_TEXT, border: `1px solid ${LIFER_FILL}` }
                                : { backgroundColor: 'transparent', color: TOGGLE_OUTLINE, border: `1px solid ${TOGGLE_OUTLINE}` }),
                        }}
                        onClick={() => setModeSelection('lifer')}
                    >
                        Lifer
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="text-center py-2">
                    <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                </div>
            )}

            {!isLoading && games && games.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: MUTED }} className="py-1">
                    No named games yet.
                </div>
            )}

            {!isLoading && games && games.map((game, index) => (
                <button
                    key={game.gameId}
                    type="button"
                    className="d-flex align-items-center gap-2 w-100 bg-transparent border-0 text-start px-0 py-1"
                    style={{ cursor: 'pointer', color: '#fff' }}
                    onClick={() => navigate(`/Forty-for-Forty/${game.gameId}`)}
                >
                    <span
                        className="flex-shrink-0 text-center"
                        style={{ width: 18, fontSize: '0.75rem', color: MUTED, fontVariantNumeric: 'tabular-nums' }}
                    >
                        {index + 1}
                    </span>
                    <div className="flex-grow-1 min-w-0 d-flex align-items-center gap-2">
                        <span className="fw-semibold text-truncate" style={{ fontSize: '0.88rem' }}>
                            {game.leaderboardName}
                        </span>
                        {showModePills && <ModePill mode={game.gameMode} />}
                    </div>
                    <span
                        className="fw-bold flex-shrink-0"
                        style={{ fontSize: '0.95rem', color: GOLD, fontVariantNumeric: 'tabular-nums' }}
                    >
                        {game.totalPoints}
                    </span>
                </button>
            ))}

            <Link
                to="/Forty-for-Forty"
                className="d-inline-flex align-items-center gap-1 mt-2 text-decoration-none"
                style={{ fontSize: '0.78rem', color: MUTED, fontWeight: 600 }}
            >
                Full scoreboard
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.6rem' }} />
            </Link>
        </div>
    );
}
