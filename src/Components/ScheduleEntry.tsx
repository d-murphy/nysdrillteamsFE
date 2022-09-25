import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

import { Tournament } from "../types/types"; 
import dateUtil from "../utils/dateUtils"; 
import getTournamentWinner from "../utils/getTournamentWinners"; 

interface ScheduleEntryProp {
    tournament: Tournament;
    bgColorClass: string; 
}


export default function ScheduleEntry(props:ScheduleEntryProp) {
    const tournament = props.tournament;
    let winnerStr = getTournamentWinner(tournament, " | "); 

    let nassauIcon = tournament.nassauSchedule; 
    let northernIcon = tournament.northernSchedule; 
    let suffolkIcon = tournament.suffolkSchedule; 
    let westernIcon = tournament.westernSchedule; 
    let oldfashionedIcon = tournament.liOfSchedule; 
    let juniorIcon = tournament.juniorSchedule; 

    const navigate = useNavigate(); 
    const routeChange = () =>{ 
        let path = `/Track/${tournament.track}`; 
        navigate(path);
    }
    
    return (
        <div className={`row ${props.bgColorClass} shadow-sm rounded my-2`}>
            <div className="schedule-entry-date-section col-lg-2 col-4 d-flex flex-column align-items-center justify-content-center p-3">
                <div className="schedule-entry-date-day font-medium text-uppercase"><b>{dateUtil.getDay(tournament?.date.getDay())}</b></div>
                <div className="schedule-entry-date-date font-large "><b>{dateUtil.getMMDDYYYY(tournament.date)}</b></div>
                <div className="schedule-entry-date-time font-medium "><b>{String(tournament.startTime)}</b></div>
            </div>
            <div className="schedule-entry-tournament-info col-lg-4 col-8 d-flex flex-column align-items-center p-3">
                <div className="schedule-entry-tournament-name font-large font-weight-bold mb-2"><b>{tournament.name}</b></div>
                <div className="schedule-entry-tournament-track font-medium text-uppercase mb-2" onClick={routeChange}>
                    {tournament.track}
                    {tournament.track ? <span className="track-info-icon font-small ms-1"><FontAwesomeIcon icon={faCircleInfo} /></span> : <></> }
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
            <div className="schedule-entry-winner-or-link col-lg-3 col-4 d-flex flex-column align-items-center justify-content-center p-3">
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
            <div className="schedule-entry-button-section col-lg-3 col-8 d-flex justify-content-center align-items-center px-2 py-3">
                <div className="schedule-entry-button font-medium px-3 py-2 rounded text-center" onClick={() => navigate(`/Tournament/${tournament.id}`)}>View Scorecard</div>
                {tournament?.urls?.length ?
                    <div className="video-icon font-x-large ms-3">
                        <a href={`${tournament?.urls[0] }`} target="_blank"><FontAwesomeIcon icon={faVideo} /></a>
                    </div>  : <></> }
            </div>
        </div>
    )
}


