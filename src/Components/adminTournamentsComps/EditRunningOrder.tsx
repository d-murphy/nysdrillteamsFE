import React from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons"; 
import { Tournament, Team } from "../../types/types"



interface EditRunningOrderProps {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    setTournInReview: React.Dispatch<React.SetStateAction<Tournament>>, 
    teams: Team[]
}

export default function EditRunningOrder(props:EditRunningOrderProps) {
    const isAdmin = props.isAdmin; 
    const tournInReview = props.tournInReview; 
    const setTournInReview = props.setTournInReview; 
    const teams = props.teams; 


    function addTeamToRunningOrder(addOrDelete:'add' | 'delete'){
        let runOrder = {
            ...tournInReview.runningOrder
        }; 
        let max = Object.keys(runOrder).length ? Math.max(...Object.keys(runOrder).map(el => parseInt(el))) : 0; 
        if(addOrDelete=='add'){
            max++; 
            runOrder[max] = '';    
        } else {
            delete runOrder[max]; 
        }
        setTournInReview({
            ...tournInReview, 
            runningOrder: runOrder
        })
    }

    function selectTeamInRunningOrder(e:React.ChangeEvent<HTMLSelectElement>, key:number){
        let runOrder = {
            ...tournInReview.runningOrder
        }
        runOrder[key] = e.target.value; 
        setTournInReview({
            ...tournInReview, 
            runningOrder: runOrder
        })
    }


    return (
        <div className="row my-3 pt-2 border-top">
        <div className="row">
            {isAdmin ? 
                <div className="col d-flex justify-content-center align-items-center my-2">
                    Add Team to Running Order<FontAwesomeIcon className="mx-2 pointer" icon={faPlus} onClick={() => addTeamToRunningOrder('add')} />
                </div> : <></>
            }
        </div>
        {
            Object.keys(tournInReview.runningOrder).map((key:string, index:number) => {
                return (
                    <div className="row mt-1">
                        <div className="col-1 text-center">{key}.</div>
                        <div className="col-10">
                            <select onChange={(e) => selectTeamInRunningOrder(e, parseInt(key))} className="width-100 text-center" value={tournInReview.runningOrder[parseInt(key)]} disabled={!isAdmin}>
                                {teams.map(el => {
                                    return (<option value={el.fullName}>{el.fullName}</option>)
                                })}
                            </select>
                        </div>
                        <div className="col-1 text-center">
                            {isAdmin && index + 1 == Object.keys(tournInReview.runningOrder).length ? 
                                <FontAwesomeIcon className="pointer" icon={faTrash} size='sm' onClick={() => addTeamToRunningOrder('delete')} /> : <div />
                            }
                        </div>
                    </div>
                )
            })
        }
    </div>
    )
}
