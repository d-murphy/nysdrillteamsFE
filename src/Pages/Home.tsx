import * as React from "react";
import Big8 from "../Components/Big8";
import UpcomingEvents from "../Components/UpcomingEvents"; 
import { Link } from "react-router-dom";

export default function Home() {


    const year = new Date() < new Date(`5/30/${new Date().getFullYear()}`) ? new Date().getFullYear() -1  : new Date().getFullYear(); 

    return (
        <div className="container">
            <div className="row">
                <Big8 />
            </div>
            <div className="row mt-3">
                <div className="col-12">
                    <div className="d-flex flex-column align-items center py-3 m-2">
                        <h4>Upcoming Events</h4>
                        <UpcomingEvents year={new Date().getFullYear()} />
                    </div>
                </div>
            </div>
        </div>
    );
}