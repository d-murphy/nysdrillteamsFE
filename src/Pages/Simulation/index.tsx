import React from "react";
import Button from "../../Components/Button";
import { useNavigate } from "react-router-dom";



export default function Simulation() {

    const navigate = useNavigate(); 

    return (
        <div className='container'>
            <div className="text-center w-100 font-x-large my-3"><b>Simulation Engine</b></div>
            <div className='row shadow-sm rounded py-4 bg-white mx-1'>
                <p>Using the run database, we created a simulation engine allowing several fun applications for drill team fans.</p>
                <p>This section of the site is a bit speculative.  
                    It suggests a GOAT and makes the case for which teams are the strongest, 
                    but is not meant to be a conclusive list.  
                    We hope it celebrates our past winners, spotlights several teams 
                    who sometimes get overlooked and provides a bit of fun during the long offseason. 
                </p>
                <div className="d-flex justify-content-center align-items-center w-100 mt-5">
                    <Button className="mx-2" text="State Tournament Projections" onClick={() => navigate("/Simulation/Projections")} />
                    <Button className="mx-2" text="Heavy Favorites and Longshots" onClick={() => navigate("/Simulation/Favorites")} />
                    <Button className="mx-2" text="The GOAT Tournament" onClick={() => navigate("/Simulation/Goat")} />
                    <Button className="mx-2" text="Fantasy Racing" onClick={() => navigate("/Simulation/Fantasy")} />
                </div>
            </div>


            <div>
                Should you use the radar charts somewhere?  
                They could even go on the Team Summary page.  
            </div>
        </div>
    )
}



