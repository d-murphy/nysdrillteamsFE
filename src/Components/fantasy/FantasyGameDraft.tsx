import React, { useState, useEffect, useRef } from 'react';
import { FantasyDraftPick, FantasyGame } from '../../types/types';
import { useAuth } from 'react-oidc-context';
import { Button, Container, Form, Offcanvas, Placeholder } from 'react-bootstrap';
import { useSimTeamSummaries } from '../../hooks/fantasy/useSimTeamSummaries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowLeft, faArrowRight, faArrowUp, faCheck, faClock,  faRobot, faSort, faSortDown, faUser, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useChangeGameStateMutation } from '../../hooks/fantasy/useChangeGameStateMutation';
import { useMakePickMutation } from '../../hooks/fantasy/useMakePickMutation';
import isMyPick from '../../utils/fantasy/isMyPick';
import generateAutoDraftMap from '../../utils/fantasy/autoNames';
import useTeamNames from '../../hooks/fantasy/useTeamNames';
import useDebounce from '../../hooks/useDebounce';
import useWindowDimensions from '../../utils/windowDimensions';


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
    const [trayOpen, setTrayOpen] = useState(true);
    const [trayHeight, setTrayHeight] = useState(0);
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 750; 

    const auth = useAuth(); 
    const owner = game?.owner; 
    const isMyGame = owner.toLowerCase() === auth.user?.profile.email.toLowerCase(); 
    const users = game?.users; 
    const gameId = game?.gameId;

    const changeGameStateMutation = useChangeGameStateMutation(gameId);
    const currentDraftPick = draftPicks?.length || 0; 
    const picksNeeded = !game ? 1000000 : game.users?.length  * contests.length; 
    const draftComplete = game?.status === 'draft' && currentDraftPick >= picksNeeded; 
    const trayHeightClass = trayHeight === 0 ? "h-15" : trayHeight === 1 ? "h-30" : "h-60";

    useEffect(() => {
        if(draftComplete){
            setTrayOpen(false);
        }
    }, [draftComplete]); 
    return (
        <>
        <div className="container bg-white rounded shadow-sm p-2">
            {
                loading ? 
                    <div className="d-flex align-items-center justify-content-center m-5 p-5">
                        <div className="spinner-border text-secondary" role="status"></div>
                    </div> : 
                error ? 
                    <div className="d-flex align-items-center justify-content-center m-5 p-5">
                        <div>Draft Error: {error}</div>
                    </div> : 
                <>
                <div className="d-flex justify-content-between align-items-start my-2 gap-4">
                    <div className="d-flex flex-column align-items-start justify-content-center">
                        {
                            game?.status === 'stage-draft' ? 
                                isMyGame ? 
                                    <div className="d-flex flex-column gap-2">
                                        <Button className="w-160p"  onClick={() => {changeGameStateMutation.mutate('draft')}}>Start Draft</Button> 
                                        <div className="ms-1">You're the game owner.  When you're ready, click the button to start the draft.</div>
                                    </div>
                                    : <div>Wait for the game owner to start the draft.</div>
                                :
                                !draftComplete ? 
                                    <></> : 
                                    <Button onClick={() => {changeGameStateMutation.mutate('complete')}}>Start Simulation</Button>                                
                        }                    
                    </div>
                </div>

                <DraftGrid users={users}  draftPicks={draftPicks} />

                <Offcanvas show={trayOpen} placement="bottom" scroll={true} backdrop={false} className={trayHeightClass}>

                    <Container>
                        <Offcanvas.Header>
                            <div className="d-flex justify-content-between align-items-center w-100">
                                <Offcanvas.Title>Draft Options</Offcanvas.Title>
                                <div className="d-flex flex-row gap-2">
                                    <Button variant="outline-secondary" size="sm" onClick={() => setTrayHeight(Math.max(trayHeight - 1, 0))}>
                                        <FontAwesomeIcon icon={faArrowDown} /> 
                                    </Button>
                                    <Button variant="outline-secondary" size="sm" onClick={() => setTrayHeight(Math.min(trayHeight + 1, 2))}>
                                        <FontAwesomeIcon icon={faArrowUp} />
                                    </Button>
                                </div>

                            </div>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <div>
                                <DraftOptions draftPicks={draftPicks} game={game}  gameId={gameId} currentDraftPick={currentDraftPick} />
                            </div>
                        </Offcanvas.Body>
                    </Container>
                </Offcanvas>
                </>
            }
        </div>
        <div className="minheight-180" />
        </>
    )
}




function DraftOptions({ draftPicks, gameId,game, currentDraftPick }: { draftPicks: FantasyDraftPick[], gameId: string, game: FantasyGame, currentDraftPick: number }) {
    const [selectedContest, setSelectedContest] = useState<string>(contests[0]);
    const [selectedSort, setSelectedSort] = useState<'consistency' | 'speedRating' | 'overallScore'>('speedRating');
    const [searchInput, setSearchInput] = useState<string>('');
    const debouncedSearchInput = useDebounce(searchInput, 500);

    return (
        <div>
            <div className="d-flex flex-column">
                <Form.Control
                    className="w-100 height-30 d-lg-none d-block mb-2"
                    type="text" 
                    placeholder="Search Teams" 
                    value={searchInput} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                />
                <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">
                    <div className="d-lg-block d-none me-5">
                        <Form.Control
                            className="height-30 w-250 mb-1"
                            type="text" 
                            placeholder="Search Teams" 
                            value={searchInput} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <ContestSelector 
                        draftPicks={draftPicks}
                        contests={contests}
                        selectedContest={selectedContest}
                        onContestChange={setSelectedContest}
                    />
                </div>
                
                <DraftTable 
                    selectedContest={selectedContest}
                    selectedSort={selectedSort}
                    onSortChange={setSelectedSort}
                    draftPicks={draftPicks}
                    gameId={gameId}
                    game={game}
                    currentDraftPick={currentDraftPick}
                    teamSearch={debouncedSearchInput}
                />
            </div>
        </div>
    );
}

function ContestSelector({ contests, selectedContest, onContestChange, draftPicks }: {
    contests: string[];
    selectedContest: string;
    onContestChange: (contest: string) => void;
    draftPicks: FantasyDraftPick[];
}) {
    const user = useAuth().user?.profile.email; 
    const myPicks = draftPicks.filter(el => el.user === user);
    const pickedContests = myPicks.map(el => el.contestSummaryKey.split("|")[2]);
    
    return (
        <div className="d-flex flex-row w-full justify-content-end flex-wrap gap-1">
            {contests.map(el => 
                <Button 
                    className="d-flex text-nowrap mb-1" 
                    size="sm" 
                    variant={el === selectedContest ? "primary" : 
                        !pickedContests.includes(el) ? "secondary" : "outline-secondary"} 
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
function DraftTable({ selectedContest, selectedSort, onSortChange, draftPicks, gameId, game, currentDraftPick, teamSearch }: {
    selectedContest: string;
    selectedSort: 'consistency' | 'speedRating' | 'overallScore';
    onSortChange: (sort: 'consistency' | 'speedRating' | 'overallScore') => void;
    draftPicks: FantasyDraftPick[];
    gameId: string;
    game: FantasyGame;
    currentDraftPick: number;
    teamSearch: string;
}) {
    const auth = useAuth(); 
    const username = auth.user?.profile.email; 
    // const previousPicks = draftPicks.map(el => el.contestSummaryKey);
    const isMyPickResult = isMyPick(currentDraftPick, username, game);
    const runSearch = isMyPickResult || game.status === 'stage-draft';
    
    const [numResults, setNumResults] = useState<number>(100);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0);
    const loadingTriggerRef = useRef<HTMLDivElement>(null);

    const isNoRepeat = game.gameType === '8-team-no-repeat'; 

    const teamYearContestKeyArrToExclude = draftPicks.map(el => el.contestSummaryKey);
    const teamContestKeyArrToExclude = game.gameType !== "8-team-no-repeat" ? undefined : 
        draftPicks.map(el => el.contestSummaryKey.split("|").filter((el, index) => index !== 1).join("|"));

    const { data: teamSummaries, isLoading } = useSimTeamSummaries(
        selectedContest, '', teamSearch, numResults, 0, selectedSort, teamContestKeyArrToExclude, teamYearContestKeyArrToExclude, runSearch
    );

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

    if(makePickMutation.isError){
        return <div>An error occurred while making your pick.  Please refresh the page and try again.</div>;
    }

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

                {isLoading || !runSearch ? 
                    <TableBodySkeleton /> : (
                    <TableBody 
                        teamSummaries={teamSummaries}
                        selectedContest={selectedContest}
                        previousPicksObj={draftPicks}
                        onDraftPick={handleDraftPick}
                        makePickMutation={makePickMutation}
                        isNoRepeat={isNoRepeat}
                        isMyPick={isMyPickResult}
                        game={game}
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
function TableBody({ teamSummaries, selectedContest,  previousPicksObj, isNoRepeat, onDraftPick, makePickMutation, isMyPick, game }: {
    teamSummaries: any[];
    selectedContest: string;
    previousPicksObj: FantasyDraftPick[];
    onDraftPick: (teamSummary: any) => void;
    makePickMutation: any;
    isNoRepeat: boolean;
    isMyPick: boolean;
    game: FantasyGame;
}) {

    const auth = useAuth(); 
    const username = auth.user?.profile.email; 
    const myPicks = previousPicksObj.filter(el => el.user === username);
    const pickedContests = myPicks.map(el => el.contestSummaryKey.split("|")[2])

    return (
        <tbody>
            {teamSummaries
                .map((teamSummary) => {
                    return (
                    <tr key={teamSummary._id + "available-teams"}>
                        <td className="align-middle text-center" style={{ height: '100%' }}>
                            {
                                pickedContests.includes(selectedContest) ? 
                                    <div className="text-muted"><FontAwesomeIcon icon={faCheck} /></div> :
                                    !isMyPick ? <div className="text-muted"><FontAwesomeIcon icon={faClock} /></div> :
                                    <Button 
                                        size="sm" 
                                        className="fantasy-draft-btn"                                 
                                        onClick={() => onDraftPick(teamSummary)}
                                        disabled={makePickMutation.isPending || game.status !== 'draft'}
                                    >
                                        {makePickMutation.isPending || game.status !== 'draft' ? '...' : 'Draft'}
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
                                <span className="ms-2 small">{(teamSummary.overallScore * 100).toFixed(0)}</span>
                            </div>
                        </td>
                        <td className="align-middle text-center">
                            <div className="small text-end text-wrap ms-2">
                                {teamSummary.goodRunTimes.join(', ')}
                            </div>
                        </td>
                    </tr>
                )})}
        </tbody>
    );
}




function DraftGrid({ users, draftPicks }: { users: string[], draftPicks: FantasyDraftPick[] }) {

    const colCt = users.length; 
    const rowCt = contests.length; 
    const autoDraftMap = generateAutoDraftMap();
    const humanUsers = users.filter(user => !user.startsWith('autodraft'));
    const { data: teamNamesData, isLoading: isLoadingTeamNames, error: errorTeamNames } = useTeamNames(humanUsers);


    return (
        <div className="max-width-100 overflow-auto">
            <div className="w-100 d-flex " key={"user-" + "draft-grid-row"}>
                {
                    users.map(user => {
                        const isAuto = user.startsWith('autodraft');
                        const teamNameInfo = teamNamesData?.find((team) => team.email === user); 
                        const displayName = isAuto ? autoDraftMap.get(user) : 
                            teamNameInfo ? `${teamNameInfo.town} ${teamNameInfo.name}` : 'Unable to load team name'; 


                        return (
                            <div className="font-small l-grayText draft-grid-header-cell col d-flex flex-column justify-content-between align-items-center py-2 text-center">
                                {isAuto ? <FontAwesomeIcon icon={faRobot} /> : <FontAwesomeIcon icon={faUser} />}
        <div>
                                    {
                                    isAuto ? 
                                        autoDraftMap.get(user) : 
                                        isLoadingTeamNames ? 
                                            <Placeholder animation="glow" className="p-0 text-center">
                                                <Placeholder xs={10} className="rounded" size="lg" bg="secondary"/>
                                            </Placeholder> : 
                                                errorTeamNames ? <div>Error loading team name</div> :
                                                displayName
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
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
