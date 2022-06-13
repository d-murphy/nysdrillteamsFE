import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import TournamentWinners from "./TournamentWinners"

import { Tournament } from "../types/types"; 
import dateUtil from "../utils/dateUtils"; 

interface TournamentProp {
    tournament: Tournament;
}


export default function TournamentHeader(props:TournamentProp) {
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
    let pointsStr: string = ''; 
    if(!tournament.circuits.length) {
        pointsStr += "Not a Total Points Drill"
    } else {
        pointsStr += "This is a Total Points Drill for: "
        tournament.circuits = tournament.circuits.sort((a,b) => a < b ? -1 : 1)
        tournament.circuits.forEach((el, ind) => {
            if(ind>0) pointsStr += ", "
            pointsStr += el
        })
    }

    const navigate = useNavigate(); 
    const routeChange = () =>{ 
        let path = `/`; 
        navigate(path);
    }

    let urlList = <div>
        <div className="video-icon font-x-large ms-3">
            {printUrlWithIcon(tournament)}
        </div>
    </div>

    return (
        <div className="bg-white shadow-sm rounded mb-1 mt-2">
            <div className="row">
                <div className="col-12 text-center mt-3 mb-4 pb-4 border-bottom"><h3>{tournament.name}</h3></div>
            </div>
            <div className="row mb-2 p-2 ">
                <div className="schedule-entry-date-section col-2 d-flex flex-column align-items-start justify-content-center ps-5">
                    <div className="schedule-entry-date-day font-medium text-uppercase"><b>{dateUtil.getDay(tournament?.date.getDay())}</b></div>
                    <div className="schedule-entry-date-date font-large "><b>{dateUtil.getMMDDYYYY(tournament.date)}</b></div>
                    <div className="schedule-entry-date-time font-medium "><b>{dateUtil.getTime(tournament.date)}</b></div>
                </div>
                <div className="schedule-entry-tournament-info col-4 d-flex flex-column align-items-center">
                    <div className="schedule-entry-tournament-track font-medium text-uppercase my-2" onClick={routeChange}>
                        Location: {tournament.track}
                        <span className="track-info-icon font-small ms-1"><FontAwesomeIcon icon={faCircleInfo} /></span>
                    </div>
                    <div className="schedule-entry-tournament-circuits text-center my-2 mx-5">
                        {pointsStr}
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
                    <div className="video-icon font-x-large ms-3">
                        {tournament?.urls?.length ?  <div>{urlList}</div> : 
                            <div><TournamentWinners tournamentName={tournament.name} numberShown={3} /></div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

function printUrlWithIcon(tournament:Tournament){
    if(tournament.urls && tournament.urls.length) {
        return tournament?.urls.map((el, index) => { 
            return <div className="font-medium" key={index}>
                <a className="video-links" href={`${el}`} target="_blank">Watch the Drill <FontAwesomeIcon icon={faVideo} /></a>
            </div> })     
    }
    return <div></div>
}


