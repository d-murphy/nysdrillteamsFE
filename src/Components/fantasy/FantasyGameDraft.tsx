import React, { useState, useEffect, useRef } from 'react';
import { FantasyDraftPick, FantasyGame } from '../../types/types';
import { useAuth } from 'react-oidc-context';
import { Button } from 'react-bootstrap';
import { useSimTeamSummaries } from '../../hooks/useSimTeamSummaries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faExclamationTriangle, faRefresh, faSort, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { useChangeGameStateMutation } from '../../hooks/useChangeGameStateMutation';
import { useMakePickMutation } from '../../hooks/useMakePickMutation';


interface FantasyGameDraftProps {
    game: FantasyGame;
    draftPicks: FantasyDraftPick[];
    loading: boolean;
    error: string | null;
}

declare var SERVICE_URL: string;

const contests = [
    "Three Man Ladder",
    "B Ladder",
    "C Ladder",
    "C Hose",
    "B Hose",
    "Efficiency",
    "Motor Pump",
    "Buckets",
]



function FantasyGameDraft({ game, draftPicks, loading, error }: FantasyGameDraftProps) {
    
    const users = game?.users; 
    const gameId = game?.gameId;

    const changeGameStateMutation = useChangeGameStateMutation(gameId);
    const currentDraftPick = draftPicks?.length || 0; 
    const picksNeeded = !game ? 1000000 : game.users?.length  * contests.length; 
    const draftComplete = game?.status === 'draft' && currentDraftPick >= picksNeeded; 

    return (
        <div className="container bg-white rounded shadow-sm p-2">
            <div>Fantasy Game Draft</div>
            <div>{gameId}</div>

            {
                loading ? <div>Loading...</div> : 
                error ? <div>Draft Error: {error}</div> : 
                <>

                <div>
                    {
                        game?.status === 'stage-draft' ? <Button onClick={() => {changeGameStateMutation.mutate('draft')}}>Start Draft</Button> : <></>
                    }
                </div>

                <div>
                    {!draftComplete ? "" : 
                        <Button onClick={() => {changeGameStateMutation.mutate('complete')}}>Start Simulation</Button>
                    }
                </div>

                <DraftGrid users={users}  draftPicks={draftPicks} />

                <div className="my-4">
                    <DraftOptions draftPicks={draftPicks} game={game}  gameId={gameId} currentDraftPick={currentDraftPick} />
                </div>


                {/* <div>
                    {!inGame && <Button text="Join Game" onClick={() => {joinDraftMutation.mutate()}} />}
                </div>
                <div>
                    {isMyGame && <Button text="Start Draft" onClick={() => {startDraftMutation.mutate()}} />}
                    {humanUsers.length === 1 ? "Multiple players required for results to count towards user record." : ""}
                </div> */}
                </>
            }
        </div>
    )
}




function DraftOptions({ draftPicks, gameId,game, currentDraftPick }: { draftPicks: FantasyDraftPick[], gameId: string, game: FantasyGame, currentDraftPick: number }) {
    const [selectedContest, setSelectedContest] = useState<string>(contests[0]);
    const [selectedSort, setSelectedSort] = useState<'consistency' | 'speedRating' | 'overallScore'>('speedRating');

    return (
        <div>
            <div className="d-flex flex-column">


                <div className="my-5">

                    autodraft pulls from top of each of 3 lists. 

                    this has to somehow account for what contest is needed. 
                    it somehow has to account for not repeating teams if i do that. 

                    it could also handle auto-pick when a user doesn't pick in time? 

                    when a human drafts, the next X autodraft picks should happen right after. 

                    can the backend assess when the draft is complete? might have to repeat the logic there. 

                    how 

                </div>


                <ContestSelector 
                    contests={contests}
                    selectedContest={selectedContest}
                    onContestChange={setSelectedContest}
                />
                
                <DraftTable 
                    selectedContest={selectedContest}
                    selectedSort={selectedSort}
                    onSortChange={setSelectedSort}
                    draftPicks={draftPicks}
                    gameId={gameId}
                    game={game}
                    currentDraftPick={currentDraftPick}
                />
            </div>
        </div>
    );
}

// Contest selector component - isolated from table state
function ContestSelector({ contests, selectedContest, onContestChange }: {
    contests: string[];
    selectedContest: string;
    onContestChange: (contest: string) => void;
}) {
    return (
        <div className="d-flex flex-row w-full justify-content-center mb-3">
            {contests.map(el => 
                <Button 
                    className="mx-1" 
                    size="sm" 
                    variant={el === selectedContest ? "secondary" : "outline-secondary"} 
                    key={el} 
                    value={el} 
                    onClick={() => onContestChange(el)}
                >
                    {el}
                </Button>
            )}
        </div>
    );
}

// Table component - handles its own scroll state
function DraftTable({ selectedContest, selectedSort, onSortChange, draftPicks, gameId, game, currentDraftPick }: {
    selectedContest: string;
    selectedSort: 'consistency' | 'speedRating' | 'overallScore';
    onSortChange: (sort: 'consistency' | 'speedRating' | 'overallScore') => void;
    draftPicks: FantasyDraftPick[];
    gameId: string;
    game: FantasyGame;
    currentDraftPick: number;
}) {
    const auth = useAuth(); 
    const username = auth.user?.profile.email; 
    const previousPicks = draftPicks.map(el => el.contestSummaryKey);

    const [numResults, setNumResults] = useState<number>(100);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    const isNoRepeat = game.gameType === '8-team-no-repeat'; 

    const { data: teamSummaries, isLoading } = useSimTeamSummaries(selectedContest, '', '', numResults, 0, selectedSort);

    // Use Intersection Observer for better scroll handling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !isLoadingMore && teamSummaries && teamSummaries.length >= numResults) {
                    setIsLoadingMore(true);
                    // Store scroll position before loading
                    if (tableContainerRef.current) {
                        scrollPositionRef.current = tableContainerRef.current.scrollTop;
                    }
                    
                    setTimeout(() => {
                        setNumResults(prev => prev + 100);
                        setIsLoadingMore(false);
                    }, 100);
                }
            },
            {
                root: tableContainerRef.current,
                rootMargin: '100px', // Trigger 100px before reaching the bottom
                threshold: 0.1
            }
        );

        // Create and observe a trigger element at the bottom
        const triggerElement = document.createElement('div');
        triggerElement.style.height = '1px';
        triggerElement.style.width = '100%';
        
        if (tableContainerRef.current) {
            tableContainerRef.current.appendChild(triggerElement);
            observer.observe(triggerElement);
            loadingTriggerRef.current = triggerElement;
        }

        return () => {
            observer.disconnect();
            if (loadingTriggerRef.current && tableContainerRef.current) {
                try {
                    tableContainerRef.current.removeChild(loadingTriggerRef.current);
                } catch (e) {
                    // Element might already be removed
                }
            }
        };
    }, [numResults, isLoadingMore, teamSummaries]);

    // Restore scroll position after new data is loaded
    useEffect(() => {
        if (!isLoadingMore && tableContainerRef.current && scrollPositionRef.current > 0) {
            // Try multiple methods to ensure scroll position is maintained
            const restoreScroll = () => {
                if (tableContainerRef.current) {
                    tableContainerRef.current.scrollTop = scrollPositionRef.current;
                }
            };
            
            // Try immediately
            restoreScroll();
            
            // Try after animation frame
            requestAnimationFrame(() => {
                restoreScroll();
                
                // Try again after a small delay to ensure DOM is fully updated
                setTimeout(restoreScroll, 10);
            });
        }
    }, [teamSummaries, isLoadingMore]);

    // Reset numResults and scroll position when contest or sort changes
    useEffect(() => {
        setNumResults(100);
        scrollPositionRef.current = 0;
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [selectedContest, selectedSort]);

    const makePickMutation = useMakePickMutation(username, gameId);
    const handleDraftPick = (teamSummary: any) => {
        const contestSummaryKey = `${teamSummary.team}|${teamSummary.year}|${selectedContest}`;
        makePickMutation.mutate({ 
            contestSummaryKey, 
            draftPick: currentDraftPick 
        });
    };

    const handleSortChange = (column: 'consistency' | 'speedRating') => {
        if (selectedSort !== column) {
            onSortChange(column);
        }
    };

    const getSortIcon = (column: 'consistency' | 'speedRating') => {
        if (selectedSort !== column) {
            return <FontAwesomeIcon icon={faSort} className="text-muted" />;
        }
        return <FontAwesomeIcon icon={faSortDown} className="text-primary" />;
    };

    return (
        <div 
            ref={tableContainerRef}
            className="table-responsive" 
            style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                scrollBehavior: 'auto',  // Prevent smooth scrolling that might interfere
                overflowAnchor: 'auto'   // CSS scroll anchoring to help maintain position
            }}
        >
            <table className="table table-sm table-striped " key={`${selectedContest}-${selectedSort}`}>
                <TableHeader 
                    onSortChange={handleSortChange}
                    getSortIcon={getSortIcon}
                />

                {isLoading ? 
                    <TableBodySkeleton /> : (
                    <TableBody 
                        teamSummaries={teamSummaries}
                        selectedContest={selectedContest}
                        previousPicksObj={draftPicks}
                        onDraftPick={handleDraftPick}
                        makePickMutation={makePickMutation}
                        isNoRepeat={isNoRepeat}
                    />)}
            </table>
            {isLoadingMore && (
                <div className="text-center p-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading more...</span>
                    </div>
                    <div className="small text-muted mt-1">Loading more teams...</div>
                </div>
            )}
        </div>
    );
}

function TableBodySkeleton() {

    return (
        <tbody>
            {Array.from({ length: 100 }).map((_, index) => (
                <tr key={index + "table-body-skeleton"}>
                    <td colSpan={6} className="text-center">
                        <div style={{ minHeight: '20px'}} ></div>
                    </td>
                </tr>
            ))}
        </tbody>
    )
}


// Table header component
function TableHeader({ onSortChange, getSortIcon }: {
    onSortChange: (column: 'consistency' | 'speedRating' | 'overallScore') => void;
    getSortIcon: (column: 'consistency' | 'speedRating' | 'overallScore') => JSX.Element;
}) {
    return (
        <thead className="sticky-top bg-white">
            <tr>
                <th style={{ width: '80px' }}>Draft</th>
                <th style={{ width: '150px' }}>Team - Year</th>
                <th 
                    style={{ minWidth: '120px', maxWidth: '120px', cursor: 'pointer' }} 
                    onClick={() => onSortChange('speedRating')}
                    className="user-select-none"
                >
                    <div className="d-flex align-items-center justify-content-between">
                        <span>Speed Rating</span>
                        {getSortIcon('speedRating')}
                    </div>
                </th>
                <th 
                    style={{ minWidth: '120px', maxWidth: '120px', cursor: 'pointer' }} 
                    onClick={() => onSortChange('consistency')}
                    className="user-select-none"
                >
                    <div className="d-flex align-items-center justify-content-between">
                        <span>Consistency</span>
                        {getSortIcon('consistency')}
                    </div>
                </th>
                <th 
                    style={{ minWidth: '120px', maxWidth: '120px', cursor: 'pointer' }} 
                    onClick={() => onSortChange('overallScore')}
                    className="user-select-none"
                >
                    <div className="d-flex align-items-center justify-content-between">
                        <span>Overall</span>
                        {getSortIcon('overallScore')}
                    </div>
                </th>

                <th 
                    className="text-end text-nowrap"
                    style={{ minWidth: '120px', maxWidth: '120px' }}
                >Top Runs</th>
            </tr>
        </thead>
    );
}

// Table body component
function TableBody({ teamSummaries, selectedContest,  previousPicksObj, isNoRepeat, onDraftPick, makePickMutation }: {
    teamSummaries: any[];
    selectedContest: string;
    previousPicksObj: FantasyDraftPick[];
    onDraftPick: (teamSummary: any) => void;
    makePickMutation: any;
    isNoRepeat: boolean;
}) {

    const auth = useAuth(); 
    const username = auth.user?.profile.email; 
    const previousPicks = previousPicksObj.map(el => el.contestSummaryKey);
    const myPicks = previousPicksObj.filter(el => el.user === username);
    const pickedContests = myPicks.map(el => el.contestSummaryKey.split("|")[2])

    let filteredTeamSummaries = teamSummaries.filter(el => !previousPicks.includes(el.key));

    if(isNoRepeat) {
        const teamsToSkip = new Set([...previousPicks
            .map(el => {
                const [team, year, contest] = el.split("|");
                return `${team}|${contest}`;
            })
        ]); 
        filteredTeamSummaries = filteredTeamSummaries.filter(el => {
            const teamContestKey = `${el.team}|${el.contest}`;
            return !teamsToSkip.has(teamContestKey);
        });
    }



    return (
        <tbody>
            {filteredTeamSummaries
                .map((teamSummary) => (
                    <tr key={teamSummary._id + "available-teams"}>
                        <td className="align-middle text-center" style={{ height: '100%' }}>
                            {
                                pickedContests.includes(selectedContest) ? <div className="text-muted"><FontAwesomeIcon icon={faCheck} /></div> :
                                    <Button 
                                        size="sm" 
                                        className="fantasy-draft-btn"                                 
                                        onClick={() => onDraftPick(teamSummary)}
                                        disabled={makePickMutation.isPending}
                                    >
                                        {makePickMutation.isPending ? '...' : 'Draft'}
                                    </Button>
                            }
                        </td>
                        <td className="text-nowrap align-middle text-start">{teamSummary.team} - {teamSummary.year}</td>
                        <td className="align-middle text-center" style={{ height: '100%' }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div 
                                    className="nav-bg-color-dk" 
                                    style={{ 
                                        width: `${teamSummary.speedRating * 100}%`, 
                                        height: '20px',
                                        minWidth: '2px'
                                    }}
                                ></div>
                                <span className="ms-2 small">{((teamSummary?.speedRating || 0 ) * 100).toFixed(0)}</span>
                            </div>
                        </td>
                        <td className="align-middle text-center">
                            <div className="d-flex align-items-center justify-content-between">
                                <div 
                                    className="nav-bg-color" 
                                    style={{ 
                                        width: `${teamSummary.consistency * 100}%`, 
                                        height: '20px',
                                        minWidth: '2px'
                                    }}
                                ></div>
                                <span className="ms-2 small">{((teamSummary?.consistency || 0 ) * 100).toFixed(0)}</span>
                            </div>
                        </td>
                        <td className="align-middle text-center">
                            <div className="d-flex align-items-center justify-content-between">
                                <div 
                                    className="contest-selected" 
                                    style={{ 
                                        width: `${teamSummary.overallScore * 100}%`, 
                                        height: '20px',
                                        minWidth: '2px'
                                    }}
                                ></div>
                                <span className="ms-2 small">{((teamSummary?.overallScore || 0 ) * 100).toFixed(0)}</span>
                            </div>
                        </td>
                        <td className="align-middle text-center">
                            <div className="small text-end text-wrap ms-2">
                                {teamSummary.goodRunTimes.join(', ')}
                            </div>
                        </td>
                    </tr>
                ))}
        </tbody>
    );
}




function DraftGrid({ users, draftPicks }: { users: string[], draftPicks: FantasyDraftPick[] }) {

    const colCt = users.length; 
    const rowCt = contests.length; 


    return (
        <div className="max-width-100 overflow-auto">
            {
                Array.from({ length: rowCt }, (_, rowInd) => (
                    <div className="w-100 d-flex " key={rowInd + "draft-grid-row"}>
                        {Array.from({ length: colCt }, (_, colInd) => (
                            <DraftGridCell draftPicks={draftPicks} colCt={colCt} rowInd={rowInd} colInd={colInd} />
                        ))}
                    </div>
                ))
            }
        </div>
    )
}


function DraftGridCell({ draftPicks, colCt, rowInd, colInd }: { draftPicks: FantasyDraftPick[], colCt: number, rowInd: number, colInd: number }) {

    const evenRound = rowInd % 2 === 0;

    const draftPickNumber = evenRound ? rowInd * colCt + colInd : rowInd * colCt + colCt - colInd - 1;
    const draftPick = draftPicks.find(el => el?.draftPick === draftPickNumber);
    const lastPick = draftPicks[draftPicks.length - 1];
    const isCurrentPick = draftPickNumber === (lastPick?.draftPick + 1);
    const draftPickRound = Math.floor(draftPickNumber / colCt);
    const draftPickInRound = draftPickNumber % colCt;
    const draftPickDisplayNum = `${draftPickRound + 1}.${draftPickInRound + 1}`;

    const row = Math.floor(draftPickNumber / colCt);
    const rowIsEven = row % 2 === 0;


    if(!draftPick) return (
        <div className={`draft-grid-cell ${isCurrentPick ? "bg-primary" : rowIsEven ? "bg-lightgray" : "bg-light"} w-100`}>
            <div className="d-flex flex-row align-items-center justify-content-end w-100 p-2">
                <div className="font-small l-grayText m-1">{draftPickDisplayNum}</div>
            </div>
        </div>
    );

    const pickInfo = draftPick?.contestSummaryKey.split("|");
    const team = pickInfo[0];
    const year = pickInfo[1];
    const contest = pickInfo[2];

    return (
        <div className={`draft-grid-cell ${rowIsEven ? "bg-lightgray" : "bg-light"} col`}>
            <div className="d-flex flex-column align-items-start justify-content-start h-100 p-2">
                <div className="d-flex flex-row align-items-center justify-content-start w-100">
                    <div className="font-medium text-nowrap text-truncate">{team}</div>
                    <div className="flex-grow-1"></div>
                    <div className="font-small l-grayText m-1">{draftPickDisplayNum}</div>
                </div>
                <div className="font-small">{year} - {contest}</div>
                <div className="flex-grow-1"></div>
                {
                    rowIsEven ? 
                        <FontAwesomeIcon icon={faArrowRight} className="ms-1 grayText" /> :
                        <FontAwesomeIcon icon={faArrowLeft} className="ms-1 grayText" />
                }
            </div>
        </div>
    )
}

export default React.memo(FantasyGameDraft);
