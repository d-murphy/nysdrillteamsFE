import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTicket, faTrophy } from '@fortawesome/free-solid-svg-icons'
import { faSquareYoutube } from "@fortawesome/free-brands-svg-icons";
import TournamentWinners from "./TournamentWinners"
import getTournamentWinner from "../utils/getTournamentWinners";
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
    let secondStr = getTournamentWinner(tournament, " | ", true, "2nd Place");
    let thirdStr = getTournamentWinner(tournament, " | ", true, "3rd Place");
    let fourthStr = getTournamentWinner(tournament, " | ", true, "4th Place");
    let fifthStr = getTournamentWinner(tournament, " | ", true, "5th Place");
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
    console.log("urlList: ", urlList, tournament?.urls?.length); 
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
                {
                    (!tournament?.top5 || !Object.keys(tournament?.top5).length) ?
                        <div className="col-12">
                            <div className="d-flex justify-content-center align-items-center my-2">
                                <TournamentWinners tournamentName={tournament.name} numberShown={3} yearOfDrill={tournament.date.getFullYear()} />
                            </div>
                        </div> : 
                        <div className="col-12 d-flex flex-column align-items-center justify-content-center py-1">
                            <div className="w-100 d-flex flex-column h-100">
                                <div className="pb-2 pt-1 d-flex align-items-center flex-column">
                                    <div className="h5 text-start mt-2 text-wrap">
                                        {
                                            winnerArr.map(el => {
                                                return (
                                                    <>
                                                        <FontAwesomeIcon className="pe-2 trophyGold" icon={faTrophy} size="sm"/>
                                                        <span className="me-2">{el}</span>                                        
                                                    </>
                                                )
                                            })
                                        }  
                                    </div>
                                    <div className="text-wrap h6 grayText text-start">
                                        {tournament?.top5 && Object.keys(tournament?.top5).length && tournament.top5[0].points + " points"}
                                    </div>
                                </div>
                                <div className="d-flex flex-row justify-content-center grayText font-x-small pt-1 pb-3 text-center">
                                    {secondStr && <div className="mx-2">{secondStr}</div>}
                                    {thirdStr && <div className="mx-2">{thirdStr}</div>}
                                    {fourthStr && <div className="mx-2">{fourthStr}</div>}
                                    {fifthStr && <div className="mx-2">{fifthStr}</div>}
                                </div>
                            </div>
                        </div>
                }

                <div className="col-12 mb-2">
                    <div className="d-flex justify-content-center align-items-center my-2 font-small video-links">                        
                        {
                            tournament?.urls?.length > 0 && 
                                <div className="px-3">{urlList}</div>
                        }
                        <div className="pointer px-3" onClick={() => navigate(`/TournamentHistory/${tournament.name}`)}>View more tournament history</div>
                    </div>
                </div>
                {
                    !tournament?.notes ? <></> : 
                    <div className="col-12">
                        <div className="d-flex justify-content-center align-items-center mb-2 font-small">
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
                    <a className="video-links px-1" href={`${el}`} target="_blank">Watch the Drill <FontAwesomeIcon className="ms-2" icon={faSquareYoutube} /></a> : 
                    <a className="video-links px-1" href={`${el}`} target="_blank"><FontAwesomeIcon icon={faSquareYoutube} /></a>
                }
            </div> })     
    }
    return <></>
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