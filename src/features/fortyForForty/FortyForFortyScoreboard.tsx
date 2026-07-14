import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ButtonGroup } from "react-bootstrap";
import { FortyForFortyGame } from "../../types/types";
import {
    FortyForFortyModeFilter,
    parseGameCreatedAt,
    useFortyForFortyLeaderboard,
} from "../../hooks/fortyForForty/useFortyForFortyLeaderboard";

const NAVY = "#013369";

const MODE_OPTIONS: { value: FortyForFortyModeFilter; label: string }[] = [
    { value: 'both', label: 'Both' },
    { value: 'classic', label: 'Classic' },
    { value: 'lifer', label: 'Lifer' },
];

function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ModePill({ mode }: { mode?: string }) {
    if (mode !== 'classic' && mode !== 'lifer') return null;
    const isLifer = mode === 'lifer';
    return (
        <span
            className={`badge rounded-pill ${isLifer ? 'bg-dark' : 'bg-primary'}`}
            style={{ fontSize: '0.62rem', letterSpacing: '0.04em', fontWeight: 600 }}
        >
            {isLifer ? 'Lifer' : 'Classic'}
        </span>
    );
}

interface BoardColumnProps {
    title: string;
    subtitle?: string;
    games: FortyForFortyGame[] | undefined;
    isLoading: boolean;
    isError: boolean;
    showMode: boolean;
    showTime?: boolean;
}

function BoardColumn({
    title,
    subtitle,
    games,
    isLoading,
    isError,
    showMode,
    showTime = false,
}: BoardColumnProps) {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded shadow-sm p-3 h-100 d-flex flex-column">
            <div className="text-center mb-2">
                <div className="fw-bold" style={{ fontSize: '1.05rem' }}>{title}</div>
                {subtitle && (
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{subtitle}</div>
                )}
            </div>

            <div className="flex-grow-1">
                {isLoading && (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                    </div>
                )}
                {isError && (
                    <div className="text-danger text-center small py-3">Couldn’t load results.</div>
                )}
                {!isLoading && !isError && games && games.length === 0 && (
                    <div className="text-muted text-center small py-3">No named games yet.</div>
                )}
                {!isLoading && !isError && games && games.map((game, index) => {
                    const createdAt = parseGameCreatedAt(game.gameId);
                    return (
                        <button
                            key={game.gameId}
                            type="button"
                            className="d-flex align-items-center gap-2 w-100 bg-transparent border-0 text-start px-1 py-2"
                            style={{
                                borderBottom: index < games.length - 1 ? '1px solid #eee' : undefined,
                                cursor: 'pointer',
                            }}
                            onClick={() => navigate(`/Forty-for-Forty/${game.gameId}`)}
                        >
                            <span
                                className="text-muted flex-shrink-0 text-center"
                                style={{ width: 22, fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}
                            >
                                {index + 1}
                            </span>
                            <div className="flex-grow-1 min-w-0">
                                <div className="fw-semibold text-truncate" style={{ fontSize: '0.92rem' }}>
                                    {game.leaderboardName}
                                </div>
                                {(showMode || showTime) && (
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        {showMode && <ModePill mode={game.gameMode} />}
                                        {(showTime || showMode) && createdAt && (
                                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                {formatRelativeTime(createdAt)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div
                                className="fw-bold flex-shrink-0"
                                style={{ fontSize: '1rem', fontVariantNumeric: 'tabular-nums', color: NAVY }}
                            >
                                {game.totalPoints}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function FortyForFortyScoreboard() {
    const [mode, setMode] = useState<FortyForFortyModeFilter>('both');
    const showMode = mode === 'both';

    const recent = useFortyForFortyLeaderboard({ kind: 'recentNamedGames', gameMode: mode });
    const thisWeek = useFortyForFortyLeaderboard({ kind: 'topGamesThisWeek', gameMode: mode });
    const allTime = useFortyForFortyLeaderboard({ kind: 'topGamesAllTime', gameMode: mode });

    return (
        <div className="mt-5">
            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mb-3">
                <h2 className="fw-bold mb-0" style={{ fontSize: '1.35rem' }}>
                    Scoreboard
                </h2>
                <ButtonGroup size="sm">
                    {MODE_OPTIONS.map(opt => (
                        <Button
                            key={opt.value}
                            variant={mode === opt.value ? 'primary' : 'outline-secondary'}
                            onClick={() => setMode(opt.value)}
                            className="fw-semibold px-3"
                        >
                            {opt.label}
                        </Button>
                    ))}
                </ButtonGroup>
            </div>

            <div className="row g-3">
                <div className="col-12 col-lg-4">
                    <BoardColumn
                        title="Recent"
                        subtitle="Newest named games"
                        games={recent.data}
                        isLoading={recent.isLoading}
                        isError={recent.isError}
                        showMode={showMode}
                        showTime
                    />
                </div>
                <div className="col-12 col-lg-4">
                    <BoardColumn
                        title="This Week"
                        subtitle="Top scores · last 7 days"
                        games={thisWeek.data}
                        isLoading={thisWeek.isLoading}
                        isError={thisWeek.isError}
                        showMode={showMode}
                    />
                </div>
                <div className="col-12 col-lg-4">
                    <BoardColumn
                        title="All Time"
                        subtitle="Highest scores ever"
                        games={allTime.data}
                        isLoading={allTime.isLoading}
                        isError={allTime.isError}
                        showMode={showMode}
                    />
                </div>
            </div>
        </div>
    );
}
