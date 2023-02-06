import * as React from "react";
import Placeholder from "react-bootstrap/Placeholder"; 

export default function Big8ContestLoading() {

     return (
        <div className="col-xs-12 col-sm-3 col-xxl">
            <div className="big8-bg rounded w-100 py-1 px-2 h-100" > 
                <div className="row">
                    <Placeholder animation="glow" className="p-0 text-center">
                        <Placeholder xs={10} className="rounded" size="lg" />
                    </Placeholder>
                </div>
                <div className="image-wrap-md"></div>
                <div className="row">
                    <Placeholder animation="glow" className="p-0 text-center">
                        <Placeholder xs={10} className="rounded" size="sm" />
                    </Placeholder>
                </div>
            </div>

        </div>
        )
}


