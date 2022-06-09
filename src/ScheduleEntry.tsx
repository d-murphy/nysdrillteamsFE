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
        <div className="container">
            <div className="schedule-entry-date-section">
                <div className="schedule-entry-date-day">{dateUtil.getDay(tournament.date.getDate())}</div>
                <div className="schedule-entry-date-date">{dateUtil.getMMDDYYYY(tournament.date)}</div>
                <div className="schedule-entry-date-time">{dateUtil.getTime(tournament.date)}</div>
            </div>
            <div className="schedule-entry-tournament-info">
                <div className="schedule-entry-tournament-name">{tournament.name}</div>
                <div className="schedule-entry-tournament-track">{tournament.track}</div>
            </div>
            <div className="schedule-entry-winner-or-link">
                {
                    (tournament.top5 && tournament.top5.length) ? 
                        <div className="schedule-entry-winner">{winnerStr}</div> : 
                        tournament.liveStreamPlanned ? 
                            <div className="schedule-entry-link">Watch Live!</div> :  
                            <div className=""></div>
                }
            </div>
            <div className="schedule-entry-button-section">
                <div className="schedule-entry-button">View Tournament</div>
            </div>
        </div>
    )
}


