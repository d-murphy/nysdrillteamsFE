import * as React from "react";
import Placeholder from "react-bootstrap/Placeholder"; 

export default function Big8ContestLoading() {

     return (
        <div className="col-xs-12 col-sm-3 col-xxl">
            <div className="big8-bg rounded shadow-sm w-100 py-1 px-2 h-100" > 
                <div className="row">
                    <Placeholder animation="glow" className="p-0 text-center">
                        <Placeholder xs={10} className="rounded" size="lg" bg="secondary"/>
                    </Placeholder>
                </div>
                <div className="placeholder-glow d-flex justify-content-center align-items-center">
                    <div className="image-wrap-sm placeholder bg-secondary mt-3 mb-5 rounded"></div>
                </div>
                <div className="row">
                    <Placeholder animation="glow" className="p-0 text-center">
                        <Placeholder xs={10} className="rounded" size="xs" bg="secondary"/>
                    </Placeholder>
                </div>
                <div className="row">
                    <Placeholder animation="glow" className="p-0 text-center">
                        <Placeholder xs={10} className="rounded" size="xs" bg="secondary"/>
                    </Placeholder>
                </div>
            </div>

        </div>
        )
}


