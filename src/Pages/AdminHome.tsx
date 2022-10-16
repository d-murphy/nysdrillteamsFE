import * as React from "react";
import { useNavigate } from "react-router-dom";
import { fetchPost } from "../utils/network";


export default function AdminHome() {
    let navigate = useNavigate();


    return (
        <div className="container">
            <div className="row mt-2">
                <div className="col-1"></div>
                <div className="col-6 content-box">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <h4 className="mt-3">Notes</h4>
                        <ul>
                            <li>To add / edit runs, visit the tournament page.  An edit icon will appear when you're logged in.</li>
                            <li>A team will need to be entered into the tournament's running order before a run can be added.</li>
                        </ul>
                    </div>
                </div>
                <div className="col-4 content-box">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <div className="mt-5">User: XXXXXX</div>
                        <div><button className="btn mx-2 my-2 py-2 login-button" >Log Out</button></div>
                    </div>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="d-flex justify-content-center ">
                <div className="btn btn-light mx-2 my-5 py-2 admin-btn" onClick={() => {navigate(`/EditTeams`)}}>
                    Edit Teams
                </div>
                <div className="btn btn-light mx-2 my-5 py-2 admin-btn" onClick={() => {navigate(`/EditTracks`)}}>
                    Edit Tracks
                </div>
                <div className="btn btn-light mx-2 my-5 py-2 admin-btn" onClick={() => {navigate(`/EditTourns`)}}>
                    Edit Tournaments
                </div>
            </div>
            <div className="d-flex justify-content-center my-5">
                <h4>Recent Updates to Past Seasons</h4>
            </div>
        </div>

    );
}