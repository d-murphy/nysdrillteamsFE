import * as React from "react";
import { useEffect, useState } from "react";
import { Tournament } from "../types/types"; 
import dateUtil from "../utils/dateUtils"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import Tooltip from "react-bootstrap/Tooltip"; 
import OverlayTrigger from "react-bootstrap/OverlayTrigger"; 
import { useNavigate } from "react-router-dom";


declare var SERVICE_URL: string;

interface ScheduleProp {
    year: number;
}


export default function Schedule(props:ScheduleProp) {

    const [tournaments, setTournaments] = useState<Tournament[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 
    const navigate = useNavigate();

    const fetchTournaments = () => {
        fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?years=${props.year}`)
        .then(response => response.json())
        .then(data => {
            data = data.map((el:Tournament) => {
                return {
                    ...el, 
                    date: new Date(el.date)
                }
            })

            setTournaments(data); 
            setLoading(false);
        })
        .catch(err => {
            console.log(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        fetchTournaments(); 
    }, []); 

    const upcommingTournaments = tournaments
        .filter((el:Tournament) => {
            return new Date(el.date) > new Date()
        })
        .sort((a:Tournament,b:Tournament) => a.date < b.date ? -1 : 1)
        .filter((el:Tournament, ind:number) => {return ind < 5})

    let content; 
    if(loading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                </div>
            </div>
        )
    }
    if(errorLoading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="">Sorry, there was an error loading the schedule.</div>
                </div>
            </div>
        )
    }


    if(!loading && !errorLoading){
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