import * as React from "react";
import { useNavigate } from "react-router-dom";

export default function Nav() {
    let navigate = useNavigate();

    return (
        <div className="footer-bg footer">
            <div className="d-flex justify-content-end p-3 ">
                <span className="underline-hover"  onClick={() => navigate("/login")}>Admins</span>
            </div>
        </div>
    );
}