import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Tournament, Track } from "../types/types"; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import ScheduleEntry from "../Components/ScheduleEntry"; 

declare var SERVICE_URL: string;

export default function Track() {

    const [trackLoading, setTrackLoading] = useState(true); 
    const [errorTrackLoading, setErrorTrackLoading] = useState(false);
    const [track, setTrack] = useState<Track>(); 

    const [tournLoading, setTournLoading] = useState(true); 
    const [errorTournLoading, setErrorTournLoading] = useState(false);
    const [tournaments, setTournaments] = useState<Tournament[]>([]); 

    let params = useParams();
    const trackName = params.trackName

    const fetchTrack = () => {
        fetch(`${SERVICE_URL}/tracks/getTrackByName?trackName=${trackName}`)
            .then(response => response.json())
            .then(data => {
                setTrack(data)
                console.log('track: ', data)
                setTrackLoading(false);
            })
            .catch(err => {
                console.log(err)
                setErrorTrackLoading(true); 
            })
    }

    const fetchTournaments = () => {
        fetch(`${SERVICE_URL}/tournaments/getTournamentsByTrack?track=${trackName}`)
            .then(response => response.json())
            .then(data => {
                data = data.sort((a:Tournament,b:Tournament) => a.date > b.date ? -1 : 1)
                data = data.map((el:Tournament) => {
                    return {
                        ...el, 
                        date: new Date(el.date)
                    }
                })    
                setTournaments(data)
                console.log('tournaments: ', data)
                setTimeout(() => {setTournLoading(false)}, 1000); 
            })
            .catch(err => {
                console.log(err)
                setErrorTournLoading(true); 
            })
    }


    useEffect(() => {
            fetchTrack(),
            fetchTournaments()     
    }, [])

    let content; 
    if(trackLoading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                </div>
            </div>
        )
    }
    if(errorTrackLoading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="">Sorry, there was an error loading the tournament.</div>
                </div>
            </div>
        )
    }


    if(!trackLoading && !errorTrackLoading){
        content = (
            <div className="bg-white shadow-sm rounded mt-4 container">
                <div className="row">
                    <div className="col-12 text-left track-name-bg-color track-name-color p-4 rounded"><h3>{track.name}</h3></div>
                </div>
                <div className="row align-items-center bg-white">
                    <div className="col-8 ">
                        <div className="row my-2">
                            {
                                track?.imageUrls && track.imageUrls.length ? 
                                    <div className="carousel slide" data-bs-ride="carousel">
                                        <div className="carousel-inner ">
                                            {
                                                track.imageUrls.map((img,ind) => {
                                                    return <div key={ind} className={`carousel-item ${ind == 0 ? 'active':''}`}>
                                                        <img src={img} className="d-block track-img-height "  alt="..."/>
                                                    </div>
                        
                                                })
                                            }
                                        </div>
                                    </div>
                                    : 
                                    <div className="m-5 p-5">
                                        <i>We don't have any images of this track.  If you do, please consider sharing with the media committee. </i>
                                    </div>

                            }
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="my-3 mx-1 p-2 border">
                            <h6 className="text-center mt-3">{track.name}</h6>
                            <div className="text-center my-4">
                                {track.address}, {track.city}
                                <a className="ms-3 font-x-large map-location-links" href={`https://www.google.com/maps/place/${track.address} ${track.city}`} target="_blank">
                                    <FontAwesomeIcon icon={faMapLocationDot} />
                                </a>
                            </div>
                            {
                            (track?.archHeightFt && track?.archHeightInches) || track?.distanceToHydrant ? 
                                <div className="text-center my-4">
                                    {(track?.archHeightFt && track?.archHeightInches) ? `Arch Height: ${track.archHeightFt}'${track.archHeightInches}''` : ""}
                                    {track?.distanceToHydrant ? `${(track?.archHeightFt && track?.archHeightInches) ? " | " : ""}Distance to Hydrant: ${track.distanceToHydrant}` : ""}
                                </div> : <></>
                            }
                        </div>
                        <div className="row">
                        
                            {
                            track?.notes ? 
                                <div className="text-center font-large text-secondary my-4 break-spaces">
                                    {track?.notes}
                                </div> : <></>
                            }
                        
                        </div>
 
                    </div>
                </div>
            </div>        
        )
    }

    let tournContent;     
    if(tournLoading){
        tournContent = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                </div>
            </div>
        )
    }
    if(errorTournLoading){
        tournContent = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="">Sorry, there was an error loading past tournaments.</div>
                </div>
            </div>
        )
    }


    if(!tournLoading && !errorTournLoading){
        tournContent = 
        
        <div className="pb-2 mt-5 bg-light rounded shadow-sm">
            <div className="row">
                <div className="col-12">
                    <div className="text-left track-name-bg-color track-name-color p-4 rounded"><h3>Tournaments at {track.name}</h3></div>
                </div>
            </div>
            {tournaments.map(el => {
                return <ScheduleEntry key={el.id} tournament={el} bgColorClass="bg-white"/>
            })}
        </div>
    }
    
    return (
        <div className="container">
            {content}
            {tournContent}
        </div>
    )
}


