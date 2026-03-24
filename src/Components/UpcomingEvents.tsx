import * as React from "react";
import { Tournament } from "../types/types";
import dateUtil from "../utils/dateUtils"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";


declare var SERVICE_URL: string;

interface ScheduleProp {
    year: number;
}


export default function Schedule(props:ScheduleProp) {

    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery<Tournament[]>({
        queryKey: ['tournaments', props.year],
        queryFn: () => fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?years=${props.year}`).then(res => res.json()),
    });
    const tournaments = data ?? [];

    const upcommingTournaments = tournaments
        .filter((el:Tournament) => new Date(el.date) > new Date())
        .sort((a:Tournament, b:Tournament) => new Date(a.date) < new Date(b.date) ? -1 : 1)
        .filter((_el:Tournament, ind:number) => ind < 5);

    let content;
    if(isLoading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                </div>
            </div>
        )
    }
    if(isError){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="">Sorry, there was an error loading the schedule.</div>
                </div>
            </div>
        )
    }


    if(!isLoading && !isError){
        content = (
            <div className="">
            {upcommingTournaments.length ? 
                upcommingTournaments
                    .map((el:Tournament) => {  
                        return (
                        <div className="my-2"> 
                            <span className="pointer pe-2" onClick={() => navigate(`/tournament/${el.id}`)}>{el.name}</span>
                            <span className="">@</span>
                            <span className="pointer px-2" onClick={()=>navigate(`/locations/${encodeURIComponent(el.track)}`)}>{el.track}</span>
                            <span>{dateUtil.getMMDDYYYY(el.date)}{el.startTime && ", "}{dateUtil.getTime(el.startTime)}</span>
                            <span>{el?.liveStreamPlanned ? <LiveStream /> : <></>}</span>
                        </div>
                        )
                    }) : 
                    <div>No additional events scheduled this year.</div>
            }
        </div>
        )
    }

    
    return ( content )
}


function LiveStream(){
    //@ts-ignore
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props} >Live Stream Planned!</Tooltip>
      );
    
      return (
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
            <span className="ms-2">
                <FontAwesomeIcon icon={faVideo} className="video-links" />
            </span>
        </OverlayTrigger>
      );
}