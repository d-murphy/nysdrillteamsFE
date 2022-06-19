import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Tournament, Track } from "../types/types"; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";


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
        fetch(`http://localhost:4400/tracks/getTrackByName?trackName=${trackName}`)
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
        fetch(`http://localhost:4400/tournaments/getTournamentsByTrack?track=${trackName}`)
            .then(response => response.json())
            .then(data => {
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
            <div className="bg-white shadow-sm rounded">
                <div className="row">
                    <div className="col-12 text-center mt-3 mb-2 pb-4 "><h3>{track.name}</h3></div>
                </div>
                <div className="row">
                    <div className="col-2"></div>
                    <div className="col-8">
                        <div id="carouselExampleControls" className="carousel slide" data-ride="carousel">
                        <div className="carousel-inner ">
                                {
                                    track.imageUrls.map((img,ind) => {
                                        return <div key={ind} className={`carousel-item ${ind == 0 ? 'active':''}`}>
                                            <img src={img} className="d-block w-100"  alt="..."/>
                                        </div>
            
                                    })
                                }
                            </div>
                            <a className="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="sr-only">Previous</span>
                            </a>
                            <a className="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="sr-only">Next</span>
                            </a>
                        </div>
                    </div>
                    <div className="col-2"></div>
                </div>


                <div className="row">
                    <div className="col-12 font-x-large p-5">
                        
                        {
                        track?.notes ? 
                            <div className="text-center font-large text-secondary my-4 break-spaces">
                                {track?.notes}
                            </div> : <></>
                        }
                        {
                        track?.archHeight || track?.distanceToHydrant ? 
                            <div className="text-center my-4">
                                {track?.archHeight ? `Arch Height: ${track.archHeight} - ` : ""}{track?.distanceToHydrant ? `Distance to Hydrant: ${track.distanceToHydrant}` : ""}
                            </div> : <></>
                        }
                        <div className="text-center my-4">
                            {track.address}, {track.city}
                            <a className="ms-3 font-x-large map-location-links" href={`https://www.google.com/maps/place/${track.address} ${track.city}`} target="_blank">
                                <FontAwesomeIcon icon={faMapLocationDot} />
                            </a>
                        </div>
                            
                    </div>
                </div>
            </div>        
        )
    }

    
    return (
        <div className="container">
            {content}
        </div>
    )
}


