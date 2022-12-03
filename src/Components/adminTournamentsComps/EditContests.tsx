import React from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons"; 
import { Tournament, Team } from "../../types/types"
import ContestOptions from "./ContestOptions"; 

interface EditContestsProps {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    setTournInReview: React.Dispatch<React.SetStateAction<Tournament>>, 
    teams: Team[]
}

export default function EditRunningOrder(props:EditContestsProps) {
    const isAdmin = props.isAdmin; 
    const tournInReview = props.tournInReview; 
    const setTournInReview = props.setTournInReview; 
    const teams = props.teams; 

    function addContest(){
        let contests = [...tournInReview.contests, {name: null, cfp:true, sanction:true }]; 
        setTournInReview({
            ...tournInReview, 
            contests: contests
        })
    }

    function removeContest(){
        let contests = [...tournInReview.contests]
        contests.pop(); 
        setTournInReview({
            ...tournInReview, 
            contests: contests
        })
    }

    function selectContest(e:React.ChangeEvent<HTMLSelectElement>, ind:number){
        let contests = [...tournInReview.contests]; 
        contests[ind] = {
            ...contests[ind], 
            name: e.target.value
        }; 
        setTournInReview({
            ...tournInReview, 
            contests: contests
        })
    }

    function handleContestCheck(e:React.ChangeEvent<HTMLInputElement>, ind:number, contestObjKey:'cfp' | 'sanction'){
        let contests = [...tournInReview.contests]; 
        contests[ind] = {
            ...contests[ind], 
        }
        contests[ind][contestObjKey] = e.target.checked;  
        setTournInReview({
            ...tournInReview, 
            contests: contests
        })
    }  

    return (
        <div className="container my-3 pt-2 border-top">
            <div className="row">
                {isAdmin ? 
                    <div className="col d-flex justify-content-center align-items-center my-2">
                        Add Contest<FontAwesomeIcon className="mx-2 pointer" icon={faPlus} onClick={() => addContest()} />
                    </div> : <></>
                }
            </div>
            {
                tournInReview.contests.map((contest, ind) => {
                    return (
                        <div className="row mt-1">
                            <div className="col-1 text-center">{ind + 1}.</div>
                            <div className="col-10 d-flex flex-row justifiy-contest-center align-items-center">
                                <div className='flex-grow-1 mx-2'>
                                    <select onChange={(e) => selectContest(e, ind)} className="width-100 text-center mx-2" value={contest.name} disabled={!isAdmin}>
                                        <ContestOptions/>
                                    </select>
                                </div>
                                <div className="d-flex flex-row justify-content-center align-items-center mx-2">
                                    <div className="me-1">Counts for Points?</div>
                                    <input className="form-check-input" type="checkbox" checked={contest.cfp} onChange={(e) => handleContestCheck(e, ind,"cfp")} disabled={!isAdmin}/>
                                </div>
                                <div className="d-flex flex-row justify-content-center align-items-center mx-2">
                                    <div className="me-1">Sanctioned?</div>
                                    <input className="form-check-input" type="checkbox" checked={contest.sanction} onChange={(e) => handleContestCheck(e, ind,"sanction")} disabled={!isAdmin}/>
                                </div>
                            </div>
                            <div className="col-1 text-center">
                                {
                                    isAdmin && ind + 1 == tournInReview.contests.length ? 
                                        <FontAwesomeIcon className="pointer" icon={faTrash} size='sm' onClick={removeContest} /> : <div />
                                }                                                
                            </div>
                        </div>
                    )
                })
            }
        </div>

    )
}