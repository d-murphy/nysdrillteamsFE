import * as React from "react";
import { FantasyGame, FantasyDraftPick, TotalPointsWFinish, SimulationRun } from "../../types/types";
import { niceTime } from "../../utils/timeUtils";
import { assignPoints } from "../../utils/fantasy/assignFinish";
import useTeamNames from "../../hooks/fantasy/useTeamNames";
import { Placeholder } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faUser } from "@fortawesome/free-solid-svg-icons";
import generateAutoDraftMap from "../../utils/fantasy/autoNames";

interface FantasyScorecardProps {
    game: FantasyGame;
    draftPicks: FantasyDraftPick[];
    simulationRuns?: SimulationRun[];
    totalPointsWFinish?: TotalPointsWFinish[];
    animate?: boolean;
}

const contests = [
    "Three Man Ladder",
    "B Ladder",
    "C Ladder",
    "C Hose",
    "B Hose",
    "Efficiency",
    "Motor Pump",
    "Buckets",
];

const BLANK_STR = "--";
const POINTS_TO_ASSIGN = [5, 4, 3, 2, 1];

interface RunWithPoints {
    key: string;
    finalRun: number;
    points?: number;
}
export default function FantasyScorecard({ game, draftPicks, simulationRuns, totalPointsWFinish, animate = false }: FantasyScorecardProps) {
    const [showAllUsers, setShowAllUsers] = React.useState(false);
    const users = game.users;

    // Create lookup maps
    const draftPicksLU: { [key: string]: FantasyDraftPick } = {};
    draftPicks?.forEach(pick => {
        const key = `${pick.user}|${pick.contestSummaryKey}`;
        draftPicksLU[key] = pick;
    });

    // Process simulation runs by contest and assign points
    const contestPointsLU: { [contestKey: string]: number } = {};
    
    contests.forEach(contest => {
        // Filter runs for this contest, excluding OT and NT values
        const contestRuns: RunWithPoints[] = !simulationRuns ? [] : simulationRuns
            ?.filter(run => {
                const finalRunStr = run.finalRun.toString();
                return run.key.includes(`|${contest}|`) && 
                       finalRunStr !== 'OT' && finalRunStr !== 'NT' && !isNaN(run.finalRun);
            })
            .map(run => ({ key: run.key.split('|').slice(0, 3).join('|'), finalRun: run.finalRun }));
        
        // Assign points (ascending sort - lower time = better)
        if (contestRuns.length > 0) {
            const rankedRuns = assignPoints(contestRuns, 'finalRun', false, POINTS_TO_ASSIGN);
            rankedRuns.forEach(run => {
                contestPointsLU[run.key] = run.points || 0;
            });
        }
    });

    // Filter results based on showAllUsers toggle
    const displayedResults = showAllUsers 
        ? totalPointsWFinish 
        : totalPointsWFinish?.filter(result => result.finish) ?? [];

    const headers = generateHeaders();
    const tableRows = generateRows(users, draftPicksLU, contestPointsLU, simulationRuns ?? []);

    return (
        <div>
            <div className="scorecard-table-wrapper">            
                <table className="my-4 table-results">
                    <thead className="">
                        <tr>
                            {headers}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
            <ResultsList 
                results={displayedResults}
                showAllUsers={showAllUsers}
                onToggle={() => setShowAllUsers(!showAllUsers)}
            />
        </div>
    );
}

function generateHeaders() {
    let buffer: JSX.Element[] = [];

    contests.forEach((contest, ind) => {
        if (ind === 0) {
            buffer.push(
                <th key="user-header" scope="col" className="scorecard-cell-md fixed-col p-2">
                    User
                </th>
            );
            buffer.push(
                <th key={`contest-${ind}`} scope="col" className="scorecard-cell-lg text-center p-2">
                    {contest}
                </th>
            );
            // buffer.push(
            //     <th key={`points-${ind}`} scope="col" className="scorecard-cell-sm text-center p-2">
            //         Points
            //     </th>
            // );
        } else {
            buffer.push(
                <th key={`contest-${ind}`} scope="col" className="scorecard-cell-lg text-center p-2">
                    {contest}
                </th>
            );
            // buffer.push(
            //     <th key={`points-${ind}`} scope="col" className="scorecard-cell-sm text-center p-2">
            //         Points
            //     </th>
            // );
            // buffer.push(
            //     <th key={`total-${ind}`} scope="col" className="scorecard-cell-sm text-center p-2">
            //         Total
            //     </th>
            // );
        }
    });
    return buffer;
}

function generateRows(
    users: string[],
    draftPicksLU: { [key: string]: FantasyDraftPick },
    contestPointsLU: { [key: string]: number },
    simulationRuns?: SimulationRun[]
) {
    let buffer: JSX.Element[] = [];
    const { data: teamNamesData, isLoading: isLoadingTeamNames, error: errorTeamNames } = useTeamNames(users);
    const autoDraftMap = generateAutoDraftMap();


    // Create simulation runs lookup
    const simulationRunsLU: { [key: string]: number } = {};
    simulationRuns.forEach(run => {
        const newKey = run.key.split('|').slice(0, 3).join('|');
        simulationRunsLU[newKey] = run.finalRun;
    });

    // Track total points per user per contest
    const totalPointsLU: { [userContest: string]: number } = {};

    users.forEach((user, userIndex) => {
        let rowBuffer: JSX.Element[] = [];
        let runningTotal = 0;
        
        contests.forEach((contest, contestIndex) => {
            const draftPick = Object.values(draftPicksLU).find(
                pick => pick.user === user && pick.contestSummaryKey.endsWith(`|${contest}`)
            );

            if (contestIndex === 0) {
                // User column
                const teamNameInfo = teamNamesData?.find((team) => team.email === user); 
                const isAuto = user.startsWith('autodraft');
                const displayName = isAuto ? autoDraftMap.get(user) : 
                    teamNameInfo ? `${teamNameInfo.town} ${teamNameInfo.name}` : 'Unable to load team name'; 

                rowBuffer.push(
                    <th key={`user-${userIndex}`} scope="col" className="scorecard-cell-md fixed-col p-2">
                        <div className="d-flex align-items-center">
                            {isAuto ? <FontAwesomeIcon icon={faRobot} className="text-secondary" /> : <FontAwesomeIcon icon={faUser} className="text-secondary" />}
                            <div className="ms-2">
                                {isLoadingTeamNames ? 
                                    <Placeholder animation="glow" className="p-0 text-center">
                                        <Placeholder xs={10} className="rounded" size="lg" bg="secondary"/>
                                    </Placeholder> : 
                                    displayName
                                }
                            </div>
                        </div>
                    </th>
                );
            }

            // Contest cell
            if (draftPick) {
                const simKey = `${draftPick.contestSummaryKey}`;
                const simulationRun = simulationRunsLU[simKey];
                const points = contestPointsLU[simKey] || 0;
                runningTotal += points;
                
                rowBuffer.push(
                    <TableCell
                        key={`cell-${userIndex}-${contestIndex}`}
                        size="lg"
                        draftPick={draftPick}
                        simulationRun={simulationRun}
                        points={points}
                        runningTotal={runningTotal}
                    />
                );
                // rowBuffer.push(
                //     <td key={`points-${userIndex}-${contestIndex}`} scope="col" className="scorecard-cell-sm text-center p-2">
                //         {points > 0 ? (points % 1 === 0 ? points.toString() : points.toFixed(1)) : BLANK_STR}
                //     </td>
                // );
                
                // if (contestIndex > 0) {
                //     rowBuffer.push(
                //         <td key={`total-${userIndex}-${contestIndex}`} scope="col" className="scorecard-cell-sm text-center p-2">
                //             {runningTotal > 0 ? (runningTotal % 1 === 0 ? runningTotal.toString() : runningTotal.toFixed(1)) : BLANK_STR}
                //         </td>
                //     );
                // }
            } else {
                // rowBuffer.push(
                //     <td key={`cell-${userIndex}-${contestIndex}`} scope="col" className="scorecard-cell-lg text-center p-2">
                //         {BLANK_STR}
                //     </td>
                // );
                // rowBuffer.push(
                //     <td key={`points-${userIndex}-${contestIndex}`} scope="col" className="scorecard-cell-sm text-center p-2">
                //         {BLANK_STR}
                //     </td>
                // );
                // if (contestIndex > 0) {
                //     rowBuffer.push(
                //         <td key={`total-${userIndex}-${contestIndex}`} scope="col" className="scorecard-cell-sm text-center p-2">
                //             {BLANK_STR}
                //         </td>
                //     );
                // }
            }
        });
        
        buffer.push(<tr key={`row-${userIndex}`}>{rowBuffer}</tr>);
    });

    return buffer;
}

interface TableCellProps {
    size: 'md' | 'sm' | 'lg';
    draftPick: FantasyDraftPick;
    simulationRun?: number;
    points: number; 
    runningTotal: number;
}

function TableCell({ size, draftPick, simulationRun, points, runningTotal }: TableCellProps) {
    const scCss = `scorecard-cell-${size}`;

    // Parse the contestSummaryKey to get team and year
    const [team, year, contest] = draftPick.contestSummaryKey.split('|');
    const pointsDisp = points > 0 ? (points % 1 === 0 ? points.toString() : points.toFixed(1)) : BLANK_STR
    const rtDisp = runningTotal > 0 ? (runningTotal % 1 === 0 ? runningTotal.toString() : runningTotal.toFixed(1)) : BLANK_STR

    
    return (
        <td scope="col" className={`${scCss} text-center p-2`}>
            <div className="d-flex flex-column align-items-start">
                <div className="d-flex justify-content-between w-100">
                    {simulationRun ? (
                        <div className="font-medium">{niceTime(simulationRun.toString())}</div>
                    ) : (
                        <div className="text-muted">{BLANK_STR}</div>
                    )}
                    <div className="font-small" >{pointsDisp} / {rtDisp}</div>
                </div>
                <div className="font-small text-muted">{year} {team}</div>
            </div>
        </td>
    );
}

interface ResultsListProps {
    results: TotalPointsWFinish[];
    showAllUsers: boolean;
    onToggle: () => void;
}

function ResultsList({ results, showAllUsers, onToggle }: ResultsListProps) {

    const users = results.map((result) => result.user);
    const { data: teamNamesData, isLoading: isLoadingTeamNames, error: errorTeamNames } = useTeamNames(users || []);
    const autoDraftMap = generateAutoDraftMap();


    return (
        <div className="my-4 p-3 bg-light rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Final Results</h5>
                <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={onToggle}
                >
                    {showAllUsers ? 'Show Placed Only' : 'Show All Users'}
                </button>
            </div>
            
            <div className="d-flex flex-column gap-2">
                {results.map((result, index) => {
                    const isAuto = result.user.startsWith('autodraft');
                    const teamNameInfo = teamNamesData?.find((team) => team.email === result.user); 
                    const displayName = isAuto ? autoDraftMap.get(result.user) : 
                        teamNameInfo ? `${teamNameInfo.town} ${teamNameInfo.name}` : 'Unable to load team name'; 
                    const points = result.points % 1 === 0 
                        ? result.points.toString() 
                        : result.points.toFixed(1);
                    
                    return (
                        <div 
                            key={`result-${index}`}
                            className="d-flex justify-content-between align-items-center p-2 bg-white rounded border"
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="fw-bold" style={{ minWidth: '40px' }}>
                                    {result.finish || '--'}
                                </div>
                                <div className="d-flex align-items-center">
                                    {
                                        isAuto ? <FontAwesomeIcon icon={faRobot} className="text-secondary" /> : <FontAwesomeIcon icon={faUser} className="text-secondary" />
                                    }
                                    <div className="ms-2">
                                        {isLoadingTeamNames ? 
                                            <Placeholder animation="glow" className="p-0 text-center">
                                                <Placeholder xs={10} className="rounded" size="lg" bg="secondary"/>
                                            </Placeholder> : 
                                            displayName
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="fw-bold ">
                                {points} pts
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

