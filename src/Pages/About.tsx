import * as React from "react";
import Footer from '../Components/Footer'; 

export default function About() {
    return (
        <div className="content">
            <div className="container">
                <div className="d-flex flex-column align-items-center justify-content-center my-3">
                    <h3 className="my-2">About the NYS FD Drill Teams</h3>
                    <p>For over 100 years, fire departments throughout New York State have competed against each other to measure their skills. 
                        As motor-driven firefighting equipment was introduced, firemen incorporated these vehicles into their events, 
                        alongside more traditional tests of stretching hose and hoisting ladders. 
                        These competitions have evolved into a terrific display of basic firefighting skills and teamwork, 
                        exhibitions that are one-of-a-kind around the world.
                    </p>
                    <h3 className="my-2">Mission Statement</h3>
                    <p>Drill teams are a vital component of the department they serve, with the specific purpose of providing the opportunity 
                        to hone basic firefighting proficiencies, develop and foster teamwork, build character, teach commitment and discipline, 
                        promote physical fitness and conditioning and attract and retain individuals in the volunteer fire service. 
                        These purposes are achieved through firematic competition which complements the fire department's primary 
                        function of emergency response to fires, medical emergencies, and other calamities. 
                        Drill teams consequently instill their members with a life-long commitment to serving 
                        their community as highly skilled volunteer firefighters.
                    </p>
                </div>
            </div>
            <Footer/>
        </div>
    );
}