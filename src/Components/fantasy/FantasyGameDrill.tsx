import { useSimTeamSummariesKey } from "../../hooks/fantasy/useSimTeamSummariesKey";
import useTeamNames from "../../hooks/fantasy/useTeamNames";
import { FantasyDraftPick, FantasyGame, SimulationRun, TotalPointsWFinish } from "../../types/types";
import React, { useEffect, useState } from "react";
import generateAutoDraftMap from "../../utils/fantasy/autoNames";
import { niceTime } from "../../utils/timeUtils";
import { SimTeamSummary } from "../../hooks/fantasy/useSimTeamSummaries";
import { faPlay, faRobot, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Placeholder } from "react-bootstrap";
import Button from "../Button";



interface FantasyGameDrillProps {
    game: FantasyGame;
    draftPicks: FantasyDraftPick[];
    runs: SimulationRun[];
    totalPointsWFinish: TotalPointsWFinish[];
    setAnimationComplete: (animationComplete: boolean) => void;
}


export default function FantasyGameDrill({game, draftPicks, runs, totalPointsWFinish, setAnimationComplete}: FantasyGameDrillProps) {
    const autoDraftMap = generateAutoDraftMap();
    const [contestInd, setContestInd] = useState(0); 
    const [started, setStarted] = useState(false);
    const [timeIndex, setTimeIndex] = useState(0); 
    const timeIndexEnd = game.users.length * 3 - 1;
    const timeIndexFinished = timeIndexEnd <= timeIndex; 

    const runToDemo = Math.floor(timeIndex / 3); 
    const scorecardRunToDemo = Math.floor((timeIndex + 1) / 3);
    const isAnimation = timeIndex % 3 === 0 || timeIndex % 3 === 1; 
    const isRunReveal = timeIndex % 3 === 2; 
    const contestToShow = contestMap[contestInd]; 
    const runKeyToTimeMap: Record<string, number> = {}; 
    runs && runs.forEach(run => {
        const keyWoSimIndex = run.key.split("|").slice(0, -1).join("|"); 
        runKeyToTimeMap[keyWoSimIndex] = run.finalRun; 
    }); 

    const pickKeys = draftPicks.map(pick => pick.contestSummaryKey); 
    const { data: simTeamSummaries, isLoading: isLoadingSimTeamSummaries, isError: isErrorSimTeamSummaries, error: errorSimTeamSummaries } = useSimTeamSummariesKey(pickKeys); 
    const humanUsers = game.users.filter(user => !user.startsWith('autodraft'));
    const { data: teamNamesData, isLoading: isLoadingTeamNames, error: errorTeamNames } = useTeamNames(humanUsers);
    const userOnTheLine = game.users[runToDemo]; 
    const usersForScoreboard = game.users.filter((user, index) => index < scorecardRunToDemo); 
    const runsForScoreboard = draftPicks.filter(pick => {
        const contest = pick.contestSummaryKey.split("|")[2]; 
        return contest === contestToShow && 
        usersForScoreboard.includes(pick.user); 
    })
    .map(pick => {
        return {
            ...pick, 
            time: runKeyToTimeMap[pick.contestSummaryKey]
        }
    })
    .sort((a, b) => {
        return ["OT", "NT", "DQ"].includes(String(a.time)) ? 1 : 
        ["OT", "NT", "DQ"].includes(String(b.time)) ? -1 : a.time - b.time
    }); 

    useEffect(() => {   
        if(!started) return; 
        const timeout = setTimeout(() => {
            if(timeIndex < timeIndexEnd) {
                setTimeIndex(timeIndex + 1); 
            }
        }, 1000); 
        return () => clearTimeout(timeout)
    }, [timeIndex, started]); 


    if(isLoadingSimTeamSummaries || isLoadingTeamNames) {
        return <div>Loading...</div>
    }
    if(isErrorSimTeamSummaries || errorTeamNames) {
        return <div>Error: {errorSimTeamSummaries?.message || errorTeamNames?.message}</div>
    }

    const handleNextContest = () => {
        setContestInd(contestInd + 1);
        setTimeIndex(0);
        setStarted(false);
    }

    const handleSkipAnimation = () => {
        setTimeIndex(timeIndexEnd + 1);
        setStarted(true);
    }

    return (
        <div>
            <div className="d-flex d-lg-none mt-4 bg-light p-2 rounded shadow-sm w-100 d-flex flex-column justify-content-start align-items-center">
                <RightPanelContent 
                    contestToShow={contestToShow}
                    started={started}
                    runsForScoreboard={runsForScoreboard}
                    usersForScoreboard={usersForScoreboard}
                    runToDemo={runToDemo}
                    teamNamesData={teamNamesData}
                    autoDraftMap={autoDraftMap}
                    timeIndexFinished={timeIndexFinished}
                    handleNextContest={handleNextContest}
                    handleSkipAnimation={handleSkipAnimation}
                    setStarted={setStarted}
                    setAnimationComplete={setAnimationComplete}
                />
            </div>

            <div className="d-flex justify-content-center w-100 gap-2">
                <div className="d-flex flex-column align-items-start justify-content-start gap-2 w-100 mt-4 bg-light p-2 rounded shadow-sm flex-grow-1 max-height-500 overflow-y-auto">
                    {
                        game.users.map((team, index) => {
                            const email = team; 
                            const teamName = teamNamesData.find(team => team.email === email)?.name || autoDraftMap.get(email); 
                            const draftPick = draftPicks.find(pick => pick.user === email && pick?.contestSummaryKey.split("|")[2] === contestToShow); 
                            const key = draftPick?.contestSummaryKey || ""; 
                            const summary = simTeamSummaries.find(summary => summary.key === key); 
                            const simRunTime = runKeyToTimeMap[key]; 
                            return (
                                <div key={key} className="w-100">
                                    <LikelihoodChart 
                                        started={started}
                                        simTeamSummary={summary}
                                        teamName={teamName}
                                        contest={contestToShow}
                                        index={index}
                                        runToDemo={runToDemo}
                                        simRunTime={simRunTime}
                                        isAnimating={userOnTheLine === team && isAnimation}
                                        isRunReveal={userOnTheLine === team && isRunReveal}
                                        isAutoDraft={team.startsWith('autodraft')}
                                    />
                                </div>
                            )
                        })
                    }
                </div> 
                <div className="d-none d-lg-flex mt-4 bg-light p-2 rounded shadow-sm sim-scorecard d-flex flex-column justify-content-start align-items-center">
                    <RightPanelContent 
                        contestToShow={contestToShow}
                        started={started}
                        runsForScoreboard={runsForScoreboard}
                        usersForScoreboard={usersForScoreboard}
                        runToDemo={runToDemo}
                        teamNamesData={teamNamesData}
                        autoDraftMap={autoDraftMap}
                        timeIndexFinished={timeIndexFinished}
                        handleNextContest={handleNextContest}
                        handleSkipAnimation={handleSkipAnimation}
                        setStarted={setStarted}
                        setAnimationComplete={setAnimationComplete}
                    />
                </div>
            </div>
        </div>
    );
}


interface RightPanelContentProps {
    contestToShow: string;
    started: boolean;
    runsForScoreboard: { user: string; contestSummaryKey: string; time: number | string }[];
    usersForScoreboard: string[];
    runToDemo: number;
    teamNamesData: { email: string; name: string }[];
    autoDraftMap: Map<string, string>;
    timeIndexFinished: boolean;
    handleNextContest: () => void;
    handleSkipAnimation: () => void;
    setStarted: (started: boolean) => void;
    setAnimationComplete: (animationComplete: boolean) => void;
}


function RightPanelContent({ contestToShow, started, runsForScoreboard, 
    usersForScoreboard, runToDemo, teamNamesData, autoDraftMap, 
    timeIndexFinished, handleNextContest, handleSkipAnimation, setStarted, setAnimationComplete }: RightPanelContentProps) {
    return (
        <>
        <div className="text-center my-4 fw-bold">{contestToShow}</div>
        {
            started ? 
                <Scoreboard 
                    runsForScoreboard={runsForScoreboard}
                    usersForScoreboard={usersForScoreboard}
                    runToDemo={runToDemo}
                    teamNamesData={teamNamesData}
                    autoDraftMap={autoDraftMap}
                /> : 
                <Button onClick={() => setStarted(true)} text="Start Contest" />
        }
        {
            timeIndexFinished ? 
                contestToShow !== "Buckets" ? 
                    <Button className="my-4" onClick={handleNextContest} text="Next Contest" /> : 
                    <Button className="my-4" onClick={() => setAnimationComplete(true)} text="See Results" /> : 
                started && <div className="text-nowrap my-4 pointer video-links" onClick={handleSkipAnimation}>Skip Animation</div>
        }        
        </>
    )
}


interface LikelihoodChartProps {
    started: boolean;
    simTeamSummary: SimTeamSummary;
    teamName: string;
    isAutoDraft: boolean;
    contest: string;
    index: number;
    runToDemo: number;
    simRunTime: number | string;
    isAnimating: boolean
    isRunReveal: boolean
}

function LikelihoodChart({ started, simTeamSummary, teamName, contest, index, runToDemo, simRunTime, isAnimating, isRunReveal, isAutoDraft }: LikelihoodChartProps) {

    const isTopTime = index === 0;     
    const goodRunTimes = !simTeamSummary?.goodRunTimes ? [] : 
        simTeamSummary.goodRunTimes
            .map(time => parseFloat(time))
            .filter(time => !isNaN(time));
    const [team, year, _] = simTeamSummary?.key.split("|");

    const scoringZoneMin = contestChartRange[contest][0];
    const scoringZoneMax = contestChartRange[contest][1];
    const scoringZoneWidth = scoringZoneMax - scoringZoneMin;
    const rangeCenter = simTeamSummary?.goodAvg;
    const rangeStart = rangeCenter - simTeamSummary?.goodSd * 2;
    const rangeEnd = rangeCenter + simTeamSummary?.goodSd * 2;
    const rangeStartPct = (rangeStart - scoringZoneMin) / scoringZoneWidth;
    const rangeEndPct = (rangeEnd - scoringZoneMin) / scoringZoneWidth;
    const stateRecord = contestChartRange[contest][3];
    const stateRecordPct = 40 + (40 * (stateRecord - scoringZoneMin) / scoringZoneWidth);

    const simRunTimeNum = typeof simRunTime === "string" || simRunTime > scoringZoneMax ? scoringZoneMax : simRunTime; 
    const simRunTimePct = ((simRunTimeNum - scoringZoneMin) / scoringZoneWidth);
    const simRunTimeCntrPct = 40 + (simRunTimePct * 40); 

    const isPastAnimation = index < runToDemo;
    const showTime = index <= runToDemo 

    return (
        <div className={`d-flex flex-row align-items-center justify-content-between gap-2 w-100 ${isTopTime ? "mt-4" : ""}`}>
            <div className="d-none d-md-flex flex-column align-items-start justify-content-center">
                <div className="d-flex align-items-center">
                    <div className="fw-bold text-nowrap ">{teamName}</div>
                    <FontAwesomeIcon icon={isAutoDraft ? faRobot : faUser} className="ms-2 text-muted" />

                </div>
                <div className="text-muted text-nowrap">{year} {team} {contestChartRange[contest][2]}</div>
            </div>
            <div className="flex-grow-1 "/>
            <div className="sim-anim-container d-flex position-relative align-items-center">
                <div className="sim-anim-runway"></div>
                <div className="sim-anim-scoring-zone position-relative">
                    <div 
                        className="sim-anim-team-range position-absolute" 
                        style={{
                            left: `${rangeStartPct * 100}%`, 
                            width: `${(rangeEndPct - rangeStartPct) * 100}%`, 
                            height: "40px"
                        }} 
                    />                    
                    {
                        goodRunTimes.map((time, index) => {
                            return (
                                <div 
                                    key={index} 
                                    className="sim-anim-good-run-time position-absolute" 
                                    style={{
                                        left: `${(time - scoringZoneMin) / scoringZoneWidth * 100}%`, 
                                }} />
                            )
                        })
                    }
                </div>
                {
                    isPastAnimation || isRunReveal ? 
                        <div className="text-center text-nowrap fw-bold flex-grow-1">{niceTime(simRunTime)}</div>
                        : <></>
                }
                {
                    showTime && started && 
                    <div className={`position-absolute ${isAnimating ? "sim-anim-time" : ""}`} style={{left: `${simRunTimeCntrPct}%`, width: "2px", height: "40px", backgroundColor: "#3e3d47"}} />
                }
                {
                    isTopTime && <div className="position-absolute" style={{left: `${stateRecordPct}%`, top: "-24px"}} >
                        <div className="border-start border-3 border-secondary px-1 ">
                            <span className="text-secondary">{niceTime(stateRecord)}</span>
                        </div>
                    </div>
                }
            </div>
            <div className="d-flex d-md-none flex-column align-items-start justify-content-center  w-100">
                <div className="fw-bold font-xx-small">{teamName}</div>
                <div className="text-muted font-xx-small">{year} {team} {contestChartRange[contest][2]}</div>
            </div>
        </div>
    )
    
}


interface ScoreboardProps {
    runsForScoreboard: { user: string; contestSummaryKey: string; time: number | string }[];
    usersForScoreboard: string[];
    runToDemo: number;
    teamNamesData: { email: string; name: string }[];
    autoDraftMap: Map<string, string>;
}


function Scoreboard({ runsForScoreboard, usersForScoreboard, runToDemo, teamNamesData, autoDraftMap }: ScoreboardProps) {
    return (
        <div className="d-flex flex-column scoreboard-container w-100">
        <div className="text-start px-2 text-muted">Top 5 Times</div>
        {runsForScoreboard.map((el, index) => {
            if(index > 4 ) return null; 
            const newestRunUser = usersForScoreboard[runToDemo]
            const user = el.user; 
            const key = el.contestSummaryKey; 
            const [team, year, contest] = key.split("|"); 
            const teamName = teamNamesData.find(team => team.email === user)?.name || autoDraftMap.get(user); 
            const isNewItem = newestRunUser === user;
            return (
                <div key={key} className={`px-2 d-flex flex-row justify-content-between gap-2 scoreboard-item ${isNewItem ? "scoreboard-new-item" : ""}`}>
                    <div>{teamName}</div>
                    <div className={isNewItem ? "scoreboard-time-new" : ""}>{niceTime(el.time)}</div>
                </div>
            )
        })}
        {
            runsForScoreboard.length === 0 && 
                [0,1,2,3,4].map(index => {
                    return(
                        <Placeholder animation="glow" className="px-2 ">
                            <Placeholder xs={12} className="rounded" size="lg" bg="secondary"/>
                        </Placeholder>    
                    )
                } )
        }
        </div>
    )
}




const contestMap: Record<number, string> = {
    0: "Three Man Ladder", 
    1: "B Ladder", 
    2: "C Ladder", 
    3: "C Hose", 
    4: "B Hose", 
    5: "Efficiency", 
    6: "Motor Pump", 
    7: "Buckets"    
}

const contestChartRange: Record<string, [number, number, string, number]> = {
    "Three Man Ladder": [5.9, 6.9, "3ML", 6],
    "B Ladder": [4.7, 5.8, "BL", 4.82],
    "C Ladder": [8.3, 10.2, "CL", 8.62],
    "C Hose": [11.8, 14.8, "CH", 11.93],
    "B Hose": [7.2, 9.5, "BH", 7.55],
    "Efficiency": [8.2, 11, "EFF", 8.4],
    "Motor Pump": [5.2, 7.5, "MP", 5.42],
    "Buckets": [19, 26, "BUC", 20.68]
}

