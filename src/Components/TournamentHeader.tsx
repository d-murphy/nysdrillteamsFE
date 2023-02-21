import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo, faCircleInfo, faTicket } from '@fortawesome/free-solid-svg-icons'
import TournamentWinners from "./TournamentWinners"
import getTournamentWinner from "../utils/getTournamentWinners";
import { WinnerIcon } from "./SizedImage";
import Tooltip from "react-bootstrap/Tooltip"; 
import OverlayTrigger from "react-bootstrap/OverlayTrigger"; 


import { Tournament } from "../types/types"; 
import dateUtil from "../utils/dateUtils"; 
import { propTypes } from "react-bootstrap/esm/Image";

interface TournamentProp {
    tournament: Tournament;
}


export default function TournamentHeader(props:TournamentProp) {
    const tournament = props.tournament;

    let winnerStr = getTournamentWinner(tournament, " | "); 
    let winnerArr = winnerStr.split(" | "); 


    let pointsArr = []; 
    let pointsStr: string = 'Total Points for: '; 
    if(tournament.suffolkPoints) pointsArr.push("Suffolk"); 
    if(tournament.nassauPoints) pointsArr.push("Nassau"); 
    if(tournament.northernPoints) pointsArr.push("Northern"); 
    if(tournament.westernPoints) pointsArr.push("Western"); 
    if(tournament.liOfPoints) pointsArr.push("OF"); 
    if(tournament.juniorPoints) pointsArr.push("Juniors"); 
    pointsArr.sort((a,b) => a < b ? -1 : 1);
    pointsArr.forEach((el, ind) => {
        if(ind != 0) pointsStr += ", "
        pointsStr += el
    })
    if(!pointsArr.length) pointsStr = "Not a total points drill"

    const navigate = useNavigate(); 
    const routeChange = () =>{ 
        let path = `/Track/${tournament.track}`; 
        navigate(path);
    }

    let urlList = printUrlWithIcon(tournament); 

    return (
        <div className="bg-white shadow-sm rounded mb-1 mt-2">
            <div className="row ">
                <div className="col-12 text-center my-2"><h3>{tournament.name}</h3></div>
                <div className="col-12">
                    <div className="d-flex justify-content-center align-items-center font-medium pb-2">
                        <div className=" text-uppercase px-2 text-center"><b>{dateUtil.getDay(tournament?.date.getDay())}</b></div>
                        <div className=" px-2 text-center"><b>{new Date(tournament.date).toLocaleDateString()}</b></div>
                        <div className=" px-2 text-center"><b>{dateUtil.getTime(tournament.startTime)}</b></div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="row my-2 font-small">
                        <div className="col-4 px-2 text-center">Location: {tournament.track}</div>
                        <div className="col-4 px-2">
                            <div className=" d-flex justify-content-center align-items-center">
                                {
                                    !tournament?.host ? '' : <div className="text-center">Host: {tournament.host}</div>
                                }
                                {
                                    !tournament?.urlToEntryForm ? <></> : 
                                    <div className="mx-2"><EntryForm url={tournament.urlToEntryForm} /></div>
                                }
                            </div>
                        </div>
                        <div className="col-4 px-2 text-center ">{pointsStr}</div>
                    </div>
                </div>
            </div>
            <div className="row">

                <div className="col-12 d-flex flex-column align-items-center justify-content-center py-1">
                    {
                        (tournament.top5 && tournament.top5.length) ? 
                            <div className="schedule-entry-winner text-center py-2 px-5 font-large border-top border-bottom">
                                <div>1st Place</div>
                                <div className="d-flex flex-row flex-wrap justify-content-center align-items-center">
                                    {winnerArr.map(el => <WinnerIcon team={el} size="sm"/>)}
                                </div>
                            </div> : 
                            !tournament.liveStreamPlanned ? <></> : 
                                <div className="schedule-entry-link text-center font-medium mt-1 px-5 py-2 border-top border-bottom">Live Stream Planned!</div>
                    }
                </div>
                {tournament?.urls?.length ?  
                    <div className="col-12">
                        <div className="video-icon text-center my-2 d-flex align-items-center justify-content-center">{urlList}</div>
                    </div> : <></>
                }
                <div className="col-12">
                    <div className="d-flex justify-content-center align-items-center my-2">
                        <TournamentWinners tournamentName={tournament.name} numberShown={3} yearOfDrill={tournament.date.getFullYear()} />
                    </div>
                </div>
                <div className="col-12">
                    <div className="d-flex justify-content-center align-items-center my-2 font-small video-links">
                        <div className="pointer" onClick={() => navigate(`/TournamentHistory/${tournament.name}`)}>View more tournament history</div>
                    </div>
                </div>
                {
                    !tournament?.notes ? <></> : 
                    <div className="col-12">
                        <div className="d-flex justify-content-center align-items-center my-2 font-small">
                            Note: {tournament.notes}
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

function printUrlWithIcon(tournament:Tournament){
    if(tournament.urls && tournament.urls.length) {
        return tournament?.urls.map((el, index) => { 
            return <div className="font-small" key={index}>
                { index == 0 ? 
                    <a className="video-links px-1" href={`${el}`} target="_blank">Watch the Drill <FontAwesomeIcon className="ms-2" icon={faVideo} /></a> : 
                    <a className="video-links px-1" href={`${el}`} target="_blank"><FontAwesomeIcon icon={faVideo} /></a>
                }
            </div> })     
    }
    return <div></div>
}

interface EntryFromProps {
    url: string
}

function EntryForm(props: EntryFromProps){
    //@ts-ignore
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props} >Click for Entry Form</Tooltip>
      );
    
      return (
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
            <a href={props.url} target="_blank">
                <FontAwesomeIcon icon={faTicket} className="crud-links font-x-large" />
            </a>
        </OverlayTrigger>
      );
}