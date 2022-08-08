import * as React from "react";
import Big8 from "../Components/Big8";
import UpcomingEvents from "../Components/UpcomingEvents"; 

export default function Home() {




    return (
        <div className="container">
            <div className="row">
                <Big8 />
            </div>
            <div className="row mt-3">
                <div className="col-8">
                    <div className="d-flex flex-column align-items center py-3 m-2">
                        <h4>Upcoming Events</h4>
                        <UpcomingEvents year={new Date().getFullYear()} />
                    </div>
                </div>
            </div>
        </div>
    );
}