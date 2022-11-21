import React, {useEffect, useState} from 'react'; 
import { Tournament, Team, Run } from "../../types/types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPenToSquare, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons"; 




interface EditRunsProps {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    teams: Team[], 
    runsForTourn: Run[], 
    runsEditContest: string, 
    setRunsEditContest: React.Dispatch<React.SetStateAction<string>>, 
    reqSubmitted: boolean
}

export default function EditRunningOrder(props:EditRunsProps) {
    const isAdmin = props.isAdmin; 
    const tournInReview = props.tournInReview; 
    const teams = props.teams; 
    const runsForTourn = props.runsForTourn; 
    const runsEditContest = props.runsEditContest; 
    const setRunsEditContest = props.setRunsEditContest; 
    const reqSubmitted = props.reqSubmitted; 

    const [runInReview, setRunInReview] = useState<Run | null>(null)

    let buttonsToDisplay:{team:string, runningPosition?:string, hasRun:Run}[] = []; 
    const runsForTournLU:{[index:string]:Run} = {}; 
    runsForTourn.forEach(el => {
        runsForTournLU[`${el.contest}-${el.team}`] = el; 
    })
    console.log("runsForTournLU", runsForTournLU); 

    console.log('making buttons'); 
    const runsAleadyWithButton:{[index:string]:boolean} = {}; 
    if(tournInReview.runningOrder) {
        Object.keys(tournInReview.runningOrder).forEach(runningPosition => {
            const team = tournInReview.runningOrder[parseInt(runningPosition)]; 
            if(team) {
                buttonsToDisplay.push({
                    team: team, 
                    runningPosition: runningPosition, 
                    hasRun: runsForTournLU[`${runsEditContest}-${team}`]
                })
                runsAleadyWithButton[team] = true;     
            }
        })
    }
    runsForTourn.filter(run => {
        return run.contest == runsEditContest; 
    }).forEach(run => {
        if(!runsAleadyWithButton[run.team]){
            buttonsToDisplay.push({
                team: run.team, 
                runningPosition: null, 
                hasRun: run
            })
        }
    })


    return (
        reqSubmitted ? <div>Loading... </div> : 
        <div className='d-flex flex-column justify-content-center align-items-center'>
            <div className="d-flex justify-content-center flex-wrap">
                {tournInReview.contests.map(contest => {
                    return (
                        <div className="btn btn-light mx-1 my-2 py-1" onClick={() => {setRunsEditContest(contest.name)}}>
                            {contest.name}
                        </div>    
                    )
                })}
            </div>
            <div className='mb-2 mt-4'>
                <h6>{runsEditContest == "" ? "Please select a contest." : runsEditContest}</h6>
            </div>
            {
                runsEditContest == "" ? <></> : 
                    <div className='w-100 row' >
                        <div className='col-4'>
                            { runsEditContest == "" ? <></> :  
                            buttonsToDisplay.map(el => {
                                return (
                                    <div>
                                        ({el.runningPosition? el.runningPosition : "Not in Running Order."}) {el.team}
                                        {el.hasRun ? 
                                            <>
                                                <FontAwesomeIcon className="crud-links font-large px-2 " icon={faPenToSquare} onClick={() => setRunInReview(el.hasRun)} />
                                            </> : 
                                            <FontAwesomeIcon className="crud-links font-large px-2" icon={faPlus} />}
                                    </div>
                                )
                            })
                            }
                            <div className='mt-4 d-flex flex-column align-items-center justify-content-center text-center'>
                                <div>Add a run for a team not listed <FontAwesomeIcon className="crud-links font-large px-2" icon={faPlus} /></div>
                                <div><i>This isn't recommended.  It's better to add the team in the tournament's running order.</i></div>
                            </div>                                           

                        </div>
                        <div className='col-8 p-2 bg-light rounded'>
                            <div className='d-flex justify-content-center align-items-center'>
                                {
                                    !runInReview ? <div className='m-3'>Select a run to edit</div> : 
                                        <div>{runInReview.timeNum}</div>
                                
                                }
                                
                            </div>
                        </div>
                    </div>            
            }
        </div>
    )
}
