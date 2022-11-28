import React, {useState} from 'react'; 
import { Tournament, Team, Run } from "../../types/types"
import dateUtil from '../../utils/dateUtils';
import RunVideos from './RunVideos'; 
import { fetchPost } from "../../utils/network"; 
import { useLoginContext } from "../../utils/context";

interface EditRunsFormProps {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    teams: Team[], 
    runsEditContest: string, 
    reqSubmitted: boolean, 
    setReqSubmitted: React.Dispatch<React.SetStateAction<boolean>>
    runInReview: Run, 
    setRunInReview: React.Dispatch<React.SetStateAction<Run>>, 
    getRunsForTourn: Function
    reqResult: {error: boolean, message:string}, 
    setReqResult: React.Dispatch<React.SetStateAction<{error: boolean, message:string}>>
}

declare var SERVICE_URL: string;

export default function RunsEditForm(props:EditRunsFormProps) {
    const isAdmin = props.isAdmin; 
    const reqSubmitted = props.reqSubmitted; 
    const setReqSubmitted = props.setReqSubmitted; 
    const runInReview = props.runInReview; 
    const setRunInReview = props.setRunInReview; 
    const getRunsForTourn = props.getRunsForTourn; 
    const tournInReview = props.tournInReview; 
    const reqResult = props.reqResult; 
    const setReqResult = props.setReqResult; 
    const [showingDeleteWarning, setShowingDeleteWarning] = useState(false)
    const { sessionId } = useLoginContext(); 

    function handleTextInput(e:React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>){
        setRunInReview({
            ...runInReview, 
            [e.target.id]: e.target.value
        })
    }

    function handleTimeChange(e:React.ChangeEvent<HTMLInputElement>){
        setRunInReview({
            ...runInReview, 
            time: e.target.value, 
            timeNum: parseFloat(e.target.value)
        })
    }

    function handlePointsChange(e:React.ChangeEvent<HTMLInputElement>){
        setRunInReview({
            ...runInReview, 
            points: parseFloat(e.target.value)
        })
    }

    function handleCheck(e:React.ChangeEvent<HTMLInputElement>){
        setRunInReview({
            ...runInReview, 
            [e.target.id]: e.target.checked
        })
    }

    function handleSelect(e:React.ChangeEvent<HTMLSelectElement>){
        setRunInReview({
            ...runInReview, 
            [e.target.id]: e.target.value
        })
    }

    async function tryDelete(){
        if(!setShowingDeleteWarning) return setShowingDeleteWarning(true); // first display confirm message to user
        try {
            setReqSubmitted(true); 
            await fetchPost(`${SERVICE_URL}/runs/deleteRun`, {runId: runInReview._id}, sessionId)
            setReqResult({error: false, message: "Record deleted successfully."}); 
            setRunInReview(null); 
            setReqSubmitted(false); 
            getRunsForTourn(tournInReview._id) 
        } catch {
            setReqSubmitted(false); 
            setReqResult({error: true, message: "Error deleting record."}); 
        }
        setShowingDeleteWarning(false);
    }

    async function trySave(){
        try {
            setReqSubmitted(true); 
            await fetchPost(`${SERVICE_URL}/runs/insertRun`, {runsData: runInReview}, sessionId)
            setReqResult({error: false, message: "Record saved successfully."}); 
            setReqSubmitted(false); 
            getRunsForTourn(tournInReview._id) 
        } catch {
            setReqSubmitted(false); 
            setReqResult({error: true, message: "Error deleting record."}); 
        }
    }

    return (
        reqSubmitted ? <div>Loading... </div> : 
        // runDeleted ? <div>Run Deleted</div> : 
        !runInReview ? <div>Select a Run</div> : 
        <div className=''>
            <div className="row my-3 width-100">
                <div className="col-2 text-center">Team</div>
                <div className="col-4 text-center px-4">{runInReview.team}</div>
                <div className="col-2 text-center">Time</div>
                <div className="col-4 text-center px-4">
                    <input 
                        id="time" 
                        value={runInReview.time} 
                        className="text-center width-100 p-1" 
                        disabled={!isAdmin}
                        autoComplete="off" 
                        onChange={(e) => handleTimeChange(e)}></input>
                </div>
            </div>
            <div className='row my-3 width-100'>
                <div className="col-2 text-center">Tournament</div>
                <div className="col-4 text-center px-4">{runInReview.tournament}</div>
                <div className="col-2 text-center">Track</div>
                <div className="col-4 text-center px-4">{runInReview.track}</div>
            </div>
            <div className='row my-3 width-100'>
                <div className="col-2 text-center">Running Position</div>
                <div className="col-4 text-center px-4">{runInReview.runningPosition}</div>
                <div className="col-2 text-center">Date</div>
                <div className="col-4 text-center px-4">{dateUtil.getMMDDYYYY(runInReview.date)}</div>
            </div>
            <div className="row my-1 width-100">
                <div className="col-2 text-center">Place</div>
                <div className="col-4 text-center px-4">
                    <select id="rank" onChange={(e) => handleSelect(e)} className="width-100 text-center p-1 " value={runInReview.rank} disabled={!isAdmin}>
                        <option value={""}>Did not place</option>
                        <option value={"1"}>1st Place</option>
                        <option value={"2"}>2nd Place</option>
                        <option value={"3"}>3rd Place</option>
                        <option value={"4"}>4th Place</option>
                        <option value={"5"}>5th Place</option>
                    </select>
                </div>
                <div className="col-2 text-center">Points</div>
                <div className="col-4 text-center px-4">
                    <input 
                        id="points" 
                        value={runInReview.points} 
                        className="text-center width-100 p-1" 
                        disabled={!isAdmin}
                        autoComplete="off" type="number" step=".01"
                        onChange={(e) => handlePointsChange(e)}></input>
                </div>
            </div>
            <div className="row my-3 width-100 border-top pt-2 mx-1">
                <div className="col-6 ">
                    <div className='mx-3 text-center'>State Record</div>
                    <div className='text-center width-100'>
                        <input className="form-check-input " type="checkbox" id="stateRecord" name="stateRecord" checked={runInReview?.stateRecord} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col-6 ">
                    <div className='mx-3 text-center'>Current State Record</div>
                    <div className='text-center width-100'>
                        <input className="form-check-input" type="checkbox" id="currentStateRecord" name="currentStateRecord" checked={runInReview?.currentStateRecord} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
            </div>
            <div className="row my-1 width-100 border-top pt-4 mx-1">
                <div className="col-2 d-flex align-items-center justify-content-center text-center">Recordkeeping Notes</div>
                <div className="col-4 d-flex align-items-center justify-content-center ">
                    <textarea className='width-100' id="notes" name="notes" onChange={handleTextInput} value={runInReview.notes}/>
                </div>
                <RunVideos runInReview={runInReview} setRunInReview={setRunInReview}/>
            </div>
            <div className='row pt-1 mt-3 mx-1 border-top'>
                <div className='mt-2'><b>Advanced Settings</b></div>
                <div><i>The following fields are pre-populated based on selections made in tournament page.  You should NOT need to make changes in this section, but you can if necessary.</i></div>
            </div>
            <div className="row my-1 width-100">
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">Nassau Points?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="nassauPoints" name="nassauPoints" checked={runInReview.nassauPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">Northern Points?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="northernPoints" name="northernPoints" checked={runInReview.northernPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">Suffolk Points?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="suffolkPoints" name="suffolkPoints" checked={runInReview.suffolkPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">Western Points?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="westernPoints" name="westernPoints" checked={runInReview.westernPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">Jr Points?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="juniorPoints" name="juniorPoints" checked={runInReview.juniorPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">Nassau OF Points?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="nassauOfPoints" name="nassauOfPoints" checked={runInReview.nassauOfPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">Suffolk OF Points?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="suffolkOfPoints" name="suffolkOfPoints" checked={runInReview.suffolkOfPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">LI OF Points?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="liOfPoints" name="liOfPoints" checked={runInReview.liOfPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
                <div className="col d-flex flex-column align-items-center justify-content-between mt-3">
                    <div className="text-center">Sanctioned?</div>
                    <div>
                        <input className="form-check-input" type="checkbox" id="sanctioned" name="sanctioned" checked={runInReview.sanctioned} onChange={handleCheck} disabled={!isAdmin}></input>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='d-flex justify-content-center align-items-center'>
                    {showingDeleteWarning ? <>Are you sure you want to delete?</> : <></>}
                </div>
                <div className={reqResult.error ? "text-danger" : "text-success"}>
                    {reqResult.message ? <div>{reqResult.message}</div> : <></>}
                </div>
            </div>
            <div className="row mb-3 mt-5 width-100">
                <div className='d-flex justify-content-center align-items-center'>
                    <button type="button" className="btn btn-success mx-2" data-bs-dismiss="modal" onClick={trySave}>Save</button>
                    <button type="button" className="btn btn-danger mx-2" data-bs-dismiss="modal" disabled={!isAdmin} onClick={tryDelete} >Delete Run</button>
                </div>
            </div>
        </div>
    )
}
