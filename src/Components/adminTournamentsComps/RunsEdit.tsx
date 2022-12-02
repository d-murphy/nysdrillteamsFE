import React, {useEffect, useState} from 'react'; 
import { Tournament, Team, Run } from "../../types/types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPenToSquare, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons"; 

import RunsEditForm from "./RunsEditForm"; 

interface EditRunsProps {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    teams: Team[], 
    runsForTourn: Run[], 
    runsEditContest: string, 
    setRunsEditContest: React.Dispatch<React.SetStateAction<string>>, 
    reqSubmitted: boolean, 
    setReqSubmitted:  React.Dispatch<React.SetStateAction<boolean>>, 
    getRunsForTourn: Function
}

export default function RunsEdit(props:EditRunsProps) {
    const isAdmin = props.isAdmin; 
    const tournInReview = props.tournInReview; 
    const teams = props.teams; 
    const runsForTourn = props.runsForTourn; 
    const runsEditContest = props.runsEditContest; 
    const setRunsEditContest = props.setRunsEditContest; 
    const reqSubmitted = props.reqSubmitted; 
    const setReqSubmitted = props.setReqSubmitted; 
    const getRunsForTourn = props.getRunsForTourn; 

    const emptyRun:Run = {
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
        currentStateRecord: false
    }

    const [runInReview, setRunInReview] = useState<Run | null>(null)
    const [editOrInsertRun, setEditOrInsertRun] = useState<'edit' | 'insert'>("insert"); 
    let [reqResult, setReqResult] = useState<{error: boolean, message:string} | null>(null); 
    const [showingDeleteWarning, setShowingDeleteWarning] = useState(false)

    let buttonsToDisplay:{team:string, runningPosition?:string, hasRun:Run}[] = []; 
    const runsForTournLU:{[index:string]:Run} = {}; 
    runsForTourn.forEach(el => {
        runsForTournLU[`${el.contest}-${el.team}`] = el; 
    })
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

    function loadExistingRun(run:Run){
        setEditOrInsertRun('edit'); 
        setReqResult(null); 
        setShowingDeleteWarning(false); 
        setRunInReview({
            ...emptyRun,
            ...run
        }); 
    }

    function loadNewRun(team:string, runningPosition: string){
        setEditOrInsertRun('insert'); 
        setReqResult(null); 
        setShowingDeleteWarning(false); 
        const teamObj = teams.find(el => el.fullName == team); 
        const cfp = getCfp(tournInReview.contests, runsEditContest); 
        setRunInReview({
            ...emptyRun, 
            team: team, 
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
            nassauPoints: cfp && tournInReview.nassauPoints && teamObj.circuit == 'Nassau',  
            suffolkPoints: cfp && tournInReview.suffolkPoints && teamObj.circuit == 'Suffolk',
            westernPoints: cfp && tournInReview.westernPoints && teamObj.circuit == 'Western', 
            northernPoints: cfp && tournInReview.northernPoints && teamObj.circuit == 'Northern',
            suffolkOfPoints: cfp && tournInReview.suffolkOfPoints && teamObj.circuit == 'Old Fashioned',
            nassauOfPoints: cfp && tournInReview.nassauOfPoints && teamObj.circuit == 'Old Fashioned',
            liOfPoints: cfp && (tournInReview.nassauOfPoints || tournInReview.suffolkOfPoints) && teamObj.circuit == 'Old Fashioned',
            juniorPoints: cfp && tournInReview.nassauPoints && teamObj.circuit == 'Juniors',
        })
    }

    function changeContest(contest:string){
        setRunsEditContest(contest); 
        setRunInReview(null); 
        setReqResult(null); 
        setShowingDeleteWarning(false); 
    }
    

    function getSanction(contestArr: {name:string, cfp:boolean, sanction:boolean}[], contest:string): boolean {
        let contestObj = contestArr.find(el => {
            return el.name == contest; 
        })
        if(contestObj) return contestObj.sanction; 
        return false
    }
    
    function getCfp (contestArr: {name:string, cfp:boolean, sanction:boolean}[], contest:string): boolean {
        let contestObj = contestArr.find(el => {
            return el.name == contest; 
        })
        if(contestObj) return contestObj.cfp; 
        return false
    }


    return (
        reqSubmitted ? <div className='d-flex justify-content-center align-items-center some-height mt-5'>Loading... </div> : 
        <div className='d-flex flex-column justify-content-center align-items-center'>
            <div className="d-flex justify-content-center flex-wrap">
                {tournInReview.contests.map(contest => {
                    return (
                        <div className="btn btn-light mx-1 my-2 py-1" onClick={() => {changeContest(contest.name)}}>
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
                                                <FontAwesomeIcon className="crud-links font-large px-2 " icon={faPenToSquare} onClick={() => loadExistingRun(el.hasRun)} />
                                            </> : 
                                            <FontAwesomeIcon className="crud-links font-large px-2" icon={faPlus} onClick={() => loadNewRun(el.team, el.runningPosition)} />}
                                    </div>
                                )
                            })
                            }
                            <div className='mt-4 d-flex flex-column align-items-center justify-content-center text-center'>
                                <div><i>If a team is not listed, first add them to the running order on the tournament page.</i></div>
                            </div>                                           

                        </div>
                        <div className='col-8 p-2 bg-light rounded'>
                            <div className='d-flex justify-content-center align-items-center'>
                                {
                                        <RunsEditForm 
                                            isAdmin={isAdmin} 
                                            tournInReview={tournInReview} 
                                            teams={teams} 
                                            runsEditContest={runsEditContest} 
                                            runInReview={runInReview}
                                            setRunInReview={setRunInReview}
                                            getRunsForTourn={getRunsForTourn}
                                            editOrInsertRun={editOrInsertRun}
                                            reqResult={reqResult}
                                            setReqResult={setReqResult}
                                            setReqSubmitted={setReqSubmitted}
                                            showingDeleteWarning={showingDeleteWarning}
                                            setShowingDeleteWarning={setShowingDeleteWarning}
                                        />
                                
                                }
                                
                            </div>
                        </div>
                    </div>            
            }
        </div>
    )
}
