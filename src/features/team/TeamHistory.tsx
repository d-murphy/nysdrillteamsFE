import React, { useState } from "react";
import { Run, TeamTournHistory } from "../../types/types";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    Cell,
    Scatter,
    ScatterChart,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
    ZAxis,
} from "recharts";
import { Form, Placeholder } from "react-bootstrap";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import dateUtil from "../../utils/dateUtils";
import useWindowDimensions from "../../utils/windowDimensions";
import { contestArr } from "../../features/admin/adminTournamentsComps/ContestOptions";
import { TimeCellContents } from "../../features/tournament/Scorecard";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

declare var SERVICE_URL: string;

type opacityControl =
    | "appearance"
    | "points"
    | "top5"
    | "wins"
    | "stateRecords"
    | "video";

export default function TeamHistory() {
    let params = useParams();
    const teamName = params.teamName;
    const [opacityControl, setOpacityControl] =
        useState<opacityControl>("appearance");

    const { data: teamHistory = [], isLoading: loading } = useQuery<
        TeamTournHistory[]
    >({
        queryKey: ["teamHistory", teamName],
        queryFn: () =>
            fetch(
                `${SERVICE_URL}/histories/getHistory?teamname=${encodeURIComponent(
                    teamName
                )}`
            )
                .then((res) => res.json())
                .then((data) => data.histories),
    });

    const { data: teamRecords = [], isLoading: trLoading } = useQuery<
        { _id: string; matched_doc: Run }[]
    >({
        queryKey: ["teamRecords", teamName],
        queryFn: () =>
            fetch(
                `${SERVICE_URL}/runs/getTeamRecords?team=${encodeURIComponent(
                    teamName
                )}`
            ).then((res) => res.json()),
    });

    return (
        <div className="container mb-3">
            <div className="mt-3 mb-1">
                <Link
                    to="/TeamHistory"
                    className="video-links small text-decoration-none"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="me-1" />
                    All teams
                </Link>
            </div>
            <div className="text-center w-100 fs-4 mb-1">
                <b>{teamName}</b>
            </div>
            <div className="text-center text-muted small mb-3">
                Tournament history
            </div>

            <div className="team-history-panel bg-white rounded shadow-sm p-3 p-md-4 mb-3">
                <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
                    <div>
                        <div className="team-history-section-label mb-1">
                            Tournament timeline
                        </div>
                        <div className="text-muted small">
                            Highlight markers by category
                        </div>
                    </div>
                    <Form.Select
                        aria-label="Highlight by"
                        className="team-history-highlight-select"
                        value={opacityControl}
                        onChange={(e) =>
                            setOpacityControl(e.target.value as opacityControl)
                        }
                    >
                        <option value="appearance">Appearances</option>
                        <option value="points">Points</option>
                        <option value="top5">Top 5 Finishes</option>
                        <option value="wins">Wins</option>
                        <option value="stateRecords">State Records</option>
                        <option value="video">Video Available</option>
                    </Form.Select>
                </div>
                <div className="team-history-chart-wrap overflow-auto">
                    {loading ? (
                        <div className="w-100 some-height d-flex align-items-center justify-content-center text-muted small">
                            Loading timeline…
                        </div>
                    ) : !teamHistory.length ? (
                        <div className="py-5 text-center text-muted small">
                            No tournament history found for this team.
                        </div>
                    ) : (
                        <Chart
                            teamHistory={teamHistory}
                            opacityControl={opacityControl}
                        />
                    )}
                </div>
            </div>

            <div className="team-history-panel bg-white rounded shadow-sm p-3 p-md-4 mb-3">
                {loading ? (
                    <SummaryInfoLoading />
                ) : (
                    <SummaryInfo teamHistory={teamHistory} />
                )}
            </div>

            {!trLoading && teamRecords.length > 0 && (
                <div className="team-history-panel bg-white rounded shadow-sm p-3 p-md-4 mb-3">
                    <TeamRecords teamRecords={teamRecords} />
                </div>
            )}
            {trLoading && (
                <div className="team-history-panel bg-white rounded shadow-sm p-3 p-md-4 mb-3">
                    <SummaryInfoLoading />
                </div>
            )}
        </div>
    );
}

interface TeamRecordsProps {
    teamRecords: { _id: string; matched_doc: Run }[];
}

function TeamRecords({ teamRecords }: TeamRecordsProps) {
    const runs = teamRecords
        .map((el) => el.matched_doc)
        .sort((a: Run, b: Run) =>
            contestSort(a.contest) < contestSort(b.contest) ? -1 : 1
        );
    const navigate = useNavigate();

    return (
        <>
            <div className="team-history-section-label mb-3">Team records</div>
            <div className="table-responsive">
                <table className="table table-sm w-100 other-tables mb-0">
                    <thead>
                        <tr>
                            <th scope="col" className="bg-white">
                                Tournament
                            </th>
                            <th scope="col" className="text-start">
                                Contest
                            </th>
                            <th scope="col" className="text-end">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {runs.map((el) => {
                            if (!el.contest || !el.time) return null;

                            const tournDisplay =
                                el.tournament && el.track
                                    ? `${el.tournament} at ${el.track}`
                                    : el.tournament
                                      ? el.tournament
                                      : el.track
                                        ? el.track
                                        : "";
                            const dateDisplay = dateUtil.getMMDDYYYY(el.date);

                            return (
                                <tr key={`teamrecord-${el._id}`}>
                                    <td
                                        onClick={() =>
                                            navigate(`/Tournament/${el.tournamentId}`)
                                        }
                                        className="pointer"
                                    >
                                        {dateDisplay && tournDisplay
                                            ? `${dateDisplay} - ${tournDisplay}`
                                            : dateDisplay
                                              ? dateDisplay
                                              : tournDisplay
                                                ? tournDisplay
                                                : ""}
                                    </td>
                                    <td className="text-start">{el.contest}</td>
                                    <td className="text-end">
                                        <TimeCellContents run={el} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function contestSort(contest: string) {
    const sortNum = contestArr.findIndex((el) => el === contest);
    return sortNum === -1 ? 99 : sortNum;
}

interface SummaryInfoProps {
    teamHistory: TeamTournHistory[];
}

function SummaryInfo({ teamHistory }: SummaryInfoProps) {
    let tournamentCount = 0;
    let pointCount = 0;
    let stateRecordCount = 0;
    let videoCount = 0;
    let runCount = 0;
    let top5s = 0;
    let wins = 0;

    teamHistory.forEach((el) => {
        tournamentCount++;
        pointCount += el.points || 0;
        stateRecordCount += el.stateRecordCount || 0;
        videoCount += el.videoCount || 0;
        runCount += el.runCount || 0;
        top5s += el.finishingPosition ? 1 : 0;
        wins += el.finishingPosition === "1st Place" ? 1 : 0;
    });

    const ptsAvg =
        pointCount && runCount
            ? Math.round((pointCount / runCount) * 100) / 100
            : 0;
    const winPct =
        wins > 0
            ? Math.round((wins / tournamentCount) * 1000) / 10
            : 0;
    const top5Pct =
        top5s > 0
            ? Math.round((top5s / tournamentCount) * 1000) / 10
            : 0;

    const kpis: { label: string; value: string; sub?: string }[] = [
        { label: "Tournaments", value: tournamentCount.toLocaleString() },
        { label: "Runs", value: runCount.toLocaleString() },
    ];

    if (wins > 0) {
        kpis.push({
            label: "Wins",
            value: wins.toLocaleString(),
            sub: `${winPct}% of tournaments`,
        });
    }
    if (top5s > 0) {
        kpis.push({
            label: "Top 5",
            value: top5s.toLocaleString(),
            sub: `${top5Pct}% of tournaments`,
        });
    }
    if (pointCount > 0) {
        kpis.push({
            label: "Total points",
            value: (Math.round(pointCount * 100) / 100).toLocaleString(),
            sub: ptsAvg > 0.25 ? `${ptsAvg} avg / run` : undefined,
        });
    }
    if (stateRecordCount > 0) {
        kpis.push({
            label: "State records",
            value: stateRecordCount.toLocaleString(),
        });
    }
    if (videoCount > 0) {
        kpis.push({
            label: "Video links",
            value: videoCount.toLocaleString(),
        });
    }

    return (
        <>
            <div className="team-history-section-label mb-3">Summary</div>
            {!teamHistory.length ? (
                <div className="text-muted small">No summary data available.</div>
            ) : (
                <div className="team-history-kpis">
                    {kpis.map((kpi) => (
                        <div key={kpi.label} className="team-history-kpi">
                            <div className="team-history-kpi-label">{kpi.label}</div>
                            <div className="team-history-kpi-value">{kpi.value}</div>
                            {kpi.sub ? (
                                <div className="team-history-kpi-sub">{kpi.sub}</div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

function SummaryInfoLoading() {
    return (
        <div className="minheight-180">
            <div className="row mt-2">
                <Placeholder animation="glow" className="p-0 text-center">
                    <Placeholder xs={3} className="rounded" size="lg" bg="secondary" />
                </Placeholder>
            </div>
            <div className="row mt-5">
                <Placeholder animation="glow" className="p-0 text-center">
                    <Placeholder xs={10} className="rounded" size="xs" bg="secondary" />
                </Placeholder>
            </div>
            <div className="row">
                <Placeholder animation="glow" className="p-0 text-center">
                    <Placeholder xs={10} className="rounded" size="xs" bg="secondary" />
                </Placeholder>
            </div>
            <div className="row">
                <Placeholder animation="glow" className="p-0 text-center">
                    <Placeholder xs={10} className="rounded" size="xs" bg="secondary" />
                </Placeholder>
            </div>
        </div>
    );
}

interface ChartProps {
    teamHistory: TeamTournHistory[];
    opacityControl: opacityControl;
}

function Chart({ teamHistory, opacityControl }: ChartProps) {
    const minYear = teamHistory.reduce((acc, el) => {
        const newYear = new Date(el.date).getFullYear();
        if (newYear < acc) {
            acc = newYear;
        }
        return acc;
    }, 1947);

    const yearStart = minYear;
    const currentYear = new Date().getFullYear();
    const yearsCovered = currentYear - yearStart;
    const tickCount = Math.round(yearsCovered / 4);
    const yearCounter: Record<number, number> = {};

    const navigate = useNavigate();
    const { width } = useWindowDimensions();
    const smallScreen = width < 750;

    const positioned = teamHistory
        .sort((a: TeamTournHistory, b: TeamTournHistory) =>
            new Date(a.date).getTime() < new Date(b.date).getTime() ? -1 : 1
        )
        .map((el) => {
            const year = new Date(el.date).getFullYear();
            if (!yearCounter[year]) {
                yearCounter[year] = 1;
            } else {
                yearCounter[year]++;
            }
            const yearPos = yearCounter[year];

            return {
                ...el,
                xPos: year,
                yPos: yearPos,
                pointsOpacity: calcOpacity(el, opacityControl),
            };
        });

    const maxY = Math.max(...Object.values(yearCounter), 5);
    const topPad = 20;
    const botPad = 20;
    const bonusPad = 30;
    const chartHeight = topPad + botPad + maxY * 27 + bonusPad;

    return (
        <ScatterChart
            width={yearsCovered * 27 + 20}
            height={chartHeight}
            margin={{
                top: 20,
                right: 30,
                bottom: 20,
                left: 30,
            }}
        >
            <XAxis
                type="number"
                dataKey="xPos"
                name="Year"
                domain={[yearStart, currentYear]}
                tickCount={tickCount}
            />
            <YAxis
                type="number"
                dataKey="yPos"
                name="Tournament Count"
                domain={[0, maxY]}
                hide
            />
            <ZAxis dataKey="z" type="number" range={[600, 600]} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Scatter name="Tournament" data={positioned} shape="square">
                {positioned.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill="#013369"
                        fillOpacity={entry.pointsOpacity}
                        cursor="pointer"
                        onClick={
                            !smallScreen
                                ? () => navigate(`/Tournament/${entry.id}`)
                                : () => {}
                        }
                    />
                ))}
            </Scatter>
        </ScatterChart>
    );
}

function CustomTooltip({
    active,
    payload,
}: TooltipProps<ValueType, NameType>) {
    if (active && payload && payload.length) {
        const tournInfo = payload[0].payload as TeamTournHistory;
        const dateStr = dateUtil.getMMDDYYYY(tournInfo.date);
        const finishAndPts =
            tournInfo.finishingPosition && tournInfo.points
                ? `${tournInfo.finishingPosition} with ${tournInfo.points} point${
                      tournInfo.points > 1 ? "s" : ""
                  }`
                : tournInfo.finishingPosition
                  ? `${tournInfo.finishingPosition}`
                  : tournInfo.points
                    ? `${tournInfo.points} point${tournInfo.points > 1 ? "s" : ""}`
                    : "";
        const runCount = tournInfo.runCount
            ? `${tournInfo.runCount} run${tournInfo.runCount > 1 ? "s" : ""}`
            : "";

        return (
            <div className="custom-tooltip">
                <div className="p-2">
                    <b>{dateStr}</b>
                    <div className="mb-2">
                        {tournInfo.name && tournInfo.track
                            ? `${tournInfo.name} at ${tournInfo.track}`
                            : tournInfo.name
                              ? tournInfo.name
                              : tournInfo.track
                                ? `At ${tournInfo.track}`
                                : ""}
                        {tournInfo?.runningOrderPos
                            ? ` (#${
                                  tournInfo.runningOrderPos > 100
                                      ? tournInfo.runningOrderPos - 100
                                      : tournInfo.runningOrderPos
                              })`
                            : ""}
                    </div>
                    <div>
                        {finishAndPts && runCount
                            ? `${finishAndPts} - ${runCount}`
                            : finishAndPts
                              ? finishAndPts
                              : runCount
                                ? runCount
                                : ""}
                    </div>
                    <div>
                        {tournInfo?.stateRecordCount > 0
                            ? `${tournInfo.stateRecordCount} state record${
                                  tournInfo.stateRecordCount > 1 ? "s" : ""
                              }!`
                            : ""}
                    </div>
                    <div className="mt-2">
                        {tournInfo?.videoCount > 0
                            ? `${tournInfo.videoCount} video${
                                  tournInfo.videoCount > 1 ? "s" : ""
                              } available.`
                            : ""}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

function calcOpacity(item: TeamTournHistory, opacCtrl: opacityControl) {
    if (opacCtrl === "appearance") return 1;
    if (opacCtrl === "points") {
        return Math.max(
            0.1,
            item?.points && item?.runCount ? item.points / 5 / item.runCount : 0.1
        );
    }
    if (opacCtrl === "top5") {
        return item?.finishingPosition ? 1 : 0.1;
    }
    if (opacCtrl === "wins") {
        return item?.finishingPosition === "1st Place" ? 1 : 0.1;
    }
    if (opacCtrl === "stateRecords") {
        return item?.stateRecordCount ? 1 : 0.1;
    }
    if (opacCtrl === "video") {
        return item?.videoCount ? 1 : 0.1;
    }
    return 1;
}
