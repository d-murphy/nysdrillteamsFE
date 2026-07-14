import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSort, faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons";
import { Projection, Run } from "../../types/types";
import { useProjections } from "../../hooks/simulation/useProjections";
import { useTournamentByNameYear } from "../../shared/hooks/useTournament";
import { useTournamentRuns } from "../../shared/hooks/useTournamentRuns";

const SIMULATION_RUNS = 500;

type SortableProjectionField = keyof Projection;

type ContestGroup = {
    label: string;
    winsKey?: SortableProjectionField;
    top5Key?: SortableProjectionField;
    /** Contest name used to look up actual run results; omit for Overall (uses top5 finish). */
    contestName?: string;
};

const CONTEST_GROUPS: ContestGroup[] = [
    { label: "Overall", winsKey: "Overall Wins", top5Key: "Overall Top5" },
    {
        label: "3 Man Ladder",
        winsKey: "Three Man Ladder Wins",
        top5Key: "Three Man Ladder Top5",
        contestName: "Three Man Ladder",
    },
    {
        label: "B Ladder",
        winsKey: "B Ladder Wins",
        top5Key: "B Ladder Top5",
        contestName: "B Ladder",
    },
    {
        label: "C Ladder",
        winsKey: "C Ladder Wins",
        top5Key: "C Ladder Top5",
        contestName: "C Ladder",
    },
    {
        label: "C Hose",
        winsKey: "C Hose Wins",
        top5Key: "C Hose Top5",
        contestName: "C Hose",
    },
    {
        label: "B Hose",
        winsKey: "B Hose Wins",
        top5Key: "B Hose Top5",
        contestName: "B Hose",
    },
    {
        label: "Efficiency",
        winsKey: "Efficiency Wins",
        top5Key: "Efficiency Top5",
        contestName: "Efficiency",
    },
    {
        label: "Motor Pump",
        winsKey: "Motor Pump Wins",
        top5Key: "Motor Pump Top5",
        contestName: "Motor Pump",
    },
    {
        label: "Buckets",
        winsKey: "Buckets Wins",
        top5Key: "Buckets Top5",
        contestName: "Buckets",
    },
];

type Top5Entry = { teamName: string; points: number; finishingPosition: string };

function formatPercentage(count: number) {
    if (count < 5) return "< 1%";
    return `${((count / SIMULATION_RUNS) * 100).toFixed(1)}%`;
}

function getFinishAndPoints(teamName: string, top5: Top5Entry[] | undefined) {
    if (!top5?.length) return "";
    const entry = top5.find((t) => t.teamName === teamName);
    if (!entry?.finishingPosition) return "";
    const pts = entry.points;
    return `${entry.finishingPosition} - ${pts} pt${pts === 1 ? "" : "s"}`;
}

function getRunPoints(teamName: string, contest: string, runs: Run[]) {
    const run = runs.find((r) => r.team === teamName && r.contest === contest);
    if (!run?.points) return "";
    return `${run.time} - ${run.points} pt${run.points === 1 ? "" : "s"}`;
}

export default function Projections() {
    const { year } = useParams();
    const yearStr = year?.toString() ?? "";

    const [sortField, setSortField] = useState<SortableProjectionField>("Overall Wins");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const { projections, isLoading, isError } = useProjections({ year: yearStr });
    const {
        tournaments,
        isLoading: tournamentLoading,
        isError: tournamentError,
    } = useTournamentByNameYear("New York State Championship", yearStr);
    const tournament = tournaments?.[0] ?? null;
    const top5 = tournament?.top5;

    const {
        runs = [],
        isLoading: runsLoading,
        isError: runsError,
    } = useTournamentRuns({
        tournamentId: tournament?.id?.toString() ?? "",
        enabled: Boolean(tournament?.id),
    });

    const handleSort = (field: SortableProjectionField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
            return;
        }
        setSortField(field);
        setSortDirection(field === "team" ? "asc" : "desc");
    };

    const sortedProjections = useMemo(() => {
        return [...projections].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortDirection === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });
    }, [projections, sortField, sortDirection]);

    const headlineRankings = useMemo(() => {
        return [...projections].sort(
            (a, b) => b["Overall Wins"] - a["Overall Wins"] || a.team.localeCompare(b.team)
        );
    }, [projections]);

    const getSortIcon = (field: SortableProjectionField) => {
        if (sortField !== field) {
            return <FontAwesomeIcon icon={faSort} className="ms-1 opacity-50" />;
        }
        return sortDirection === "asc" ? (
            <FontAwesomeIcon icon={faSortUp} className="ms-1" />
        ) : (
            <FontAwesomeIcon icon={faSortDown} className="ms-1" />
        );
    };

    const loading = isLoading || tournamentLoading || (Boolean(tournament?.id) && runsLoading);
    const hasError = isError || tournamentError || runsError;

    return (
        <div className="container mb-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 my-3">
                <Link to="/Simulation/Projections" className="video-links small">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                    All years
                </Link>
                <div className="text-center flex-grow-1 fs-4">
                    <b>{yearStr} State Tournament Projections</b>
                </div>
                <div className="d-none d-md-block" style={{ width: "5.5rem" }} />
            </div>

            <div className="w-100 bg-white rounded shadow-sm">
                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-2 text-muted">Loading projections data...</div>
                    </div>
                ) : hasError ? (
                    <div className="text-center text-muted p-5">
                        An error occurred. Please try again.
                    </div>
                ) : (
                    <div className="p-3 p-md-4">
                        <HeadlineBoard rankings={headlineRankings} top5={top5} />

                        <div className="proj-legend text-muted small my-3">
                            Each percentage is a team&apos;s share of outcomes across{" "}
                            {SIMULATION_RUNS} simulated tournaments — how often they would
                            have won the day, or landed in the top five. Reminder: it&apos;s a
                            &quot;what if,&quot; not a verdict. Actual outcomes are included.
                        </div>


                        <div className="proj-matrix-heading mt-4 mb-2">Full projections</div>

                        <div className="table-responsive proj-table-wrap">
                            <table className="table table-sm w-100 other-tables proj-table mb-0">
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            rowSpan={2}
                                            className="bg-white px-2 pointer fixed-col align-middle proj-team-header"
                                            onClick={() => handleSort("team")}
                                        >
                                            <span className="d-flex align-items-center">
                                                Team {getSortIcon("team")}
                                            </span>
                                        </th>
                                        {CONTEST_GROUPS.map((group) => (
                                            <th
                                                key={group.label}
                                                scope="col"
                                                colSpan={3}
                                                className="text-center proj-group-header"
                                            >
                                                {group.label}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {CONTEST_GROUPS.map((group) => (
                                            <React.Fragment key={`${group.label}-subs`}>
                                                <th
                                                    scope="col"
                                                    className="text-center pointer proj-sub-header"
                                                    onClick={() =>
                                                        group.winsKey && handleSort(group.winsKey)
                                                    }
                                                >
                                                    <span className="d-inline-flex align-items-center justify-content-center">
                                                        Win%
                                                        {group.winsKey
                                                            ? getSortIcon(group.winsKey)
                                                            : null}
                                                    </span>
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="text-center pointer proj-sub-header"
                                                    onClick={() =>
                                                        group.top5Key && handleSort(group.top5Key)
                                                    }
                                                >
                                                    <span className="d-inline-flex align-items-center justify-content-center">
                                                        Top5%
                                                        {group.top5Key
                                                            ? getSortIcon(group.top5Key)
                                                            : null}
                                                    </span>
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="text-center proj-sub-header"
                                                >
                                                    {group.contestName ? "Actual" : "Finish"}
                                                </th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedProjections.map((projection, index) => (
                                        <tr key={`projection-${projection._id}-${index}`}>
                                            <th
                                                scope="row"
                                                className="px-2 fixed-col bg-white text-nowrap"
                                            >
                                                {projection.team}
                                            </th>
                                            {CONTEST_GROUPS.map((group) => {
                                                const wins = group.winsKey
                                                    ? (projection[group.winsKey] as number)
                                                    : 0;
                                                const top5Count = group.top5Key
                                                    ? (projection[group.top5Key] as number)
                                                    : 0;
                                                const actual = group.contestName
                                                    ? getRunPoints(
                                                          projection.team,
                                                          group.contestName,
                                                          runs
                                                      )
                                                    : getFinishAndPoints(projection.team, top5);

                                                return (
                                                    <React.Fragment key={`${projection._id}-${group.label}`}>
                                                        <td className="text-center proj-pct">
                                                            {formatPercentage(wins)}
                                                        </td>
                                                        <td className="text-center proj-pct">
                                                            {formatPercentage(top5Count)}
                                                        </td>
                                                        <td
                                                            className={`text-center text-nowrap px-2 `}
                                                        >
                                                            {actual}
                                                        </td>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface HeadlineBoardProps {
    rankings: Projection[];
    top5: Top5Entry[] | undefined;
}

function HeadlineBoard({ rankings, top5 }: HeadlineBoardProps) {
    if (!rankings.length) return null;

    return (
        <div className="proj-headline">
            <div className="proj-headline-title">Favorites vs finish</div>
            <div className="proj-headline-list">
                {rankings.map((projection, index) => {
                    const finish = getFinishAndPoints(projection.team, top5);
                    return (
                        <div
                            key={projection._id}
                            className="proj-headline-row"
                        >
                            <span className="proj-headline-rank">{index + 1}</span>
                            <span className="proj-headline-team">{projection.team}</span>
                            <span className="proj-headline-stat">
                                <span className="proj-headline-stat-label">Win</span>
                                <span>{formatPercentage(projection["Overall Wins"])}</span>
                            </span>
                            <span className="proj-headline-stat">
                                <span className="proj-headline-stat-label">Top5</span>
                                <span>{formatPercentage(projection["Overall Top5"])}</span>
                            </span>
                            <span className="proj-headline-finish">
                                {finish || "—"}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
