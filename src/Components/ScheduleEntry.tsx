import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

import { Tournament } from "../types/types"; 
import dateUtil from "../utils/dateUtils"; 
import getTournamentWinner from "../utils/getTournamentWinners"; 

interface ScheduleEntryProp {
    tournament: Tournament;
}


export default function ScheduleEntry(props:ScheduleEntryProp) {
    const tournament = props.tournament;
    let winnerStr = getTournamentWinner(tournament, " | "); 

    let nassauIcon = tournament.circuits.includes("Nassau"); 
    let northernIcon = tournament.circuits.includes("Northern"); 
    let suffolkIcon = tournament.circuits.includes("Suffolk"); 
    let westernIcon = tournament.circuits.includes("Western"); 
    let oldfashionedIcon = tournament.circuits.includes("Old Fashioned"); 
    let juniorIcon = tournament.circuits.includes("Junior"); 

    const navigate = useNavigate(); 
    const routeChange = () =>{ 
        let path = `/Track/${tournament.track}`; 
        navigate(path);
    }
    
    return (
        <div className="row m-2 bg-white pt-2 pb-1 shadow-sm rounded">
            <div className="schedule-entry-date-section col-2 d-flex flex-column align-items-start justify-content-center ps-5">
                <div className="schedule-entry-date-day font-medium text-uppercase"><b>{dateUtil.getDay(tournament?.date.getDay())}</b></div>
                <div className="schedule-entry-date-date font-large "><b>{dateUtil.getMMDDYYYY(tournament.date)}</b></div>
                <div className="schedule-entry-date-time font-medium "><b>{dateUtil.getTime(tournament.date)}</b></div>
            </div>
            <div className="schedule-entry-tournament-info col-4 d-flex flex-column align-items-center">
                <div className="schedule-entry-tournament-name font-large font-weight-bold mb-2"><b>{tournament.name}</b></div>
                <div className="schedule-entry-tournament-track font-medium text-uppercase mb-2" onClick={routeChange}>
                    {tournament.track}
                    <span className="track-info-icon font-small ms-1"><FontAwesomeIcon icon={faCircleInfo} /></span>
                </div>
                <div className="schedule-entry-tournament-circuits d-flex my-2">
                    <div className={`schedule-entry-tournament-circuit-nassau font-small mx-1 p-1 d-flex justify-content-center rounded ${nassauIcon ? "" : "circuit-inactive"} `}>Na</div>
                    <div className={`schedule-entry-tournament-circuit-northern font-small mx-1 p-1 d-flex justify-content-center rounded ${northernIcon ? "" : "circuit-inactive"} `}>No</div>
                    <div className={`schedule-entry-tournament-circuit-suffolk font-small mx-1 p-1 d-flex justify-content-center rounded ${suffolkIcon ? "" : "circuit-inactive"} `}>Su</div>
                    <div className={`schedule-entry-tournament-circuit-western font-small mx-1 p-1 d-flex justify-content-center rounded ${westernIcon ? "" : "circuit-inactive"} `}>W</div>
                    <div className={`schedule-entry-tournament-circuit-oldfashioned font-small mx-3 p-1 d-flex justify-content-center rounded ${oldfashionedIcon ? "" : "circuit-inactive"} `}>OF</div>
                    <div className={`schedule-entry-tournament-circuit-junior font-small mx-3 p-1 d-flex justify-content-center rounded ${juniorIcon ? "" : "circuit-inactive"} `}>Jr</div>
                </div>
            </div>
            <div className="schedule-entry-winner-or-link col-3 d-flex flex-column align-items-center justify-content-center">
                {
                    (tournament.top5 && tournament.top5.length) ? 
                        <div className="schedule-entry-winner text-center border-top border-bottom py-2 font-large">
                            1st Place<br/>{winnerStr}
                        </div> : 
                        tournament.liveStreamPlanned ? 
                            <div className="schedule-entry-link text-center font-medium mt-4">Live Stream Planned!</div> :  
                            <div className=""></div>
                }
            </div>
            <div className="schedule-entry-button-section col-3 d-flex justify-content-around align-items-center pe-5">
                <div className="schedule-entry-button font-medium px-3 py-2 rounded text-center" onClick={() => navigate(`/Tournament/${tournament.id}`)}>View Scorecard</div>
                <div className="video-icon font-x-large ms-3">
                    {tournament?.urls?.length ?  <a href={`${tournament?.urls[0] }`} target="_blank"><FontAwesomeIcon icon={faVideo} /></a> : <></> }
                </div>
            </div>
        </div>
    )
}


