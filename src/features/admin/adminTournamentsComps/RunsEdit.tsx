import React, { useState } from 'react';
import { Tournament, Team, Run } from "../../../types/types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";
import RunsEditForm from "./RunsEditForm";

interface EditRunsProps {
    isAdmin: boolean,
    tournInReview: Tournament,
    teams: Team[],
    runsForTourn: Run[],
    runsEditContest: string,
    setRunsEditContest: React.Dispatch<React.SetStateAction<string>>,
    isLoading: boolean
}

export default function RunsEdit(props: EditRunsProps) {
    const { isAdmin, tournInReview, teams, runsForTourn, runsEditContest, setRunsEditContest, isLoading } = props;

    const emptyRun: Run = {
        team: '',
        hometown: '',
        nickname: '',
        contest: '',
        year: null,
        tournament: '',
        tournamentId: '',
        track: '',
        time: '',
        timeNum: null,
        points: null,
        rank: '',
        runningPosition: null,
        date: null,
        urls: [],
        sanctioned: true,
        nassauPoints: false,
        suffolkPoints: false,
        westernPoints: false,
        northernPoints: false,
        suffolkOfPoints: false,
        nassauOfPoints: false,
        liOfPoints: false,
        juniorPoints: false,
        notes: '',
        stateRecord: false,
        currentStateRecord: false,
        totalPointsOverride: undefined
    };

    const [runInReview, setRunInReview] = useState<Run | null>(null);
    const [editOrInsertRun, setEditOrInsertRun] = useState<'edit' | 'insert'>("insert");
    const [reqResult, setReqResult] = useState<{ error: boolean, message: string } | null>(null);
    const [showingDeleteWarning, setShowingDeleteWarning] = useState(false);

    const runsForTournLU: { [index: string]: Run } = {};
    runsForTourn.forEach(el => {
        runsForTournLU[`${el.contest}-${el.team}`] = el;
    });

    let buttonsToDisplay: { team: string, runningPosition?: string, hasRun: Run }[] = [];
    const runsAlreadyWithButton: { [index: string]: boolean } = {};
    if (tournInReview.runningOrder) {
        Object.keys(tournInReview.runningOrder).forEach(runningPosition => {
            const team = tournInReview.runningOrder[parseInt(runningPosition)];
            if (team) {
                buttonsToDisplay.push({
                    team,
                    runningPosition,
                    hasRun: runsForTournLU[`${runsEditContest}-${team}`]
                });
                runsAlreadyWithButton[team] = true;
            }
        });
    }
    runsForTourn.filter(run => run.contest === runsEditContest).forEach(run => {
        if (!runsAlreadyWithButton[run.team]) {
            buttonsToDisplay.push({ team: run.team, runningPosition: null, hasRun: run });
        }
    });

    function loadExistingRun(run: Run) {
        setEditOrInsertRun('edit');
        setReqResult(null);
        setShowingDeleteWarning(false);
        setRunInReview({ ...emptyRun, ...run });
    }

    function loadNewRun(team: string, runningPosition: string) {
        setEditOrInsertRun('insert');
        setReqResult(null);
        setShowingDeleteWarning(false);
        const teamObj = teams.find(el => el.fullName === team);
        const cfp = getCfp(tournInReview.contests, runsEditContest);
        setRunInReview({
            ...emptyRun,
            team,
            hometown: teamObj.hometown,
            nickname: teamObj.nickname,
            tournament: tournInReview.name,
            tournamentId: String(tournInReview.id),
            contest: runsEditContest,
            year: new Date(tournInReview.date).getFullYear(),
            date: tournInReview.date,
            track: tournInReview.track,
            runningPosition: parseInt(runningPosition),
            sanctioned: getSanction(tournInReview.contests, runsEditContest),
            nassauPoints: cfp && tournInReview.nassauPoints && (teamObj.circuit === 'Nassau' || teamObj.circuit === 'Old Fashioned'),
            suffolkPoints: cfp && tournInReview.suffolkPoints && teamObj.circuit === 'Suffolk',
            westernPoints: cfp && tournInReview.westernPoints && teamObj.circuit === 'Western',
            northernPoints: cfp && tournInReview.northernPoints && teamObj.circuit === 'Northern',
            suffolkOfPoints: cfp && tournInReview.suffolkOfPoints && teamObj.circuit === 'Old Fashioned',
            nassauOfPoints: cfp && tournInReview.nassauOfPoints && (teamObj.circuit === 'Old Fashioned' || teamObj.circuit === 'Nassau'),
            liOfPoints: cfp && (tournInReview.nassauOfPoints || tournInReview.suffolkOfPoints) && teamObj.circuit === 'Old Fashioned',
            juniorPoints: cfp && tournInReview.juniorPoints && teamObj.circuit === 'Juniors',
        });
    }

    function changeContest(contest: string) {
        setRunsEditContest(contest);
        setRunInReview(null);
        setReqResult(null);
        setShowingDeleteWarning(false);
    }

    function getSanction(contestArr: { name: string, cfp: boolean, sanction: boolean }[], contest: string): boolean {
        const contestObj = contestArr.find(el => el.name === contest);
        return contestObj ? contestObj.sanction : false;
    }

    function getCfp(contestArr: { name: string, cfp: boolean, sanction: boolean }[], contest: string): boolean {
        const contestObj = contestArr.find(el => el.name === contest);
        return contestObj ? contestObj.cfp : false;
    }

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center py-5">Loading...</div>;
    }

    return (
        <div>
            <ul className="nav nav-pills flex-wrap gap-1 mb-3">
                {tournInReview.contests.map(contest => (
                    <li key={contest.name} className="nav-item">
                        <button
                            className={`nav-link py-1 px-2${runsEditContest === contest.name ? ' active' : ''}`}
                            style={{ fontSize: '0.85rem' }}
                            onClick={() => changeContest(contest.name)}
                        >{contest.name}</button>
                    </li>
                ))}
            </ul>

            {runsEditContest === "" ? (
                <div className="text-muted text-center py-4 small fst-italic">Select a contest above to manage runs.</div>
            ) : (
                <div className="row g-3">
                    <div className="col-md-4">
                        <div className="border rounded" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <table className="table table-sm table-hover mb-0">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th style={{ width: '36px' }}>#</th>
                                        <th>Team</th>
                                        <th style={{ width: '40px' }} className="text-center">Run</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buttonsToDisplay.map((el, i) => (
                                        <tr key={i} className={runInReview?.team === el.team ? 'table-active' : ''}>
                                            <td className="text-muted small align-middle">{el.runningPosition || '—'}</td>
                                            <td className="small align-middle">{el.team}</td>
                                            <td className="text-center align-middle">
                                                {el.hasRun
                                                    ? <FontAwesomeIcon
                                                        className="crud-links"
                                                        icon={faPenToSquare}
                                                        onClick={() => loadExistingRun(el.hasRun)}
                                                        title="Edit run"
                                                    />
                                                    : <FontAwesomeIcon
                                                        className="crud-links text-success"
                                                        icon={faPlus}
                                                        onClick={() => loadNewRun(el.team, el.runningPosition)}
                                                        title="Add run"
                                                    />
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-muted small text-center mt-2 fst-italic">
                            Teams not listed must be added to the running order first.
                        </div>
                    </div>
                    <div className="col-md-8">
                        <RunsEditForm
                            isAdmin={isAdmin}
                            tournInReview={tournInReview}
                            teams={teams}
                            runsEditContest={runsEditContest}
                            runInReview={runInReview}
                            setRunInReview={setRunInReview}
                            editOrInsertRun={editOrInsertRun}
                            reqResult={reqResult}
                            setReqResult={setReqResult}
                            showingDeleteWarning={showingDeleteWarning}
                            setShowingDeleteWarning={setShowingDeleteWarning}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
