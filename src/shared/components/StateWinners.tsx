
import React, { useMemo } from "react"
import { Run, Tournament } from "../../types/types";
import Placeholder from "react-bootstrap/Placeholder";
import { TournHistoryEntry } from "../../features/tournament/TournamentHistory";
import { useQuery } from "@tanstack/react-query";

interface StateWinnersProps {
    year: string
}

declare var SERVICE_URL: string;
const TOURN_NAMES = "New York State Championship,New York State OF Championship,New York State Jr. Championship";

export const makeRunLuKey = (contest: string, year:string, tournName: string) => {
    return contest + year + tournName;
}

export default function StateWinners(props: StateWinnersProps) {

    const { data: tourns = [], isLoading: loading, isError: error } = useQuery<Tournament[]>({
        queryKey: ['stateWinners', props.year],
        queryFn: () => fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?years=${props.year}&tournaments=${TOURN_NAMES}`)
            .then(res => res.json())
            .then((data: Tournament[]) => data.sort((a, b) => a.name < b.name ? -1 : 1)),
    });

    const contestStr = useMemo(() => {
        const contestSet = new Set<string>();
        tourns.forEach(tourn => tourn.contests.forEach(contest => contestSet.add(contest.name)));
        return Array.from(contestSet).join(",").replace("&", "%26");
    }, [tourns]);

    const { data: runs, isLoading: runsLoading, isError: runError } = useQuery<Record<string, Run>>({
        queryKey: ['stateWinnersRuns', props.year, contestStr],
        queryFn: () => {
            const url = `${SERVICE_URL}/runs/getFilteredRuns?tournaments=${TOURN_NAMES}&contests=${contestStr}&ranks=1&limit=2000`;
            return fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (!data.length) throw new Error("No runs found");
                    const runData = data[0].data as Run[];
                    const runLu: Record<string, Run> = {};
                    runData.forEach(el => {
                        const key = makeRunLuKey(el.contest, el.year.toString(), el.tournament);
                        runLu[key] = el;
                    });
                    return runLu;
                });
        },
        enabled: tourns.length > 0,
    });

    const skeletonKeys = [0,1,2];

    if(error || runError) return <></> // fail quietly
    if(!loading && tourns.length === 0) return <></> // fail quietly


    const content = (loading || (tourns.length > 0 && runsLoading)) ?
        <>
            {
                skeletonKeys.map((el:number) => {
                    return (
                        <StateWinnerLoadingSq key={el}/>
                    )
                })
            }
        </> : tourns
        .sort((a,b) => a.name < b.name ? -1 : 1)
        .map((el:Tournament) => {
            if(Object.keys(el.top5).length === 0) return <></>;
            return (
                <TournHistoryEntry tourn={el} runLu={runs} showName={true} />
            )
        })

    return (
        <div className="px-2 py-3 my-2">
            <div className="row ">
                <span className="h4 pb-3 me-3">Season Champions</span>
            </div>

                {content}
        </div>
    )
}

interface StateWinnerSqProps {
    tournament: Tournament
}

// function StateWinnerSq(props: StateWinnerSqProps) {
//     const tourn = props.tournament; 

//     const seperator = " | "; 
//     let winnerStr = getTournamentWinner(tourn, seperator); 
//     let winnerArr = winnerStr.split(seperator); 
//     const navigate = useNavigate(); 

//     let secondStr = getTournamentWinner(tourn, seperator, true, "2nd Place"); 
//     let thirdStr = getTournamentWinner(tourn, seperator, true, "3rd Place"); 
//     let fourthStr = getTournamentWinner(tourn, seperator, true, "4th Place"); 
//     let fifthStr = getTournamentWinner(tourn, seperator, true, "5th Place"); 

//     return (
//         <div className="mx-1 my-1 flex-grow-1">
//             <div className="champs-bg rounded shadow-sm d-flex flex-column align-items-start justify-content-center p-4 text-center pointer" 
//                 onClick={() => navigate(`/Tournament/${tourn.id}`)}> 
//                 <div className="text-wrap h5" >
//                     <span>{tourn.name.replace("New York State", "NYS")}</span>
//                 </div>
//                 <div className="text-wrap h6 text-muted text-start mb-2" >
//                     <span>{tourn.date ? dateUtil.getMMDDYYYY(new Date(tourn.date)) : ""}</span>
//                     <span className="ps-1 text-muted small">{tourn.track ? "@ " + tourn.track : ""}</span>
//                     <span className="ps-1 text-muted small">{(tourn.host && tourn.track && tourn.track !== tourn.host) ? "hosted by " + tourn.host : ""}</span>
//                 </div>
//                 <div className="flex-grow-1" />
//                 <div className="d-flex flex-row justify-content-center align-items-center align-self-center flex-wrap">
//                     {winnerArr.map(el => <span className="p-1"><WinnerIconNoHov team={el} size="lg"/></span>)}
//                 </div>
//                 <div className="flex-grow-1" />
//                 <div className="w-100 d-flex flex-column h-100">
//                     <div className="pb-2 pt-1 d-flex align-items-start flex-column">
//                         <div className="h5 text-start mt-2 text-wrap">
//                             {
//                                 winnerArr.map(el => {
//                                     return (
//                                         <>
//                                             <FontAwesomeIcon className="pe-2 trophyGold" icon={faTrophy} size="sm"/>
//                                             <span className="me-2">{el}</span>                                        
//                                         </>
//                                     )
//                                 })
//                             }  
//                         </div>
//                         <div className="text-wrap h6 text-muted text-start">
//                             {tourn?.top5 && Object.keys(tourn?.top5).length && tourn.top5[0].points + " points"}
//                         </div>
//                     </div>
//                     <div className="d-flex flex-column align-items-end text-muted font-xx-small pt-3">
//                         <div className="flex-grow-1"></div>
//                         <div>{secondStr}</div>
//                         <div>{thirdStr}</div>
//                         <div>{fourthStr}</div>
//                         <div>{fifthStr}</div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

function StateWinnerLoadingSq() {
    return (
        <div className='row shadow-sm rounded py-2 my-2 mx-1 bg-white pointer'>
            <div className='col-12 col-md-3 d-flex flex-column'>
                <Placeholder animation="glow" className="p-0 d-none d-md-block">
                    <Placeholder xs={6} className="rounded" size="lg" bg="secondary"/>
                </Placeholder>
                <Placeholder animation="glow" className="p-0 d-none d-md-block">
                    <Placeholder xs={6} className="rounded" size="sm" bg="secondary"/>
                </Placeholder>
            </div>
            <div className='d-none d-md-block col-md-1'>
                <div className="placeholder-glow d-flex justify-content-end align-items-end fluid-width">
                    <div className="image-wrap-sm placeholder bg-secondary rounded"></div>
                </div> 
            </div>
            <div className='col-12 col-md-4'>
                <div className="d-flex flex-column pb-3">
                    <Placeholder animation="glow" className="p-0">
                        <Placeholder xs={2} className="rounded" size="xs" bg="secondary"/>
                    </Placeholder>
                    <Placeholder animation="glow" className="p-0">
                        <Placeholder xs={8} className="rounded" size="lg" bg="secondary"/>
                    </Placeholder>
                    <Placeholder animation="glow" className="pt-2">
                        <Placeholder xs={4} className="rounded" size="xs" bg="secondary"/>
                    </Placeholder>
                    <Placeholder animation="glow" className="p-0">
                        <Placeholder xs={4} className="rounded" size="xs" bg="secondary"/>
                    </Placeholder>
                </div>

            </div>
            <div className='col-12 col-md-4'>
                <div className="row">
                    {
                        [0,1,2,3,4,5,6,7].map(el => {
                            return (
                                <div className="font-x-small col-4 d-flex flex-column mb-1">
                                    <Placeholder animation="glow" className="p-0 ">
                                        <Placeholder xs={6} className="rounded" size="lg" bg="secondary"/>
                                    </Placeholder>
                                    <Placeholder animation="glow" className="p-0 ">
                                        <Placeholder xs={6} className="rounded" size="lg" bg="secondary"/>
                                    </Placeholder>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}