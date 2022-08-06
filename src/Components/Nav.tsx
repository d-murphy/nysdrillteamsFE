import * as React from "react";
import { useNavigate } from "react-router-dom";

export default function Nav() {
    let navigate = useNavigate();

    return (
        <div className="">
            <div className="">
                <div className="d-flex justify-content-center p-3 banner-bg">
                    <span><b>Congratualtions to the Bay Shore Jr Redskins!</b></span>
                </div>
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
                        onClick={() => navigate("/")}>Total Points</div>
                    <div 
                        className="d-flex justify-content-center text-center underline-hover mx-4 my-3 px-3 py-2"
                        onClick={() => navigate("/test")}>Past Seasons</div>
                    <div 
                        className="d-flex justify-content-center text-center underline-hover mx-4 my-3 px-3 py-2"
                        onClick={() => navigate("/test")}>About</div>
                </div>
            </div>
        </div>
    );
}