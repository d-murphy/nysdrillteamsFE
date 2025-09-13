import React from "react";
import { Link } from "react-router-dom";
import useProjectionYears from "../../hooks/useProjectionYears";




export default function ProjectionsHome() {

    const { data, isLoading, isError, error } = useProjectionYears();

    return (
        <div className='container'>
            <div className="text-center w-100 font-x-large my-3"><b>State Tournament Projections</b></div>
            <div className='row shadow-sm rounded py-4 bg-white mx-1'>
                <p>Select a year to view the projections for the state tournament.</p>
                <div className="row g-2 w-100">

                    {isLoading && <div className="text-center w-100">Loading...</div>}
                    {isError && <div className="text-center w-100">Error: {error?.message}</div>}

                    {data?.map((el: number) => {
                        return (
                            <Link
                                to={`/simulation/projections/${el}`}
                                className="video-links pointer  col-1"
                                >
                                    <div className="text-center w-100">{el}</div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}