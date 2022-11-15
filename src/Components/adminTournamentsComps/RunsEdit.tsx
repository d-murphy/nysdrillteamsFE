import React, {useState} from 'react'; 
import { Tournament, Team, Run } from "../../types/types"



interface EditRunsProps {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    teams: Team[], 
    runsForTourn: Run[], 
    runsEditContest: string, 
    setRunsEditContest: React.Dispatch<React.SetStateAction<string>>
}

export default function EditRunningOrder(props:EditRunsProps) {
    const isAdmin = props.isAdmin; 
    const tournInReview = props.tournInReview; 
    const teams = props.teams; 
    const runsForTourn = props.runsForTourn; 
    const runsEditContest = props.runsEditContest; 
    const setRunsEditContest = props.setRunsEditContest; 

    const runsForTournLU:{[index:string]:Run} = {}; 
    runsForTourn.forEach(el => {
        runsForTournLU[`${el.contest}-${el.team}`] = el; 
    })

    return (
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
                <h6>{runsEditContest}</h6>
            </div>
            <div >
                {Object.keys(tournInReview.runningOrder).map(key =>{
                    let team = tournInReview.runningOrder[parseInt(key)]
                    let runKey = `${runsEditContest}-${team}`
                    return (
                        <div className='row'>
                            <div className='col mx-2'>{key}. {tournInReview.runningOrder[parseInt(key)]}</div>
                            <div className='col mx-2'>{runsForTournLU[runKey].time}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
