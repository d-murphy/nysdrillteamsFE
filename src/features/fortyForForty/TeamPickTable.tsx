import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortDown } from "@fortawesome/free-solid-svg-icons";
import { useSimTeamSummaries, SimTeamSummary } from "../../hooks/fantasy/useSimTeamSummaries";

type StatSortCol = 'speedRating' | 'consistency' | 'overallScore';
type SortCol = StatSortCol | 'teamName';

interface TeamPickTableProps {
    selectedContest: string;
    year: number;
    hideStats: boolean;
    pickedKeys: string[];
    defaultSort?: SortCol;
    onPick: (key: string, contest: string) => void;
}

const STAT_COLS: {
    label: string;
    abbr: string;
    col: StatSortCol;
    barClass: string;
    getValue: (ts: SimTeamSummary) => number;
}[] = [
    { label: 'Speed',       abbr: 'SPD', col: 'speedRating',  barClass: 'nav-bg-color-dk',  getValue: ts => ts.speedRating  * 100 },
    { label: 'Consistency', abbr: 'CON', col: 'consistency',  barClass: 'nav-bg-color',      getValue: ts => ts.consistency  * 100 },
    { label: 'Overall',     abbr: 'OVR', col: 'overallScore', barClass: 'contest-selected',  getValue: ts => ts.overallScore * 100 },
];

const STAT_COL_WIDTH = 120;
const TOP_RUNS_WIDTH = 150;

export function TeamPickTable({ selectedContest, year, hideStats, pickedKeys, defaultSort, onPick }: TeamPickTableProps) {
    const [selectedSort, setSelectedSort] = useState<SortCol>(defaultSort ?? 'speedRating');
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Backend only accepts stat sorts; use speedRating as the fetch sort when sorting by name client-side
    const backendSort: StatSortCol = selectedSort === 'teamName' ? 'speedRating' : selectedSort;

    const { data: rawSummaries, isLoading } = useSimTeamSummaries(
        selectedContest, String(year), '', 100, 0, backendSort
    );

    // Apply client-side name sort when selected
    const teamSummaries = selectedSort === 'teamName'
        ? [...rawSummaries].sort((a, b) => a.team.localeCompare(b.team))
        : rawSummaries;

    const pickedTeams = pickedKeys.map(el => el.split('|')[0]);

    const handlePick = (ts: SimTeamSummary) => {
        onPick(`${ts.team}|${ts.year}|${selectedContest}`, selectedContest);
    };

    const getSortIcon = (col: SortCol) =>
        selectedSort === col
            ? <FontAwesomeIcon icon={faSortDown} className="text-primary ms-1" />
            : <FontAwesomeIcon icon={faSort} className="text-muted ms-1" />;

    const headerStyle: React.CSSProperties = {
        fontSize: '0.68rem',
        color: '#6c757d',
        userSelect: 'none',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 600,
    };

    return (
        <div>
            {/* Column headers */}
            <div className="d-flex align-items-center px-3 py-2 border-bottom border-top" style={headerStyle}>
                <div
                    className="flex-grow-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedSort('teamName')}
                >
                    Team {getSortIcon('teamName')}
                </div>
                {!hideStats && STAT_COLS.map(({ label, col }) => (
                    <div
                        key={col}
                        className="text-center d-none d-md-block"
                        style={{ width: STAT_COL_WIDTH, cursor: 'pointer' }}
                        onClick={() => setSelectedSort(col)}
                    >
                        {label} {getSortIcon(col)}
                    </div>
                ))}
                {!hideStats && (
                    <div className="text-end d-none d-md-block" style={{ width: TOP_RUNS_WIDTH }}>Top Runs</div>
                )}
            </div>

            {/* Rows */}
            <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                {isLoading ? (
                    <div className="text-center text-muted py-5">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                    </div>
                ) : teamSummaries.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        No teams found for {year} — try re-rolling the year.
                    </div>
                ) : (
                    teamSummaries.map(ts => {
                        const val = (n: number) => n.toFixed(0);
                        const isPicked = pickedTeams.includes(ts.team);
                        return (
                            <div
                                key={ts._id}
                                className="d-flex align-items-center px-3 py-3 border-bottom"
                                style={{
                                    cursor: isPicked ? 'default' : 'pointer',
                                    backgroundColor: isPicked
                                        ? '#f8f9fa'
                                        : hoveredId === ts._id ? '#f0f4ff' : 'transparent',
                                    opacity: isPicked ? 0.5 : 1,
                                    transition: 'background-color 0.1s, opacity 0.1s',
                                }}
                                onClick={() => !isPicked && handlePick(ts)}
                                onMouseEnter={() => !isPicked && setHoveredId(ts._id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Team name + year */}
                                <div className="flex-grow-1 me-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="fw-bold"
                                            style={{
                                                fontSize: '0.95rem',
                                                textDecoration: isPicked ? 'line-through' : 'none',
                                            }}
                                        >
                                            {ts.team}
                                        </div>
                                        {isPicked && (
                                            <span className="badge bg-secondary" style={{ fontSize: '0.6rem', fontWeight: 500 }}>
                                                Picked
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{ts.year}</div>

                                    {/* Mobile-only stats row — no bar charts */}
                                    {!hideStats && (
                                        <div className="d-flex d-md-none flex-wrap gap-2 mt-1">
                                            {STAT_COLS.map(({ abbr, getValue }) => (
                                                <div key={abbr} style={{ fontSize: '0.72rem' }}>
                                                    <span className="fw-semibold">{getValue(ts).toFixed(0)}</span>
                                                    <span className="text-muted ms-1">{abbr}</span>
                                                </div>
                                            ))}
                                            {ts.goodRunTimes.length > 0 && (
                                                <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                                    · {ts.goodRunTimes.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Stat columns */}
                                {!hideStats && STAT_COLS.map(({ abbr, col, barClass, getValue }) => {
                                    const pct = getValue(ts);
                                    return (
                                        <div key={col} className="text-center flex-shrink-0 d-none d-md-block" style={{ width: STAT_COL_WIDTH }}>
                                            <div className="fw-semibold" style={{ fontSize: '1rem' }}>{val(pct)}</div>
                                            <div className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {abbr}
                                            </div>
                                            <div style={{ width: '80%', height: 5, backgroundColor: '#e9ecef', borderRadius: 3, margin: '4px auto', overflow: 'hidden' }}>
                                                <div className={barClass} style={{ width: `${pct}%`, height: '100%' }} />
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Top runs */}
                                {!hideStats && (
                                    <div className="text-end flex-shrink-0 text-muted d-none d-md-block" style={{ width: TOP_RUNS_WIDTH, fontSize: '0.78rem', lineHeight: 1.4 }}>
                                        {ts.goodRunTimes.join(', ')}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
