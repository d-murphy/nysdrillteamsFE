import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faSquareYoutube } from '@fortawesome/free-brands-svg-icons'
import OverlayTrigger from "react-bootstrap/OverlayTrigger"; 
import Tooltip from "react-bootstrap/Tooltip"; 
import { faTruckPickup, faPersonRunning, faFlagUsa, faLocationDot } from "@fortawesome/free-solid-svg-icons";


import { Tournament } from "../types/types"; 
import dateUtil from "../utils/dateUtils"; 
import getTournamentWinner from "../utils/getTournamentWinners"; 
import dateUtils from "../utils/dateUtils";

interface ScheduleEntryProp {
    tournament: Tournament;
    bgColorClass: string; 
}


export default function ScheduleEntry(props:ScheduleEntryProp) {
    const tournament = props.tournament;
    const navigate = useNavigate(); 

    const dtOpts = { month: '2-digit' as '2-digit', day: '2-digit' as '2-digit'};

    const isMotorized = tournament.nassauSchedule || tournament.northernSchedule || tournament.suffolkSchedule || tournament.westernSchedule; 

    const drillClass = tournament.isParade ? "Parade" : 
        isMotorized ? 'Motorized' : 
        tournament.liOfSchedule ? 'Old Fashioned' : 
        tournament.juniorSchedule ? 'Junior' : ""

    const DrillIcon = tournament.isParade ? faFlagUsa :
        isMotorized ? faTruckPickup : faPersonRunning; 


    const seperator = " | "; 
    let winnerStr = getTournamentWinner(tournament, seperator, true); 
    let winnerArr = winnerStr.split(seperator); 
        
    return (
        <div className={`${props.bgColorClass} shadow-sm rounded my-3 w-100`}>
            <div className="row">

                {/* Left column - using d-none to hide one of these two clusters  */}

                <div className="d-block col-12">
                    <div className="d-flex flex-md-row flex-column align-items-center justify-content-center justify-content-md-start py-3 px-4 border-bottom">
                        <div className="text-uppercase font-large text-center text-md-left"><b>{tournament.name}</b></div>
                        <div className="mx-2 font-large d-none d-md-block">&#8226;</div>
                        <div className="font-medium text-uppercase ">{dateUtil.getDay(tournament?.date.getDay()).substring(0,3)}</div>
                        <div className="ms-md-2 font-medium text-center">{new Date(tournament.date).toLocaleDateString('en-US', dtOpts)}</div>
                        <div className="ms-md-2 font-medium text-center">{dateUtils.getTime(tournament.startTime)}</div>
                        <div className="flex-grow-1"></div>
                        {
                            tournament.urls.length ?  
                                <span className="video-icon">
                                    <a href={tournament.urls[0]} target="_blank" className="video-links">
                                        Video Available
                                        <FontAwesomeIcon icon={faSquareYoutube} size="lg" className="ms-2" />
                                    </a>
                                </span> : 
                                tournament.liveStreamPlanned ? 
                                    <div className="schedule-entry-link text-center font-medium ">Live Stream Planned!</div> :  
                                    <div></div>
                        }

                    </div>
                </div>
                <div className="d-block col-12">
                    <div className="d-flex flex-column justify-content-center">
                        <div className="d-flex flex-row justify-content-between align-start pb-2 pt-3 px-4">
                            <div className="d-flex flex-column justify-content-start">
                                <div className="grayText d-flex flex-row justify-content-start align-items-center">
                                    {
                                        drillClass &&
                                        <>
                                        <FontAwesomeIcon icon={DrillIcon} className="me-1" />
                                        <div>{drillClass}</div>
                                        </>
                                    }
                                </div>
                                <div className="flex-grow-1" />
                                <div className="mb-3 d-none d-md-block">
                                    {winnerStr && `1st: ${winnerStr}`}
                                </div>
                            </div>
                            <div className="d-flex flex-column align-items-end">
                                <div className="d-block d-md-none mb-4 text-right">
                                    {
                                        tournament.track === 'Unknown' ? <></> : 
                                            <Link
                                                to={`/locations/${tournament.track}`}
                                                className="video-links pointer"
                                                >
                                                <FontAwesomeIcon icon={faLocationDot} size="lg" className="me-2" />
                                                {tournament.track}
                                            </Link>
                                    }
                                </div>
                                <div className="d-md-block d-none ">
                                    {
                                        tournament?.cancelled ? <div className="mb-3 text-center"><i>This event was cancelled.</i></div> : 
                                        tournament?.isParade ? <></> : 
                                            <div className="pointer schedule-entry-button  font-medium px-3 py-2 mb-3 rounded text-center" onClick={() => navigate(`/Tournament/${tournament.id}`)}>View Scorecard</div>
                                    }
                                </div>
                                <div className="d-flex flex-row mb-3 d-md-block d-none text-right">
                                    {
                                        tournament.track === 'Unknown' ? <></> : 
                                            <Link
                                                to={`/locations/${tournament.track}`}
                                                className="video-links pointer"
                                                >
                                                <FontAwesomeIcon icon={faLocationDot} size="lg" className="me-2" />
                                                {tournament.track}
                                            </Link>
                                    }
                                </div>

                            </div>
                        </div>
                        <div className="mb-3 d-block d-md-none d-flex justify-content-center">
                            {winnerStr && `1st: ${winnerStr}`}
                        </div>
                        <div className="d-md-none d-block d-flex justify-content-center">
                            {
                                tournament?.cancelled ? <div className="mb-3 text-center"><i>This event was cancelled.</i></div> : 
                                tournament?.isParade ? <></> : 
                                    <div className="pointer schedule-entry-button width-50 font-medium px-3 py-2 mb-3 rounded text-center" onClick={() => navigate(`/Tournament/${tournament.id}`)}>View Scorecard</div>
                            }
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

interface CountyIconProps {
    active: boolean
    label: string
    popoverText: string
}

function CountyIcon(mainprops:CountyIconProps){
    //@ts-ignore
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props} >
          {mainprops.active ? `${mainprops.popoverText} points drill` : `Not a points drill for ${mainprops.popoverText}`}
        </Tooltip>
      );
    
      return (
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
            <div 
                className={`mx-1 font-small badge bg-secondary cursor-default ${mainprops.active ? "" : "circuit-inactive"} `}
            >{mainprops.label}</div>
        </OverlayTrigger>
      );
}