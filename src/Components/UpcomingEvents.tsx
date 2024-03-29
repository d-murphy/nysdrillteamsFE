import * as React from "react";
import { useEffect, useState } from "react";
import { Tournament } from "../types/types"; 
import dateUtil from "../utils/dateUtils"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import Tooltip from "react-bootstrap/Tooltip"; 
import OverlayTrigger from "react-bootstrap/OverlayTrigger"; 


declare var SERVICE_URL: string;

interface ScheduleProp {
    year: number;
}


export default function Schedule(props:ScheduleProp) {

    const [tournaments, setTournaments] = useState<Tournament[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 

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
            .filter((el:Tournament) => {
                return new Date(el.date) > new Date()
            })
            .sort((a:Tournament,b:Tournament) => a.date < b.date ? -1 : 1)
            .filter((el:Tournament, ind:number) => {return ind < 5})
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
            {tournaments.length ? 
                tournaments.map((el:Tournament) => {  
                    return (
                    <div className="my-2 d-flex flex-row align-items-start"> 
                        <div><>{el.name} @ {el.track} - {dateUtil.getMMDDYYYY(el.date)}, {dateUtil.getTime(el.startTime)}</></div>  
                        {el?.liveStreamPlanned ? <LiveStream /> : <></>}
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
            <div className="ms-2">
                <FontAwesomeIcon icon={faVideo} className="video-links" />
            </div>
        </OverlayTrigger>
      );
}