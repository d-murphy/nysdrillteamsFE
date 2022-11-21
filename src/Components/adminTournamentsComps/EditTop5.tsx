import React from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons"; 
import { Tournament, Track, Team } from "../../types/types"



interface EditTop5Props {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    setTournInReview: React.Dispatch<React.SetStateAction<Tournament>>, 
    teams: Team[]
}

export default function EditTop5(props:EditTop5Props) {
    const isAdmin = props.isAdmin; 
    const tournInReview = props.tournInReview; 
    const setTournInReview = props.setTournInReview; 
    const teams = props.teams; 
    const finishingPositionTeams = Object.values(tournInReview.runningOrder).length ? Object.values(tournInReview.runningOrder) : teams.map(el => el.fullName); 

    function addTeamToTop5(addOrDelete:'add' | 'delete'){
        let top5 = [...tournInReview.top5]; 
        if(addOrDelete=='add'){
            top5.push({teamName:null, finishingPosition:null, points:0})
        } else {
            top5.pop(); 
        }
        setTournInReview({
            ...tournInReview, 
            top5: top5
        })
    }

    function selectChangeInTop5(e:React.ChangeEvent<HTMLSelectElement>, index:number, field:'teamName' | 'finishingPosition'){
        let top5 = [...tournInReview.top5]; 
        top5[index][field] = e.target.value; 
        setTournInReview({
            ...tournInReview, 
            top5: top5
        })
    }

    function selectPointsInTop5(e:React.ChangeEvent<HTMLInputElement>, index:number){
        let top5 = [...tournInReview.top5]; 
        top5[index].points = parseFloat(e.target.value);
        setTournInReview({
            ...tournInReview, 
            top5: top5
        })
    }

    return (
        <div className="row my-3 pt-2 border-top">
            <div className="row">
                {isAdmin ? 
                    <div className="col d-flex justify-content-center align-items-center my-2">
                        Add Team to Top 5<FontAwesomeIcon className="mx-2 pointer" icon={faPlus} onClick={() => addTeamToTop5('add')} />
                    </div> : <></>
                }
            </div>
            {
                tournInReview.top5.map((top5member, index:number) => {
                    return (
                        <div className="row mt-1">
                            <div className="col-11 d-flex justify-content-center align-items-center ">
                                <div className="col-5 px-2">
                                    <select onChange={(e) => selectChangeInTop5(e, index, 'teamName')} className="width-100 text-center " value={top5member.teamName} disabled={!isAdmin}>
                                        <option value={null}></option>
                                        {
                                            finishingPositionTeams.map(el => {
                                                return (<option value={el}>{el}</option>)
                                            })
                                        }
                                    </select>
                                </div>
                                <div className="col-5 px-2">
                                    <select onChange={(e) => selectChangeInTop5(e, index, 'finishingPosition')} className="width-100 text-center" value={top5member.finishingPosition} disabled={!isAdmin}>
                                        <option value={null}></option>
                                        <option value={"1st Place"}>1st Place</option>
                                        <option value={"2nd Place"}>2nd Place</option>
                                        <option value={"3rd Place"}>3rd Place</option>
                                        <option value={"4th Place"}>4th Place</option>
                                        <option value={"5th Place"}>5th Place</option>
                                    </select>
                                </div>
                                <div className="col-2 d-flex justify-content-center align-items-center px-2">
                                    <div className="me-2">Points:</div> 
                                    <input onChange={(e) => { selectPointsInTop5(e, index)}} value={top5member.points} type="number" step="0.01" className="width-60px " disabled={!isAdmin} ></input>
                                </div>
                            </div>
                            <div className="col-1 text-center">
                                {isAdmin && index + 1 == tournInReview.top5.length ? 
                                    <FontAwesomeIcon className="pointer ps-5" icon={faTrash} size='sm' onClick={() => addTeamToTop5('delete')} /> : <div />
                                }
                            </div>
                        </div>
                    )
                })
            }
    </div>
)}

