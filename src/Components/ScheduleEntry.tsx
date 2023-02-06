import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import OverlayTrigger from "react-bootstrap/OverlayTrigger"; 
import Tooltip from "react-bootstrap/Tooltip"; 
import { WinnerIcon } from "./SizedImage"; 


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
    const seperator = " | "; 
    let winnerStr = getTournamentWinner(tournament, seperator); 
    let winnerArr = winnerStr.split(seperator); 

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
        <div className={`${props.bgColorClass} shadow-sm rounded my-1 w-100`}>
            <div className="row">

                {/* Left column - using d-none to hide one of these two clusters  */}

                <div className="d-lg-block d-none col-2">
                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <div className="font-medium text-uppercase text-center"><b>{dateUtil.getDay(tournament?.date.getDay())}</b></div>
                        <div className="font-medium text-center"><b>{new Date(tournament.date).toLocaleDateString()}</b></div>
                        <div className="font-medium text-center"><b>{dateUtils.getTime(tournament.startTime)}</b></div>
                    </div>
                </div>
                <div className="d-block d-lg-none col-12">
                    <div className="d-flex flex-row align-items-center justify-content-center mx-5 py-3 border-bottom">
                        <div className="font-medium text-uppercase mx-2 text-center"><b>{dateUtil.getDay(tournament?.date.getDay())}</b></div>
                        <div className="font-medium mx-2 text-center"><b>{new Date(tournament.date).toLocaleDateString()}</b></div>
                        <div className="font-medium mx-2 text-center"><b>{dateUtils.getTime(tournament.startTime)}</b></div>
                    </div>
                </div>

                <div className="col-lg-4 col-12 d-flex flex-column align-items-center justify-content-center p-3">
                    <div className="font-large font-weight-bold mb-2 text-center">
                        <b>{tournament.name}</b>
                        {
                            !tournament.urls.length ? <></> : 
                                <span className="ms-3 video-icon">
                                    <a href={tournament.urls[0]} target="_blank">
                                        <FontAwesomeIcon icon={faVideo} size="lg" className="" />
                                    </a>
                                </span>
                        }
                    </div>
                    {/* <div className="schedule-entry-tournament-track font-medium text-uppercase mb-2" onClick={routeChange}>
                        {tournament.track}
                        {tournament.track ? <span className="track-info-icon font-small ms-1"><FontAwesomeIcon icon={faCircleInfo} /></span> : <></> }
                    </div> */}
                    <div className="d-flex flex-wrap justify-content-center my-2">

                        <div className="d-flex justify-content-center my-1">
                            <CountyIcon active={nassauIcon} label="Na" popoverText="Nassau" />
                            <CountyIcon active={northernIcon} label="No" popoverText="Northern" />
                            <CountyIcon active={suffolkIcon} label="Su" popoverText="Suffolk" />
                            <CountyIcon active={westernIcon} label="We" popoverText="Western" />
                        </div>
                        <div className="d-flex justify-content-center my-1 mx-2">
                            <CountyIcon active={oldfashionedIcon} label="OF" popoverText="Old-Fashioned" />
                        </div>
                        <div className="d-flex justify-content-center my-1 mx-2">
                            <CountyIcon active={juniorIcon} label="Jr" popoverText="Junior" />
                        </div>
                    </div>
                </div>


                <div className="col-lg-3 col-12 d-flex flex-column align-items-center justify-content-center py-1">
                    {
                        (tournament.top5 && tournament.top5.length) ? 
                            <div className="schedule-entry-winner text-center border-top border-bottom py-2 font-large">
                                <div>1st Place</div>
                                <div className="d-flex flex-row flex-wrap justify-content-center align-items-center">
                                    {winnerArr.map(el => <WinnerIcon team={el}/>)}
                                </div>
                            </div> : 
                            tournament.liveStreamPlanned ? 
                                <div className="schedule-entry-link text-center font-medium mt-4">Live Stream Planned!</div> :  
                                <div className=""></div>
                    }
                </div>

                <div className="col-lg-3 col-12 d-flex justify-content-center align-items-center px-2 py-3">
                    {
                        tournament.isParade ? <></> : 
                            <div className="schedule-entry-button font-medium px-3 py-2 rounded text-center" onClick={() => navigate(`/Tournament/${tournament.id}`)}>View Scorecard</div>
                    }
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
          {mainprops.active ? `${mainprops.popoverText} teams active` : `Not a ${mainprops.popoverText} teams not expected`}
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