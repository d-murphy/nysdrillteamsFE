import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import getTournamentWinner from '../utils/getTournamentWinners';
import { Run, Tournament } from '../types/types';
import dateUtil from '../utils/dateUtils';
import { niceTime } from '../utils/timeUtils';
import {  WinnerIconNoHov } from '../Components/SizedImage';
import { makeRunLuKey } from '../Components/StateWinners';

declare var SERVICE_URL: string; 

interface TournamentHistoryProps {

}


export default function TournamentHistory(props:TournamentHistoryProps){
    let params = useParams();
    const name = params.name; 

    const [loading, setLoading] = useState(true); 
    const [runLoading, setRunLoading] = useState(true); 
    const [error, setError] = useState(false); 
    const [runError, setRunError] = useState(false); 
    const [tourns, setTourns] = useState<Tournament[]>([]); 
    const [runs, setRuns] = useState<Record<string, Run>>(null); 

    useEffect(() => {
        fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?tournaments=${name}`)
        .then(data => data.json())
        .then(data => {
            data = data.filter((el: Tournament) => {
                return Number(el.year)  < new Date().getFullYear()
            }).sort((a:Tournament, b:Tournament) => {
                return a.year > b.year ? -1 : 1;
            })
            setTourns(data); 
            setLoading(false); 
        })
        .catch((err:Error) => {
            console.log(err); 
            setError(true); 
        })
    }, [])

    useEffect(() => {
        if(!tourns.length) return; 

        const contestSet = new Set(); 
        tourns.forEach(tourn => {
            tourn.contests.forEach(contest => {
                contestSet.add(contest.name)
            })
        })
        const contestArr = Array.from(contestSet); 

        let url = `${SERVICE_URL}/runs/getFilteredRuns?`;
        url += "tournaments=" + name.replace("&", "%26"); 
        url += "&contests=" + contestArr.join(",").replace("&", "%26"); 
        url += "&ranks=1"; 
        url += "&limit=2000"
        fetch(`${url}`)
            .then(data => data.json())
            .then(data => {
                if(!data.length) return setError(true); 
                const runData = data[0].data as Run[]

                const runLu: Record<string, Run> = {}; 
                runData.forEach(el => {
                    const key = makeRunLuKey(el.contest, el.year.toString(), name); 
                    runLu[key] = el; 
                })

                setRuns(runLu); 
                setRunLoading(false); 
            })
            .catch((err:Error) => {
                console.log(err); 
                setRunError(true); 
            })
    }, [tourns])


    if(error || runError) return <div className='p-3 m-3 w-100 text-center'>There was an error loading this info.  Please try again.</div>
    if(loading || runLoading) return (
        <div className="col-12 d-flex flex-column align-items-center mt-5">
            <div className="spinner-border text-secondary" role="status"></div>
        </div>
    )

    const tournCt = tourns.length; 
    const winnerCounts = tourns.reduce((acc: Record<string, number>, tourn) => {
        const winners = tourn.top5.filter(el => el.finishingPosition === "1st Place"); 
        winners.forEach(winner => {
            if(!acc[winner?.teamName]){
                acc[winner?.teamName] = 1; 
            } else acc[winner.teamName]++; 
        })
        return acc; 
    }, {})

    const winnerCountsArr = Object.keys(winnerCounts).map(el => {
        return {
            team: el, 
            wins: winnerCounts[el]
        }
    })
    .sort((a,b) => a.wins < b.wins ? 1 : -1)

    const topWinners = winnerCountsArr.filter((el, ind) => {
        return ind < 5; 
    })    

    const list = tourns.map(tourn => <TournHistoryEntry tourn={tourn} runLu={runs} />); 

    return (
        <div className='container'>
            <div className="text-center w-100 font-x-large my-3"><b>Tournament History: {name}</b></div>
            <div className='row shadow-sm rounded py-4 bg-white mx-1'>
                <div className="d-block d-md-none col-12 my-4">
                    <div className=' d-flex flex-column justify-content-center text-center h-100'>
                        <div className="font-xx-large">{tournCt}</div>
                        <div>Recorded Events</div>
                    </div>
                </div>
                <div className="d-none d-md-block col-md-4 border-end border-secondary my-3">
                    <div className=' d-flex flex-column justify-content-center text-center h-100'>
                        <div className="font-xx-large">{tournCt}</div>
                        <div>Recorded Events</div>
                    </div>
                </div>
                <div className="d-block d-md-none col-12 my-4">
                    <div className=' d-flex flex-column justify-content  text-center h-100'>
                        <div className="font-xx-large">{winnerCountsArr.length}</div>
                        <div># of Winners</div>
                    </div>
                </div>
                <div className="d-none d-md-block col-md-4 border-end border-secondary my-3">
                    <div className=' d-flex flex-column justify-content-center text-center h-100'>
                        <div className="font-xx-large">{winnerCountsArr.length}</div>
                        <div># of Winners</div>
                    </div>
                </div>
                <div className="d-block d-md-none col-12 my-4">
                    <div className=' d-flex flex-column justify-content-center text-center h-100'>
                        <div className='font-small grayText'>Most Wins</div>
                        <div>
                        {
                            topWinners.map(el => <div>{`${el.team} (${el.wins})`}</div>)
                        }
                        </div>
                    </div>
                </div>
                <div className="d-none d-md-block col-md-4 my-3 px-4">
                    <div className=' d-flex flex-column justify-center text-center'>
                        <div className='font-small grayText'>Most Wins</div>
                        <div>
                            {
                                topWinners.map(el => <div>{`${el.team} (${el.wins})`}</div>)
                            }
                        </div>
                    </div>
                </div>

            
            </div> 

            {list}
        </div>
    )
}



interface TournHistoryEntryProps {
    tourn: Tournament
    runLu: Record<string, Run>
    showName?: boolean
}

export function TournHistoryEntry ({tourn, runLu, showName = false} : TournHistoryEntryProps) { 
    const navigate = useNavigate(); 

    const seperator = " | "; 
    let winnerStr = getTournamentWinner(tourn, seperator, true); 
    let secondStr = getTournamentWinner(tourn, seperator, true, "2nd Place"); 
    let thirdStr = getTournamentWinner(tourn, seperator, true, "3rd Place"); 
    let fourthStr = getTournamentWinner(tourn, seperator, true, "4th Place"); 
    let fifthStr = getTournamentWinner(tourn, seperator, true, "5th Place"); 

    let winnerStrNoPts = getTournamentWinner(tourn, seperator); 
    let winnerArr = winnerStrNoPts.split(seperator); 

    const nameChange = {
        "New York State Championship" : "NYS Motorized Championship", 
        "New York State Jr. Championship" : "NYS Junior Championship", 
        "New York State OF Championship": "NYS Old Fashioned Championship"
    }

    console.log("tourn.name: ", tourn.name)
    //@ts-ignore ok
    const titleBlock = showName ? nameChange[tourn.name] : tourn.year

    return (
        <div className='row shadow-sm rounded py-2 my-2 mx-1 bg-white pointer' 
            onClick={() => {navigate(`/Tournament/${tourn.id}`)}}>
            <div className='col-12 col-md-3'>
                <div className="d-flex flex-row justify-content-between flex-wrap">
                    <div className='h-100 d-flex justify-content-start align-items-start flex-column ps-1 py-2 max-width-50'>
                        <div className='font-x-large'>                        
                            <b>{titleBlock}</b>
                        </div>
                        <div className="font-small text-left grayText">
                            {`${dateUtil.getMMDD(tourn.date)}${tourn.track && tourn.track !== 'null' ? ` @ ${tourn.track}` : ""}`}
                        </div>
                        <div className="font-small text-left grayText">
                            {tourn.host ? `Host: ${tourn.host}` : ""}
                        </div>
                    </div>
                    <div className="flex-grow-1" />
                    <div className="flex-grow-1" />
                    <div className='d-md-none d-block'>
                        <div className="d-flex flex-row pt-1">
                            {winnerArr.map(el => <span className="p-1"><WinnerIconNoHov team={el} size="md"/></span>)}
                        </div>
                    </div>
                </div>
            </div>
            <div className='d-none d-md-block col-md-1'>
                <div className="d-flex flex-column pt-1">
                    {winnerArr.map(el => <span className="p-1"><WinnerIconNoHov team={el} size="sm"/></span>)}
                </div>
            </div>
            <div className='col-12 col-md-4'>
                <div className='h-100 d-flex flex-column justify-content-start align-items-start text-left ps-1 py-2'>
                    {winnerStr ? <div className='font-x-small'>{`1st Place`}</div> : <></> }
                    <div className='font-large' ><b>{winnerStr}</b></div>
                    {   
                        secondStr ? 
                            <div className="font-xx-small grayText">2nd Place: {secondStr}</div> : <></>
                    }
                    {   
                        thirdStr ? 
                            <div className="font-xx-small grayText">3rd Place: {thirdStr}</div> : <></>
                    }
                    {   
                        fourthStr ? 
                            <div className="font-xx-small grayText">4th Place: {fourthStr}</div> : <></>
                    }
                    {   
                        fifthStr ? 
                            <div className="font-xx-small grayText">5th Place: {fifthStr}</div> : <></>
                    }

                </div>
            </div>
            <div className='col-12 col-md-4'>
                <div className='h-100 d-flex flex-column justify-content-start align-items-start text-left ps-1 py-2'>
                    <div className="font-x-small">Contest Winners</div>
                    <div className="row">
                        {
                            tourn.contests.map(el => {
                                const runKey = makeRunLuKey(el.name, tourn.year.toString(), tourn.name); 
                                const run = runLu[runKey]; 
                                if(!run) return <></>;
                                return (
                                    <div className="font-x-small col-4 d-flex flex-column mb-1">
                                        <div className="grayText font-xx-small">{run.contest}</div>
                                        <div className="">{niceTime(run.time)}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}