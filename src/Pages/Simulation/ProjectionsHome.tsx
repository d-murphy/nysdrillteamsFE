import React from "react";
import { Link } from "react-router-dom";
import useProjectionYears from "../../hooks/simulation/useProjectionYears";




export default function ProjectionsHome() {

    const { data, isLoading, isError, error } = useProjectionYears();

    return (
        <div className='container'>
            <div className="text-center w-100 font-x-large my-3"><b>State Tournament Projections</b></div>
            <div className='row shadow-sm rounded py-4 bg-white mx-1'>
                <div className="px-4 w-100">

                    <p>The state tournament comes around just once in a season - just one roll of the dice.</p>
                    <p>What if we could re-run that state tournament?  Using the simulation engine, we run repeated drills to see how frequently teams would win or place in the top five.  It gives a measure of likelihood to see who were the biggest favorites and longshot winners in racing history.</p>
                    <p>Its not perfect - team rosters change, injuries and breakdowns happen which would impact these estimates.  But hopefully its a fun way to explore and reconsider what might have been...</p>
                </div>
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