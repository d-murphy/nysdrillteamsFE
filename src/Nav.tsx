import * as React from "react";

export default function Nav() {

    return (
        <div>
            <div className="row">
                NYS Drill Teams
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center p-5">
                    Live
                </div>
                <div className="col d-flex justify-content-center p-5">
                    Schedule / Results
                </div>
                <div className="col d-flex justify-content-center p-5">
                    Total Points
                </div>
                <div className="col d-flex justify-content-center p-5">
                    Past Season
                </div>
            </div>
        </div>
    );
}