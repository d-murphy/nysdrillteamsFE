import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGet } from '../utils/network'; 

declare var SERVICE_URL: string;

export default function Nav() {
    let navigate = useNavigate();
    const [announcements, setAnnoucements] = useState([]); 

    useEffect(() => {
        console.log('getting announcements'); 
        fetchGet(`${SERVICE_URL}/announcements/getAnnouncements`)
            .then(data => data.json())
            .then(data => setAnnoucements(data))
    }, [])
    return (
        <div className="">
            <div className="banner">
                {
                announcements.length ? <div className="d-flex justify-content-center p-3 banner-bg">
                    <span><b dangerouslySetInnerHTML={{__html: announcements[0]}}></b></span>
                </div> : <></>
                }
            </div>
            <div className="nav-bg-color-dk">
                <div className="container d-flex justify-content-start p-4 "
                    onClick={() => navigate("/")}>
                    <img className="header-logo" src="/static/img/logo_onetone.png" />
                </div>
            </div>
            <div className="nav-bg-color">
                <div className="container d-flex flex-row align-items-end justify-content-end p-1 hover-nav-font-change ">
                    <div 
                        className="d-flex justify-content-center text-center underline-hover mx-4 my-3 px-3 py-2"
                        onClick={() => navigate("/Schedule")}>Schedule / Results</div>
                    <div 
                        className="d-flex justify-content-center text-center underline-hover mx-4 my-3 px-3 py-2"
                        onClick={() => navigate("/PastSeasons")}>Past Seasons</div>
                    <div 
                        className="d-flex justify-content-center text-center underline-hover mx-4 my-3 px-3 py-2"
                        onClick={() => navigate("/TopRunsAndSearch")}>Top Runs and Search</div>
                    <div 
                        className="d-flex justify-content-center text-center underline-hover mx-4 my-3 px-3 py-2"
                        onClick={() => navigate("/About")}>About</div>
                </div>
            </div>
        </div>
    );
}