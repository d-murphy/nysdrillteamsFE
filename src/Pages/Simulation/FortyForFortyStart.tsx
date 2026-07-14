import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice, faEye, faEyeSlash, faTruckPickup } from "@fortawesome/free-solid-svg-icons";
import { useInsertFortyForForty } from "../../hooks/fortyForForty/useInsertFortyForForty";
import { YearRoulette } from "../../features/fortyForForty/YearRoulette";
import { ContestPicker } from "../../features/fortyForForty/ContestPicker";
import { TeamPickTable } from "../../features/fortyForForty/TeamPickTable";
import { ContestTracker } from "../../features/fortyForForty/ContestTracker";
import { FortyForFortyScoreboard } from "../../features/fortyForForty/FortyForFortyScoreboard";

export type GameMode = 'classic' | 'lifer';

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

const ANIMATION_MS = 1500;

function randomYear() {
    return Math.floor(Math.random() * (2025 - 1970 + 1)) + 1970;
}

function nextUnpickedContest(pickedContests: string[]): string {
    return contests.find(c => !pickedContests.includes(c)) ?? contests[0];
}

type Phase = 'intro' | 'ready' | 'animating' | 'picking' | 'submitting';

export interface Pick {
    contest: string;
    key: string;
}

export default function FortyForFortyStart() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<Phase>('intro');
    const [mode, setMode] = useState<GameMode>('classic');
    const [year, setYear] = useState<number>(2025);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedContest, setSelectedContest] = useState<string>(contests[0]);
    const [picks, setPicks] = useState<Pick[]>([]);
    const [hasRerolled, setHasRerolled] = useState(false);
    const [pendingGameId, setPendingGameId] = useState<string | null>(null);
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (!pendingGameId) return;
        const timeout = setTimeout(() => {
            navigate(`/Forty-for-Forty/${pendingGameId}`);
        }, 2000);
        return () => clearTimeout(timeout);
    }, [pendingGameId, navigate]);

    const mutation = useInsertFortyForForty(
        (gameId) => setPendingGameId(gameId),
        () => navigate('/Error')
    );

    const pickedContests = picks.map(p => p.contest);

    const startAnimation = (nextContest: string) => {
        if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        const targetYear = randomYear();
        setPhase('animating');
        setIsAnimating(true);
        animationTimeoutRef.current = setTimeout(() => {
            setYear(targetYear);
            setIsAnimating(false);
            setSelectedContest(nextContest);
            setPhase('picking');
        }, ANIMATION_MS);
    };

    const handleStart = (selectedMode: GameMode) => {
        setMode(selectedMode);
        setPhase('ready');
    };

    const handleSpin = () => {
        startAnimation(contests[0]);
    };

    const handleReroll = () => {
        setHasRerolled(true);
        startAnimation(selectedContest);
    };

    const handlePick = (key: string, contest: string) => {
        const newPicks = [...picks, { contest, key }];
        setPicks(newPicks);
        if (newPicks.length === contests.length) {
            setPhase('submitting');
            const sortedPicks = [...newPicks].sort(
                (a, b) => contests.indexOf(a.contest) - contests.indexOf(b.contest)
            );
            mutation.mutate({ contestSummaryKeys: sortedPicks.map(p => p.key), gameMode: mode });
        } else {
            startAnimation(nextUnpickedContest(newPicks.map(p => p.contest)));
        }
    };

    if (phase === 'intro') {
        return <IntroPage onStart={handleStart} />;
    }

    if (phase === 'submitting') {
        return <SimulatingScreen />;
    }

    // 'ready', 'animating', and 'picking' all share the outer layout so the right panel is always visible
    return (
        <div className="container py-3">
            <div className="bg-white rounded shadow-sm">
            {/* Header */}
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between py-3 px-3 border-bottom gap-2">
                <div className="d-flex align-items-center gap-3">
                    {!isAnimating && phase !== 'ready' && (
                        <YearRoulette year={year} isAnimating={false} variant="pill" />
                    )}
                    {phase !== 'ready' && (
                        <span className="text-muted small fw-semibold">
                            Pick {picks.length + 1} of {contests.length}
                        </span>
                    )}
                </div>
                {phase === 'picking' && !isAnimating && (
                    <button
                        className={`d-flex align-items-center gap-2 bg-transparent border-0 p-0 ${hasRerolled ? 'text-muted' : 'text-primary'}`}
                        style={{ cursor: hasRerolled ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                        disabled={hasRerolled}
                        onClick={handleReroll}
                    >
                        <FontAwesomeIcon icon={faDice} />
                        Re-roll
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="row g-0">
                {/* Left panel */}
                <div className="col-12 col-lg-8 pe-lg-3 pt-3">
                    {phase === 'ready' ? (
                        <div className="d-flex flex-column align-items-center justify-content-center py-4 py-lg-5 px-3" style={{ minHeight: '40vh' }}>
                            <Button
                                size="lg"
                                className="fw-bold d-flex align-items-center gap-2 px-5 py-3"
                                style={{ fontSize: '1.25rem' }}
                                onClick={handleSpin}
                            >
                                <FontAwesomeIcon icon={faDice} />
                                Spin
                            </Button>
                            <div
                                className="text-muted fw-semibold mt-5 text-center"
                                style={{ fontSize: '0.98rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                            >
                                Start the game by spinning for a random season.
                            </div>
                        </div>
                    ) : isAnimating ? (
                        <div className="d-flex flex-column align-items-center justify-content-center py-4 py-lg-5" style={{ minHeight: '40vh' }}>
                            <div
                                className="text-muted text-uppercase fw-semibold mb-4"
                                style={{ fontSize: '0.72rem', letterSpacing: '0.14em' }}
                            >
                                Drawing a year
                            </div>
                            <YearRoulette year={year} isAnimating={true} variant="hero" />
                        </div>
                    ) : (
                        <>
                            <div className="mb-3 ms-3">
                                <ContestPicker
                                    contests={contests}
                                    selectedContest={selectedContest}
                                    pickedContests={pickedContests}
                                    onContestChange={setSelectedContest}
                                />
                            </div>
                            <TeamPickTable
                                selectedContest={selectedContest}
                                year={year}
                                hideStats={mode === 'lifer'}
                                pickedKeys={picks.map(p => p.key)}
                                defaultSort={mode === 'lifer' ? 'teamName' : 'speedRating'}
                                onPick={handlePick}
                            />
                        </>
                    )}
                </div>

                {/* Right panel */}
                <div
                    className="col-lg-4 d-none d-lg-block pt-3 px-3"
                    style={{ borderLeft: '1px solid #dee2e6' }}
                >
                    <ContestTracker
                        contests={contests}
                        picks={picks}
                        selectedContest={selectedContest}
                        onSelectContest={(c) => !isAnimating && setSelectedContest(c)}
                        disabled={isAnimating}
                    />
                </div>
            </div>

            {/* Mobile tracker */}
            <div className="d-lg-none mt-3 border-top p-3">
                <ContestTracker
                    contests={contests}
                    picks={picks}
                    selectedContest={selectedContest}
                    onSelectContest={(c) => !isAnimating && setSelectedContest(c)}
                    disabled={isAnimating}
                />
            </div>
            </div>
        </div>
    );
}


function SimulatingScreen() {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(d => (d.length >= 3 ? '' : d + '.'));
        }, 450);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container">
            <style>{`
                @keyframes f4f-drive {
                    0%   { transform: translateX(-160px); }
                    100% { transform: translateX(calc(100vw + 160px)); }
                }
                @keyframes f4f-bounce {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-7px); }
                }
                .f4f-truck-runner {
                    position: absolute;
                    bottom: 12px;
                    left: 0;
                    animation: f4f-drive 2.6s linear infinite;
                }
                .f4f-truck-icon {
                    animation: f4f-bounce 0.55s ease-in-out infinite;
                    display: block;
                }
            `}</style>

            <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: '60vh' }}
            >
                {/* Road + truck */}
                <div
                    className="position-relative w-100 mb-4"
                    style={{ height: 90, overflow: 'hidden' }}
                >
                    {/* Road surface */}
                    <div
                        className="position-absolute w-100"
                        style={{ bottom: 8, height: 3, backgroundColor: '#dee2e6', borderRadius: 2 }}
                    />
                    {/* Dashed center line */}
                    <div
                        className="position-absolute w-100"
                        style={{
                            bottom: 8,
                            height: 3,
                            backgroundImage: 'repeating-linear-gradient(90deg, #fff 0px, #fff 18px, transparent 18px, transparent 36px)',
                            opacity: 0.6,
                        }}
                    />
                    {/* Truck */}
                    <div className="f4f-truck-runner">
                        <FontAwesomeIcon
                            icon={faTruckPickup}
                            className="f4f-truck-icon"
                            style={{ fontSize: '3.5rem' }}
                        />
                    </div>
                </div>
                <div className="fw-semibold text-muted text-center" style={{ fontSize: '1.15rem' }}>
                    Simulating a drill with your team
                    <span style={{ display: 'inline-block', width: '1.8ch', textAlign: 'left' }}>{dots}</span>
                </div>
            </div>
        </div>
    );
}


interface IntroPageProps {
    onStart: (mode: GameMode) => void;
}

function IntroPage({ onStart }: IntroPageProps) {
    return (
        <div className="container py-4">
            <div className="text-center mb-4">
                <h1 className="fw-bold mb-2">Can you go 40 for 40?</h1>
                <p className="text-muted">
                    Pick one team per contest, each drawn from a random year. Run the simulation and earn points.
                </p>
            </div>

            <div className="row g-3 justify-content-center">
                <div className="col-12 col-md-5">
                    <div className="card h-100 shadow-sm border">
                        <div className="card-body d-flex flex-column p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <FontAwesomeIcon icon={faEye} className="text-primary fs-5" />
                                <h4 className="fw-bold mb-0">Classic</h4>
                            </div>
                            <p className="text-muted flex-grow-1">
                                Full stats visible — speed, consistency, and overall ratings help you make informed picks.
                            </p>
                            <Button
                                className="w-100 py-2 mt-3 fw-bold"
                                style={{ fontSize: '1rem' }}
                                onClick={() => onStart('classic')}
                            >
                                Play Classic
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-5">
                    <div className="card h-100 shadow-sm border">
                        <div className="card-body d-flex flex-column p-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <FontAwesomeIcon icon={faEyeSlash} className="text-dark fs-5" />
                                <h4 className="fw-bold mb-0">Lifer Mode</h4>
                            </div>
                            <p className="text-muted flex-grow-1">
                                No stats — pick by team and year alone. For those who know their racing history.
                            </p>
                            <Button
                                variant="dark"
                                className="w-100 py-2 mt-3 fw-bold"
                                style={{ fontSize: '1rem' }}
                                onClick={() => onStart('lifer')}
                            >
                                Play Lifer Mode
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <FortyForFortyScoreboard />
        </div>
    );
}
