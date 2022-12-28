import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginContext } from "../utils/context";
import AdminTeams  from "../Components/AdminTeams"; 
import AdminTracks from "../Components/AdminTracks";
import { Team, Track } from "../types/types"
import AdminTournaments from "../Components/AdminTournaments";
import AdminUpdates from "../Components/AdminUpdates"; 
import AdminAnnouncements from "../Components/AdminAnnouncements"; 
import AdminUsers from '../Components/AdminUsers'; 

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
            data = data.sort((a:Team,b:Team) => !a.fullName ? -1 : !b.fullName ? 1 : a.fullName.toLowerCase() < b.fullName.toLowerCase() ? -1 : 1 )
            setTeams(data)    
        })
        .catch(e => {
            console.log("Error getting teams: ", e); 
            setView("ErrorMsg"); 
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
        .catch(e => {
            console.log("Error getting tracks: ", e); 
            setView("ErrorMsg"); 
        })
    }



    if(!username) return (
        <div className="container d-flex align-items-center justify-content-center p-5">
            <h4>Sorry, you must login.</h4>
        </div>
    )

    return (
        <div className="container">
            <div className="content-box">
                <div className="row mt-2">
                    <div className="col-2 "></div>
                    <div className="col-8 d-flex flex-column align-items-center justify-content-center">
                        <h4 className="mt-3">Admin Home</h4>
                        <h6 className="my-2">Welcome, {username}.  Thanks for helping with this project.</h6>
                    </div>
                    <div className="col-2 d-flex flex-column align-items-center justify-content-center">
                        <button className="btn mx-2 my-2 py-2 login-button" onClick={() => logout()} >Log Out</button>
                    </div>
                </div>
                <div className="m-3">
                    <p>A few things to keep in mind as you work with the site: </p>
                    <ul>
                        <li>This DB is becoming THE history for our game.  Let's take good care of it!  Please be professional as you make and edit entries.</li>
                        <li>On the Updates tab, you'll see changes you and other users are making.  This offers an opportunity to review changes and should keep everyone honest.</li>
                        <li>Of course even with these gaurdrails, you could still figure out ways to do dumb things.</li>
                        <ul>
                            <li>For instance, no one is checking the video links.  If you send people to something inappropriate, it'll just make us all look bad.  Don't do that and be careful.</li>
                        </ul>
                        <li>If you're not super comfortable with something, feel free to ask.</li>
                    </ul>
                    <p>Instructions / FYI:</p>
                </div>

                <div className="row">
                    {
                        view == "ErrorMsg" ? <></> : 
                            <div className=" d-flex flex-row justify-content-center align-items-center flex-wrap my-5">
                                <button className="btn btn-light mx-2 my-2 py-2 admin-btn" onClick={() => {setView("Updates")}}>
                                    Updates
                                </button>
                                <button className="btn btn-light mx-2 my-2 py-2 admin-btn" onClick={() => {setView("Teams")}}>
                                    Teams
                                </button>
                                <button className="btn btn-light mx-2 my-2 py-2 admin-btn" onClick={() => {setView("Tracks")}}>
                                    Tracks
                                </button>
                                <button className="btn btn-light mx-2 my-2 py-2 admin-btn" onClick={() => {setView("Tournaments")}}>
                                    Tournaments
                                </button>
                                <button className="btn btn-light mx-2 my-2 py-2 admin-btn" onClick={() => {setView("Announcements")}}>
                                    Announcements
                                </button>
                                <button className="btn btn-light mx-2 my-2 py-2 admin-btn" onClick={() => {setView("Users")}}>
                                    Users
                                </button>
                            </div>
                    }
                </div>

            </div>
            <div className="content-box my-2 p-3 container">
                {
                    view == "Updates" ? <AdminUpdates /> : <></>
                }
                {
                    view == "Teams" ? <AdminTeams teams={teams} updateTeams={getTeams}/> : <></>
                }
                {
                    view == "Tracks" ? <AdminTracks tracks={tracks} updateTracks={getTracks}/> : <></>
                }
                {
                    view == "Tournaments" ? <AdminTournaments tracks={tracks} teams={teams}/> : <></>
                }
                {
                    view == "Announcements" ? <AdminAnnouncements /> : <></>
                }
                {
                    view == "Users" ? <AdminUsers /> : <></>
                }
                {
                    view == "ErrorMsg" ? <div>Sorry, an error occurred.  Please try again later.</div> : <></>
                }
            </div>
        </div>

    );
}

