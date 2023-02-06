import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGet } from '../utils/network'; 
import Image from "react-bootstrap/Image";


declare var SERVICE_URL: string;

export default function Nav() {
    let navigate = useNavigate();
    const [announcements, setAnnoucements] = useState([]); 

    useEffect(() => {
        fetchGet(`${SERVICE_URL}/announcements/getAnnouncements`)
            .then(data => data.json())
            .then(data => setAnnoucements(data))
            .catch(e => {
                console.log("Error retrieving announcements: ", e); 
            })   
    }, [])
    return (
        <div className="">
            <div className="banner text-center">
                {
                announcements.length ? <div className="d-flex justify-content-center p-3 banner-bg">
                    <span><b dangerouslySetInnerHTML={{__html: announcements[0]}}></b></span>
                </div> : <></>
                }
            </div>
            <div className="nav-bg-color-dk">
                <div className="container d-flex justify-content-start p-4 "
                    onClick={() => navigate("/")}>
                    <div className="header-logo">
                        <Image fluid src="/static/img/logo_onetone.png" />                    
                    </div>
                </div>
            </div>
            <div className="nav-bg-color">
                <div className="container hover-nav-font-change ">
                    <div className="row">

                        <div className="col-xl-2"></div>
                        <div className="col-12 col-md-3 col-xl-2 d-flex justify-content-center text-center">
                            <div 
                                className=" underline-hover my-3 px-1 py-2"
                                onClick={() => navigate("/Schedule")}>Schedule / Results</div>                            
                        </div>
                        <div className="col-12 col-md-3 col-xl-2 d-flex justify-content-center text-center ">
                            <div 
                                className="underline-hover my-3 px-1 py-2"
                                onClick={() => navigate("/PastSeasons")}>Past Seasons</div>
                        </div>
                        <div className="col-12 col-md-3 col-xl-2 d-flex justify-content-center text-center">
                            <div 
                                className="underline-hover my-3 px-1 py-2"
                                onClick={() => navigate("/TopRunsAndSearch")}>Top Runs and Search</div>
                        </div>
                        <div className="col-12 col-md-3 col-xl-2 d-flex justify-content-center">
                            <div 
                                className="text-center underline-hover my-3 px-1 py-2"
                                onClick={() => navigate("/About")}>About</div>
                        </div>
                        <div className="col-xl-2"></div>

                    </div>
                </div>
            </div>
        </div>
    );
}