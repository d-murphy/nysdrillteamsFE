import * as React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchGet } from '../utils/network'; 
import Image from "react-bootstrap/Image";
import { Collapse } from "react-bootstrap";


declare var SERVICE_URL: string;

export default function Nav() {
    let navigate = useNavigate();
    const [announcements, setAnnoucements] = useState([]); 
    const [dropdownOpen, setDropdownOpen] = useState(false); 
    const [collapseOpen, setCollapseOpen] = useState(true);

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
            <div className="nav-bg-color-dk" onClick={() => {setDropdownOpen(false); setCollapseOpen(false)}}>
                <div className="container d-flex justify-content-start p-4 "
                    onClick={() => navigate("/")}>
                    <div className="header-logo">
                        <Image fluid src="/static/img/logo_onetone.png" />                    
                    </div>
                </div>
            </div>

            {/* mobile nav */}
            <nav className="nav-bg-color d-block d-md-none">
                <nav className="navbar navbar-dark nav-bg-color" onClick={() => {setDropdownOpen(false); setCollapseOpen(!collapseOpen)}}>
                    <div className="container-fluid">
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                        </button>
                    </div>
                </nav>

                <Collapse in={collapseOpen}>
                    <div className="nav-bg-color px-4 pb-4">


                        <div className="container hover-nav-font-change ">
                            <div className="row">

                                <div className="col-12 d-flex justify-content-center text-center" onClick={() => setDropdownOpen(false)}>
                                    <div 
                                        className=" underline-hover my-3 px-1 py-2"
                                        onClick={() => {navigate("/Schedule"); setCollapseOpen(false)}}>Schedule / Results</div>                            
                                </div>
                                <div className="col-12 d-flex justify-content-center text-center " onClick={() => setDropdownOpen(false)}>
                                    <div 
                                        className="underline-hover my-3 px-1 py-2"
                                        onClick={() => {navigate("/PastSeasons"); setCollapseOpen(false)}}>Past Seasons</div>
                                </div>
                                <div className="col-12 d-flex justify-content-center text-center position-relative">
                                    <div 
                                        className="underline-hover my-3 px-1 py-2"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}>
                                            Stats Central
                                    </div>
                                    {
                                        dropdownOpen ? 
                                        <div className="position-absolute dropdown-pos-top start-25 bg-white border border-1 rounded py-2 px-4" onClick={() => setDropdownOpen(false)}>
                                            <div className="my-2">
                                                <Link className="video-links " to="/locations" onClick={() => setCollapseOpen(false)}>Locations</Link>
                                            </div>
                                            <div className="my-2">
                                                <Link className="video-links " to="/TeamSummaries" onClick={() => setCollapseOpen(false)}>Team Seasons</Link>
                                            </div>
                                            <div className="my-2">
                                                <Link className="video-links " to="/TeamHistory" onClick={() => setCollapseOpen(false)}>Team Histories</Link>
                                            </div>
                                            <div className="my-2 ">
                                                <Link className="video-links " to="/TotalPoints" onClick={() => setCollapseOpen(false)}>Total Points</Link>
                                            </div>
                                            <div className="my-2 ">
                                                <Link className="video-links" to="/TopRuns" onClick={() => setCollapseOpen(false)}>Top Runs</Link>
                                            </div>
                                            <div className="my-2 "> 
                                                <Link className="video-links" to="/RunSearch" onClick={() => setCollapseOpen(false)}>Run Search</Link>
                                            </div>
                                        </div> : <></>
                                    }

                                </div>
                                <div className="col-12 d-flex justify-content-center" onClick={() => setDropdownOpen(false)}>
                                    <div 
                                        className="text-center underline-hover my-3 px-1 py-2"
                                        onClick={() => {navigate("/About"); setCollapseOpen(false)}}>About</div>
                                </div>

                            </div>
                        </div>



                    </div>
                </Collapse>
            </nav>


            {/* desktop nav */}
            <nav className="nav-bg-color d-md-block d-none">
                <div className="container hover-nav-font-change "  >
                    <div className="row">

                        <div className="col-xl-2" onClick={() => setDropdownOpen(false)}></div>
                        <div className="col-md-3 col-xl-2 d-flex justify-content-center text-center" onClick={() => setDropdownOpen(false)}>
                            <div 
                                className=" underline-hover my-3 px-1 py-2"
                                onClick={() => {navigate("/Schedule")}}>Schedule / Results</div>                            
                        </div>
                        <div className="col-md-3 col-xl-2 d-flex justify-content-center text-center " onClick={() => setDropdownOpen(false)}>
                            <div 
                                className="underline-hover my-3 px-1 py-2"
                                onClick={() => {navigate("/PastSeasons")}}>Past Seasons</div>
                        </div>
                        <div className="col-md-3 col-xl-2 d-flex justify-content-center text-center position-relative">
                            <div className="underline-hover my-3 px-1 py-2 " onClick={() => setDropdownOpen(!dropdownOpen)}>
                                Stats Central
                            </div>
                            {
                                dropdownOpen ? 
                                <div className="position-absolute dropdown-pos-top start-25 bg-white border border-1 rounded py-2 px-4 shadow-sm" onClick={() => setDropdownOpen(false)}>
                                    <div className="my-2">
                                        <Link className="video-links " to="/Locations">Locations</Link>
                                    </div>
                                    <div className="my-2">
                                        <Link className="video-links " to="/TeamSummaries">Team Seasons</Link>
                                    </div>
                                    <div className="my-2">
                                        <Link className="video-links " to="/TeamHistory">Team Histories</Link>
                                    </div>
                                    <div className="my-2 ">
                                        <Link className="video-links " to="/TotalPoints">Total Points</Link>
                                    </div>
                                    <div className="my-2 ">
                                        <Link className="video-links" to="/TopRuns">Top Runs</Link>
                                    </div>
                                    <div className="my-2 "> 
                                        <Link className="video-links" to="/RunSearch">Run Search</Link>
                                    </div>
                                </div> : <></>

                            }
                        </div>

                        <div className="col-md-3 col-xl-2 d-flex justify-content-center" onClick={() => setDropdownOpen(false)}>
                            <div 
                                className="text-center underline-hover my-3 px-1 py-2"
                                onClick={() => {navigate("/About")}}>About</div>
                        </div>
                        <div className="col-xl-2" onClick={() => setDropdownOpen(false)}></div>

                    </div>
                </div>
            </nav>


        </div>
    );
}