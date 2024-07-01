import React, { useEffect, useState } from 'react';
import { Track } from '../types/types';

declare var SERVICE_URL: string;


export default function Locations(){

    const [loading, setLoading] = useState(true); 
    const [tracks, setTracks] = useState<Track[]>([]);
    const [errorLoading, setErrorLoading] = useState(false);

    const fetchTracks = () => {
        setLoading(true); 

        fetch(`${SERVICE_URL}/tracks/getTracks`)
        .then(response => response.json())
        .then(data => {
            data = data.filter((el: Track) => {
                return el.display;  
            })
            setTracks(data); 
            setLoading(false);
        })
        .catch(err => {
            console.log(err)
            setErrorLoading(true); 
        })
    }

    useEffect(() => {
        fetchTracks(); 
    }, []);

    return (
        <div className="container">
            <div className="text-center font-x-large mt-2"><b>Track Locations</b></div>
            {
                loading ? <div>Loading...</div> : 
                errorLoading ? <div>Error loading tracks</div> :
                    <div>{tracks.length} tracks found</div>
            }
        </div>

    )
}