import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTiktok, faInstagram, faTwitch, faTwitter, faYoutube} from "@fortawesome/free-brands-svg-icons"; 
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";


export default function About() {
    const navigate = useNavigate(); 
    return (
        <div className="container">
            <div className="d-flex flex-column align-items-start justify-content-center mt-3">
                <div className="w-100 mx-auto">
                    <Social />
                </div>
                <div className="bg-white p-4 mt-2 rounded shadow-sm"> 

                    <div className="border-bottom w-100 border-secondary">
                        <h3 className="my-2">About the NYS FD Drill Teams</h3>
                    </div>
                    <div>
                        <p>For over 100 years, fire departments throughout New York State have competed against each other to measure their skills. 
                            As motor-driven firefighting equipment was introduced, firemen incorporated these vehicles into their events, 
                            alongside more traditional tests of stretching hose and hoisting ladders. 
                            These competitions have evolved into a terrific display of basic firefighting skills and teamwork, 
                            exhibitions that are one-of-a-kind around the world.
                        </p>
                    </div>
                    <div className="border-bottom w-100 border-secondary">
                        <h3 className="my-2">Mission Statement</h3>
                    </div>
                    <div>
                        <p>Drill teams are a vital component of the department they serve, with the specific purpose of providing the opportunity 
                            to hone basic firefighting proficiencies, develop and foster teamwork, build character, teach commitment and discipline, 
                            promote physical fitness and conditioning and attract and retain individuals in the volunteer fire service. 
                            These purposes are achieved through firematic competition which complements the fire department's primary 
                            function of emergency response to fires, medical emergencies, and other calamities. 
                            Drill teams consequently instill their members with a life-long commitment to serving 
                            their community as highly skilled volunteer firefighters.
                        </p>
                    </div>
                    <div className="border-bottom w-100 border-secondary">
                        <h3 className="my-2">Site History</h3>
                    </div>
                    <div>
                        <p>
                            The site's original version was created in the 2000s by D.J. Kaan laying the groundwork for this extensive archive.  
                            In 2013, Jon Guevara and web development company 10zero6 created a new site and database to store the growing collection.  
                            This latest version developed by Dan Murphy launched in 2023.  
                            A team of scorekeepers record new events and continue to build out the archive including 
                            John Mahoney, Bill Callanan, Adam Kaelin, Matt Marra, Arty Murray and Gary Brower.  
                            An additional thanks is owed to all who have contributed scorecards from past seasons.  
                            Please get in touch if you have additional events to share. 
                        </p>
                    </div>
                    <div className="border-bottom w-100 border-secondary">
                        <h3 className="my-2">Media Committee</h3>
                    </div>
                    <div>
                        <p>
                            The NYS FD Drill Teams Media Committee is responsible for developing strategies to grow and enhance the sport.  
                            The group is tasked with sponsor acquisition, media relations, social media outreach, and an improved fan experience.  
                            For media inquires, reach out to&nbsp;
                            <a className="video-links" href="mailto:chrismurphy@nysfddrillteams.com">chrismurphy@nysfddrillteams.com</a>
                        </p>
                    </div>


                </div>
                <div className="bg-white p-4 my-2 rounded shadow-sm w-100 text-center"> 
                    <span className="pointer"  onClick={() => navigate("/login")}>
                        <FontAwesomeIcon icon={faLock} className="crud-links mx-1"/>
                        Admin Portal
                    </span>
                </div>

            </div>
        </div>
    );
}

export const Social = function(){
    return (
        <div className="bg-white rounded py-2 w-100 shadow-sm">
            <div className="w-100">
                <h5 className="my-2 text-center">
                    Follow the NYS FD Drill Teams
                </h5>
            </div>
            <div className="d-flex flex-row justify-content-center">
                <div>
                    <a href="https://www.facebook.com/groups/NYSDrillTeams/" target="_blank">
                        <FontAwesomeIcon icon={faFacebook} size="lg" className="pointer crud-links font-x-large p-2" />
                    </a>
                </div>
                <div>
                    <a href="https://www.instagram.com/nysfddrillteams/?hl=en" target="_blank">
                        <FontAwesomeIcon icon={faInstagram} size="lg" className="pointer crud-links font-x-large p-2" />
                    </a>
                </div>
                <div>
                    <a href="https://twitter.com/nysfddrillteams?lang=en" target="_blank">
                        <FontAwesomeIcon icon={faTwitter} size="lg" className="pointer crud-links font-x-large p-2" />
                    </a>
                </div>
                <div>
                    <a href="https://www.twitch.tv/nysfddrillteams" target="_blank">
                        <FontAwesomeIcon icon={faTwitch} size="lg" className="pointer crud-links font-x-large p-2" />
                    </a>
                </div>
                <div>
                    <a href="https://www.tiktok.com/@nysfddrillteams?lang=en" target="_blank">
                        <FontAwesomeIcon icon={faTiktok} size="lg" className="pointer crud-links font-x-large p-2" />
                    </a>
                </div>
                <div>
                    <a href="https://www.youtube.com/@NYSFDdrillteams" target="_blank">
                        <FontAwesomeIcon icon={faYoutube} size="lg" className="pointer crud-links font-x-large p-2" />
                    </a>
                </div>
            </div>
        </div>
    )
}