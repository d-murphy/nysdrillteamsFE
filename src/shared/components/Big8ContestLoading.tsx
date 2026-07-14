import * as React from "react";
import Placeholder from "react-bootstrap/Placeholder";

export default function Big8ContestLoading() {
    return (
        <div className="col-6 col-md-3">
            <div className="big8-tile h-100">
                <Placeholder animation="glow" className="w-100 mb-2">
                    <Placeholder className="rounded w-75" bg="secondary" />
                </Placeholder>
                <Placeholder animation="glow" className="w-100 mb-3">
                    <Placeholder className="rounded w-50" style={{ height: "1.5rem" }} bg="secondary" />
                </Placeholder>
                <div className="d-flex align-items-center gap-2">
                    <div className="image-wrap-sm placeholder bg-secondary rounded" />
                    <Placeholder animation="glow" className="flex-grow-1">
                        <Placeholder className="rounded w-100" bg="secondary" />
                    </Placeholder>
                </div>
            </div>
        </div>
    );
}
