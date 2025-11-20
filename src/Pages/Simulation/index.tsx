import React from "react";
import Button from "../../Components/Button";
import { useNavigate } from "react-router-dom";



export default function Simulation() {

    const navigate = useNavigate(); 

    return (
        <div className='container'>
            <div className="text-center w-100 font-x-large my-3"><b>For a little fun...</b></div>
            <div className='row shadow-sm rounded py-4 bg-white mx-1'>
                <div className="px-3 w-100">
                    <p>This section of the site asks "what if..."  What if we could re-run that state tournament?  What if we could have the all-time greats in one contest?  
                    Using the run database, we created a simulation engine to give us a taste of how that might play out.</p>
                    <p>This is all a bit speculative.  Its not meant to be a conclusive list,
                        but a fun way to recognize many of the best teams including several who sometimes get overlooked.
                    </p>
                    <p>And there's fantasy racing too!  Compete against other racing fans drafting your favorite big 8 to run a simulated drill and test your racing IQ.</p>
                </div>
                <div className="d-none d-md-flex d-flex justify-content-center align-items-center w-100 mt-5">
                    <Button className="mx-2" text="State Tournament Projections" onClick={() => navigate("/Simulation/Projections")} />
                    {/* <Button className="mx-2" text="The GOAT Tournament" onClick={() => navigate("/Simulation/Goat")} /> */}
                    <Button className="mx-2" text="Fantasy Racing" onClick={() => navigate("/Simulation/Fantasy")} />
                </div>
                <div className="d-flex flex-column align-items-center d-md-none w-100 mt-5">
                    <Button className="mx-2" text="State Tournament Projections" onClick={() => navigate("/Simulation/Projections")} />
                    {/* <Button className="mx-2" text="The GOAT Tournament" onClick={() => navigate("/Simulation/Goat")} /> */}
                    <Button className="mx-2" text="Fantasy Racing" onClick={() => navigate("/Simulation/Fantasy")} />
                </div>
            </div>
        </div>
    )
}



