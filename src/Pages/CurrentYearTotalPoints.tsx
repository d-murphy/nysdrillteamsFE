import * as React from "react";
import TotalPoints from "../shared/components/TotalPoints";

export default function CurrentYearTotalPoints() {
    const year =
        new Date() < new Date(`5/30/${new Date().getFullYear()}`)
            ? new Date().getFullYear() - 1
            : new Date().getFullYear();

    return (
        <div className="container mb-3">
            <div className="text-center w-100 fs-4 my-3">
                <b>Total Points for {year}</b>
            </div>
            <TotalPoints year={year} headingAligned={false} />
        </div>
    );
}
