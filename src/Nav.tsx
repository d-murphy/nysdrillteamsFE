import * as React from "react";
import { useNavigate } from "react-router-dom";

export default function Nav() {
    let navigate = useNavigate();

    return (
        <div className="">
            <div className="row d-flex justify-content-center p-4 header-bg">
                <img className="header-logo" src="./static/img/logo_nysdt-3d.1.png" />
            </div>
            <div className="row p-1 nav-bg-color hover-nav-font-change">
                <div className="col">&nbsp;</div>
                <div 
                    className="col d-flex justify-content-center text-center underline-hover mx-2 py-2" 
                    onClick={() => navigate("/test")}>Live</div>
                <div 
                    className="col d-flex justify-content-center text-center underline-hover mx-2 py-2"
                    onClick={() => navigate("/Schedule")}>Schedule / Results</div>
                <div 
                    className="col d-flex justify-content-center text-center underline-hover mx-2 py-2"
                    onClick={() => navigate("/")}>Total Points</div>
                <div 
                    className="col d-flex justify-content-center text-center underline-hover mx-2 py-2"
                    onClick={() => navigate("/test")}>Past Seasons</div>
                <div className="col">&nbsp;</div>
            </div>
        </div>
    );
}