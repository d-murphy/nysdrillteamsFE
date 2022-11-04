import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginContext } from "../utils/context";
import AdminTeams  from "../Components/AdminTeams"; 
import AdminTracks from "../Components/AdminTracks";
import { Team, Track } from "../types/types"
import AdminTournaments from "../Components/AdminTournaments";

declare var SERVICE_URL: string;

export default function AdminHome() {
    let navigate = useNavigate();
    let [view, setView] = useState("Updates")
    let [teams, setTeams] = useState<Team[]>([])
    let [tracks, setTracks] = useState<Track[]>([])
    const { username, logout } = useLoginContext(); 

    useEffect(() => {
        getTeams()
        getTracks(); 
    }, [])

    function getTeams(){
        fetch(`${SERVICE_URL}/teams/getTeams`)
        .then(response => response.json())
        .then((data:Team[]) => {
            data = data.sort((a:Team,b:Team) => a.circuit == b.circuit ? 
                a.fullName.toLowerCase() < b.fullName.toLowerCase() ? -1 : 1 : 
                a.circuit < b.circuit ? -1 : 1
            )
            setTeams(data)    
        })
    
    }

    function getTracks(){
        fetch(`${SERVICE_URL}/tracks/getTracks`)
        .then(response => response.json())
        .then((data:Track[]) => {
            data = data.sort((a:Track,b:Track) => a.name < b.name ? -1 : 1)
            setTracks(data)    
            console.log(data); 
        })
    }



    // if(!username) return (
    //     <div className="container">
    //         This page is only for admin use.
    //     </div>
    // )

    return (
        <div className="container">
            <div className="row mt-2">
                <div className="col-1"></div>
                <div className="col-6 content-box">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <h3>Remember to turn username check back on</h3> 
                        <h4 className="mt-3">Notes</h4>
                        <ul>
                            <li>To add / edit runs, visit the tournament page.  An edit icon will appear when you're logged in.</li>
                            <li>A team will need to be entered into the tournament's running order before a run can be added.</li>
                        </ul>
                    </div>
                </div>
                <div className="col-4 content-box">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                        <div className="mt-5">User: {username}</div>
                        <div><button className="btn mx-2 my-2 py-2 login-button" onClick={() => logout()} >Log Out</button></div>
                    </div>
                </div>
                <div className="col-1"></div>
            </div>
            <div className="d-flex justify-content-center ">
                <div className="btn btn-light mx-2 my-5 py-2 admin-btn" onClick={() => {setView("Updates")}}>
                    Updates
                </div>
                <div className="btn btn-light mx-2 my-5 py-2 admin-btn" onClick={() => {setView("Teams")}}>
                    Teams
                </div>
                <div className="btn btn-light mx-2 my-5 py-2 admin-btn" onClick={() => {setView("Tracks")}}>
                    Tracks
                </div>
                <div className="btn btn-light mx-2 my-5 py-2 admin-btn" onClick={() => {setView("Tournaments")}}>
                    Tournaments
                </div>
            </div>
            <div className="">
                {
                    view == "Updates" ? <div>'Updates Placeholder'</div> : <></>
                }
                {
                    view == "Teams" ? <AdminTeams teams={teams} updateTeams={getTeams}/> : <></>
                }
                {
                    view == "Tracks" ? <AdminTracks tracks={tracks} updateTracks={getTracks}/> : <></>
                }
                {
                    view == "Tournaments" ? <AdminTournaments tracks={tracks}/> : <></>
                }
            </div>
        </div>

    );
}

