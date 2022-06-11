import * as React from "react";
import { Tournament } from "./types/types"; 
import dateUtil from "./utils/dateUtils"; 

interface ScheduleEntryProp {
    tournament: Tournament;
}


export default function ScheduleEntry(props:ScheduleEntryProp) {
    const tournament = props.tournament;
    let winnerStr: string = ''
    if(tournament.top5) {
        tournament.top5.forEach(team => {
            let numOfFirsts = 0; 
            if(team.finishingPosition=="1") {
                numOfFirsts++; 
                if(numOfFirsts == 1) winnerStr += team.teamName; 
                if(numOfFirsts > 1) winnerStr += " | " + team.teamName;
            }
        })    
    }
    
    return (
        <div className="row m-2 bg-white pt-2 pb-1 shadow-sm rounded">
            <div className="col-1"></div>
            <div className="schedule-entry-date-section col-2 d-flex flex-column align-items-start ">
                <div className="schedule-entry-date-day font-small text-uppercase"><b>{dateUtil.getDay(tournament?.date.getDay())}</b></div>
                <div className="schedule-entry-date-date font-medium "><b>{dateUtil.getMMDDYYYY(tournament.date)}</b></div>
                <div className="schedule-entry-date-time font-small "><b>{dateUtil.getTime(tournament.date)}</b></div>
            </div>
            <div className="schedule-entry-tournament-info col-3 d-flex flex-column align-items-center">
                <div className="schedule-entry-tournament-name font-large font-weight-bold mb-2"><b>{tournament.name}</b></div>
                <div className="schedule-entry-tournament-track font-medium text-uppercase">{tournament.track}</div>
            </div>
            <div className="schedule-entry-winner-or-link col-3 d-flex flex-column align-items-center ">
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
            <div className="schedule-entry-button-section col-2 d-flex justify-content-center align-items-center">
                <div className="schedule-entry-button font-medium px-3 py-2 ">View Tournament</div>
            </div>
            <div className="col-1"></div>
        </div>
    )
}


