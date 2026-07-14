import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";
import useWindowDimensions from "../../utils/windowDimensions";
import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

interface TotalPointsProp {
    year: number;
    headingAligned: boolean;
}

type Regions = "Nassau" | "Northern" | "Suffolk" | "Western" | "Junior";

type TpRow = {
    team: string;
    points: number;
    [contest: string]: string | number;
};

export const JR_CONTEST_STR =
    "Jr Division - Junior Ladder,Jr Division - Intermediate Ladder,Jr Division - Individual Ladder,Jr Division - Cart Ladder," +
    "Jr Division - Junior Cart Hose,Jr Division - Cart Hose,Jr Division - Cart Replacement,Jr Division - Junior Eff. Replacement,Jr Division - Wye," +
    "Jr Division - Efficiency,Jr Division - Junior Wye";

const REGIONS: Regions[] = ["Nassau", "Northern", "Suffolk", "Western", "Junior"];

const srContestArr = [
    "Three Man Ladder",
    "B Ladder",
    "C Ladder",
    "C Hose",
    "B Hose",
    "Efficiency",
    "Motor Pump",
    "Buckets",
];

const jrContestArr = JR_CONTEST_STR.split(",");

type RawTpEntry = { _id: { contest: string; team: string }; points: number };

function buildTpUrl(year: number, region: Regions): string {
    const base = `${SERVICE_URL}/runs/getTotalPoints?year=${year}&byContest=true&totalPointsFieldName=`;
    const jrUrl = `${SERVICE_URL}/runs/getTotalPoints?year=${year}&byContest=true&totalPointsFieldName=Junior&contests=${JR_CONTEST_STR}`;
    return region !== "Junior" ? `${base}${region}` : jrUrl;
}

function transformTpData(data: RawTpEntry[]): TpRow[] {
    const teamData: Record<string, TpRow> = {};
    data.forEach((el) => {
        if (!teamData[el._id.team]) {
            teamData[el._id.team] = { team: el._id.team, points: 0 };
        }
        teamData[el._id.team][el._id.contest] = el.points;
    });

    return Object.values(teamData)
        .map((row) => {
            let totalPoints = 0;
            Object.entries(row).forEach(([key, value]) => {
                if (key !== "team" && typeof value === "number") totalPoints += value;
            });
            return { ...row, points: totalPoints };
        })
        .sort((a, b) => b.points - a.points || a.team.localeCompare(b.team));
}

export default function TotalPoints(props: TotalPointsProp) {
    const { year, headingAligned } = props;

    const [region, setRegion] = useState<Regions>("Nassau");
    const [chartOrTable, setChartOrTable] = useState<"chart" | "table">("chart");
    const [sortKey, setSortKey] = useState<string>("points");

    const { data: rawTpData, isFetching: isLoading, isError: errorLoading } = useQuery<RawTpEntry[]>({
        queryKey: ["totalPoints", year, region],
        queryFn: () => fetch(buildTpUrl(year, region)).then((res) => res.json()),
        enabled: Boolean(region),
    });

    const selectedRegionTpArr = useMemo(
        () => (rawTpData ? transformTpData(rawTpData) : []),
        [rawTpData]
    );

    useEffect(() => {
        setSortKey("points");
    }, [region]);

    const contestColumns = region === "Junior" ? jrContestArr : srContestArr;

    const sortedRows = useMemo(() => {
        return [...selectedRegionTpArr].sort((a, b) => {
            const aVal = typeof a[sortKey] === "number" ? (a[sortKey] as number) : 0;
            const bVal = typeof b[sortKey] === "number" ? (b[sortKey] as number) : 0;
            if (bVal !== aVal) return bVal - aVal;
            return a.team.localeCompare(b.team);
        });
    }, [selectedRegionTpArr, sortKey]);

    const selectRegion = (newRegion: Regions) => {
        if (!isLoading) setRegion(newRegion);
    };

    const sortBy = (key: string) => {
        setSortKey(key);
    };

    return (
        <div className="total-points-panel bg-white rounded shadow-sm p-3 p-md-4 mb-3">
            <div className="row g-3">
                <div className="col-12 col-md-3">
                    {headingAligned && (
                        <div className="mb-3">
                            <h4 className="mb-0">Total Points</h4>
                            <div className="text-muted small">Select a circuit</div>
                        </div>
                    )}

                    <div className="total-points-regions">
                        {REGIONS.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className={`total-points-region ${
                                    region === item ? "is-active" : ""
                                }`}
                                onClick={() => selectRegion(item)}
                                disabled={isLoading}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="total-points-view-toggle mt-3">
                        <button
                            type="button"
                            className={`total-points-view-btn ${
                                chartOrTable === "chart" ? "is-active" : ""
                            }`}
                            onClick={() => setChartOrTable("chart")}
                        >
                            Chart
                        </button>
                        <button
                            type="button"
                            className={`total-points-view-btn ${
                                chartOrTable === "table" ? "is-active" : ""
                            }`}
                            onClick={() => setChartOrTable("table")}
                        >
                            Table
                        </button>
                    </div>
                </div>

                <div className="col-12 col-md-9">
                    {errorLoading && (
                        <div className="text-center text-muted py-5">
                            Sorry, there was an error loading the total points.
                        </div>
                    )}

                    {isLoading && (
                        <div className="d-flex justify-content-center py-5">
                            <div className="spinner-border text-secondary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )}

                    {!isLoading && !errorLoading && selectedRegionTpArr.length === 0 && (
                        <div className="text-center text-muted py-5">
                            No total points reported for {region}.
                        </div>
                    )}

                    {!isLoading && !errorLoading && selectedRegionTpArr.length > 0 && (
                        <>
                            {chartOrTable === "chart" ? (
                                <div className="total-points-chart-wrap">
                                    <div style={{ width: "100%", height: 500 }}>
                                        <Chart
                                            data={selectedRegionTpArr}
                                            year={year}
                                            region={region}
                                        />
                                    </div>
                                    <div className="mt-3 small text-muted text-center">
                                        <i>
                                            Total points reflect runs saved in the database and may
                                            not match official results.
                                        </i>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-100">
                                    <div className="small text-muted mb-2">
                                        Click a contest header to rank teams by that column
                                        (highest first).
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-sm w-100 other-tables total-points-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="fixed-col bg-white">Team</th>
                                                    <th
                                                        className={`text-center pointer text-nowrap ${
                                                            sortKey === "points"
                                                                ? "is-sorted"
                                                                : ""
                                                        }`}
                                                        onClick={() => sortBy("points")}
                                                    >
                                                        Points
                                                        {sortKey === "points" && (
                                                            <FontAwesomeIcon
                                                                icon={faSortDown}
                                                                className="ms-1"
                                                            />
                                                        )}
                                                    </th>
                                                    {contestColumns.map((contest) => (
                                                        <th
                                                            key={contest}
                                                            className={`text-center pointer text-nowrap ${
                                                                sortKey === contest
                                                                    ? "is-sorted"
                                                                    : ""
                                                            }`}
                                                            onClick={() => sortBy(contest)}
                                                        >
                                                            {contest.replace("Jr Division - ", "")}
                                                            {sortKey === contest && (
                                                                <FontAwesomeIcon
                                                                    icon={faSortDown}
                                                                    className="ms-1"
                                                                />
                                                            )}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedRows.map((row) => (
                                                    <tr key={row.team}>
                                                        <th
                                                            scope="row"
                                                            className="text-nowrap fixed-col bg-white"
                                                        >
                                                            {row.team}
                                                        </th>
                                                        <td className="text-center">{row.points}</td>
                                                        {contestColumns.map((contest) => (
                                                            <td
                                                                key={`${row.team}-${contest}`}
                                                                className="text-center"
                                                            >
                                                                {row[contest] ? row[contest] : ""}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3 small text-muted text-center">
                                        <i>
                                            Total points reflect runs saved in the database and may
                                            not match official results.
                                        </i>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const CustomTooltip = ({
    active,
    payload,
}: {
    active?: boolean;
    payload?: { value: number; dataKey: string }[];
    label?: string;
}) => {
    const { width } = useWindowDimensions();
    const smallScreen = width < 750;

    if (active && payload && payload.length) {
        let totalPts = 0;
        payload.forEach((el) => {
            totalPts += el.value;
        });
        return (
            <div className="custom-tooltip">
                <div>
                    <b>Total: {totalPts}</b>
                </div>
                <br />
                {payload.map((el) => (
                    <div key={String(el.dataKey)}>
                        {el.dataKey} - {el.value}
                    </div>
                ))}
                <br />
                {!smallScreen ? (
                    <div>
                        <i>Click a bar section to view runs.</i>
                    </div>
                ) : null}
            </div>
        );
    }

    return null;
};

interface ChartProps {
    data: TpRow[];
    year: number;
    region: string;
}

function Chart({ data, year, region }: ChartProps) {
    const [barsNotDisplayed, setBarsNotDisplayed] = useState<string[]>([]);
    const { width } = useWindowDimensions();
    const smallScreen = width < 750;

    const toggleLegend = (event: { value: string }) => {
        if (barsNotDisplayed.includes(event.value.trim())) {
            setBarsNotDisplayed(barsNotDisplayed.filter((el) => el != event.value.trim()));
        } else {
            setBarsNotDisplayed([...barsNotDisplayed, event.value.trim()]);
        }
    };

    const regionPtrStr: { [index: string]: string } = {
        Nassau: "nassauPoints=true",
        Northern: "northernPoints=true",
        Suffolk: "suffolkPoints=true",
        Western: "westernPoints=true",
        Junior: "juniorPoints=true",
    };

    const handleBarClick = (barData: {
        team: string;
        tooltipPayload: { name: string }[];
    }) => {
        if (!regionPtrStr[region]) return;
        if (smallScreen) return;
        const team = barData.team;
        const contest = barData.tooltipPayload[0].name;
        const paramString = `?years=${year}&teams=${team}&contests=${contest}&${regionPtrStr[region]}`;
        window.open(`/RunSearch${paramString}`, "_blank");
    };

    return (
        <ResponsiveContainer>
            <BarChart
                layout="vertical"
                width={500}
                height={500}
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    left: 100,
                    bottom: 5,
                }}
            >
                <XAxis type="number" />
                <YAxis dataKey="team" type="category" tick={{ width: 200, fontSize: "9px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ fontSize: "10px" }}
                    onClick={toggleLegend}
                    formatter={(value) => {
                        return barsNotDisplayed.includes(value.trim()) ? (
                            <span style={{ opacity: "40%", cursor: "pointer" }}>{value.trim()}</span>
                        ) : (
                            <span style={{ cursor: "pointer" }}>{value}</span>
                        );
                    }}
                />

                {region != "Junior" ? (
                    <>
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Three Man Ladder")
                                    ? "Three Man Ladder "
                                    : "Three Man Ladder"
                            }
                            stackId="a"
                            fill="#91c5fd"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={barsNotDisplayed.includes("B Ladder") ? "B Ladder " : "B Ladder"}
                            stackId="a"
                            fill="#61acfd"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={barsNotDisplayed.includes("C Ladder") ? "C Ladder " : "C Ladder"}
                            stackId="a"
                            fill="#3093fd"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={barsNotDisplayed.includes("C Hose") ? "C Hose " : "C Hose"}
                            stackId="a"
                            fill="#0279fa"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={barsNotDisplayed.includes("B Hose") ? "B Hose " : "B Hose"}
                            stackId="a"
                            fill="#0162ca"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Efficiency") ? "Efficiency " : "Efficiency"
                            }
                            stackId="a"
                            fill="#014a99"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Motor Pump") ? "Motor Pump " : "Motor Pump"
                            }
                            stackId="a"
                            fill="#013369"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={barsNotDisplayed.includes("Buckets") ? "Buckets " : "Buckets"}
                            stackId="a"
                            fill="#001b38"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                    </>
                ) : (
                    <>
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Junior Ladder")
                                    ? "Jr Division - Junior Ladder "
                                    : "Jr Division - Junior Ladder"
                            }
                            stackId="a"
                            fill="#91c5fd"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Intermediate Ladder")
                                    ? "Jr Division - Intermediate Ladder "
                                    : "Jr Division - Intermediate Ladder"
                            }
                            stackId="a"
                            fill="#61acfd"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Individual Ladder")
                                    ? "Jr Division - Individual Ladder "
                                    : "Jr Division - Individual Ladder"
                            }
                            stackId="a"
                            fill="#3093fd"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Cart Ladder")
                                    ? "Jr Division - Cart Ladder "
                                    : "Jr Division - Cart Ladder"
                            }
                            stackId="a"
                            fill="#0279fa"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Junior Cart Hose")
                                    ? "Jr Division - Junior Cart Hose "
                                    : "Jr Division - Junior Cart Hose"
                            }
                            stackId="a"
                            fill="#0162ca"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Cart Hose")
                                    ? "Jr Division - Cart Hose "
                                    : "Jr Division - Cart Hose"
                            }
                            stackId="a"
                            fill="#014a99"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Cart Replacement")
                                    ? "Jr Division - Cart Replacement "
                                    : "Jr Division - Cart Replacement"
                            }
                            stackId="a"
                            fill="#013369"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Junior Eff. Replacement")
                                    ? "Jr Division - Junior Eff. Replacement "
                                    : "Jr Division - Junior Eff. Replacement"
                            }
                            stackId="a"
                            fill="#001b38"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Junior Wye")
                                    ? "Jr Division - Junior Wye "
                                    : "Jr Division - Junior Wye"
                            }
                            stackId="a"
                            fill="#001b38"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Wye")
                                    ? "Jr Division - Wye "
                                    : "Jr Division - Wye"
                            }
                            stackId="a"
                            fill="#000b18"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                        <Bar
                            dataKey={
                                barsNotDisplayed.includes("Jr Division - Efficiency")
                                    ? "Jr Division - Efficiency "
                                    : "Jr Division - Efficiency"
                            }
                            stackId="a"
                            fill="#000008"
                            radius={1}
                            onClick={handleBarClick}
                            style={{ cursor: "pointer" }}
                        />
                    </>
                )}
            </BarChart>
        </ResponsiveContainer>
    );
}
