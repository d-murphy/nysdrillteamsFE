import React, {useState} from 'react'; 
import { Tournament, Team, Run } from "../../types/types"

interface EditRunsFormProps {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    teams: Team[], 
    runsEditContest: string, 
    reqSubmitted: boolean, 
    runInReview: Run, 
    setRunInReview: React.Dispatch<React.SetStateAction<Run>>
}

export default function RunsEditForm(props:EditRunsFormProps) {
    const isAdmin = props.isAdmin; 
    const tournInReview = props.tournInReview; 
    const teams = props.teams; 
    const runsEditContest = props.runsEditContest; 
    const reqSubmitted = props.reqSubmitted; 
    const runInReview = props.runInReview; 
    const setRunInReview = props.setRunInReview; 


    return (
        reqSubmitted ? <div>Loading... </div> : 
        <div className='d-flex flex-column justify-content-center align-items-center'>
            <div className="row my-1">
                <div className="col-4 text-center">Team</div>
                <div className="col-8 text-center px-4">
                    <input 
                        id="team" 
                        value={runInReview.team} 
                        className="text-center width-100" 
                        disabled={!isAdmin}
                        autoComplete="off"></input>
                </div>
            </div>
            Have to set these: 
            // time: '', 
            // timeNum: null, 
            // points: '', 
            // rank: '', 
            // urls: , 
            // notes: '',
            // stateRecord: false,
            // currentStateRecord: false
            Set the rest below a fold: 

        </div>
    )
}

// _id: string
// id?: number, 
// team: string, 
// hometown?: string, 
// nickname?: string, 
// contest: string,
// year: number, 
// tournament: string,
// tournamentId: number,
// track: string, 
// time: string, 
// timeNum: number,
// runningPosition?: number, 
// nassauPoints?: boolean, 
// suffolkPoints?: boolean, 
// westernPoints?: boolean, 
// northernPoints?: boolean, 
// suffolkOfPoints?: boolean, 
// nassauOfPoints?: boolean, 
// liOfPoints?: boolean, 
// juniorPoints?: boolean,
// date: Date, 
// urls: string[], 
// sanctioned: boolean, 
// points?: string, 
// rank?: string, 
// notes?: string,
// stateRecord?: string,
// currentStateRecord?: string

