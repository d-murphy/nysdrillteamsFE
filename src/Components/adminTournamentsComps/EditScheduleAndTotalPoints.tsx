import React from 'react'; 
import { Tournament } from "../../types/types"

interface EditScheduleAndTotalPointsProps {
    isAdmin: boolean, 
    tournInReview: Tournament, 
    handleCheck: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function EditScheduleAndTotalPoints(props:EditScheduleAndTotalPointsProps) {
    const isAdmin = props.isAdmin; 
    const tournInReview = props.tournInReview; 
    const handleCheck = props.handleCheck

    return (
        <>
        <div className="row my-3 pt-2 border-top">
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Nassau Points?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="nassauPoints" name="nassauPoints" checked={tournInReview?.nassauPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Northern Points?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="northernPoints" name="northernPoints" checked={tournInReview?.northernPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Suffolk Points?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="suffolkPoints" name="suffolkPoints" checked={tournInReview?.suffolkPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Western Points?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="westernPoints" name="westernPoints" checked={tournInReview?.westernPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Jr Points?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="juniorPoints" name="juniorPoints" checked={tournInReview?.juniorPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Nassau OF Points?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="nassauOfPoints" name="nassauOfPoints" checked={tournInReview?.nassauOfPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Suffolk OF Points?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="suffolkOfPoints" name="suffolkOfPoints" checked={tournInReview?.suffolkOfPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">LI OF Points?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="liOfPoints" name="liOfPoints" checked={tournInReview?.liOfPoints} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
        </div>
        <div className="row my-3 pt-2 border-top">
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Nassau Schedule?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="nassauSchedule" name="nassauSchedule" checked={tournInReview?.nassauSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Northern Schedule?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="northernSchedule" name="northernSchedule" checked={tournInReview?.northernSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Suffolk Schedule?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="suffolkSchedule" name="suffolkSchedule" checked={tournInReview?.suffolkSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Western Schedule?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="westernSchedule" name="westernSchedule" checked={tournInReview?.westernSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">Jr Schedule?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="juniorSchedule" name="juniorSchedule" checked={tournInReview?.juniorSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
            <div className="col d-flex flex-column align-items-center justify-content-between">
                <div className="text-center">OF Schedule?</div>
                <div>
                    <input className="form-check-input" type="checkbox" id="liOfSchedule" name="liOfSchedule" checked={tournInReview?.liOfSchedule} onChange={handleCheck} disabled={!isAdmin}></input>
                </div>
            </div>
        </div>
        </>
    )
}
