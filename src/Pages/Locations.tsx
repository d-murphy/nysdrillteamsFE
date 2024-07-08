import React, { useEffect, useRef, useState } from 'react';
import { ImageDbEntry, Tournament, Track } from '../types/types';
import { Wrapper, Status } from "@googlemaps/react-wrapper"; 
import { Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons"; 
import { Bar, BarChart, Label, ResponsiveContainer, XAxis, YAxis } from 'recharts';


declare var SERVICE_URL: string;
declare var MAPS_API_KEY: string; 

// the api key is going to be accessible in the network requests either way, so
// import to restict to url


export default function Locations(){

    const [loading, setLoading] = useState(true); 
    const [tracks, setTracks] = useState<Track[]>([]);
    const [errorLoading, setErrorLoading] = useState(false);
    const [trackSelected, setTrackSelected] = useState<string>('');
    const [trackImages, setTrackImages] = useState<ImageDbEntry[]>([])
    const [trackTourns, setTrackTourns] = useState<Tournament[]>([]);

    const fetchTracks = () => {
        setLoading(true); 

        // fetch(`${SERVICE_URL}/tracks/getTracks`)
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
            setLoading(false); 
            setErrorLoading(true); 
        })
    }

    function getTrackImages(){
        if(!trackSelected) return;
        let url = `${SERVICE_URL}/images/getImages?track=${trackSelected}`
        fetch(url)
        .then(res => res.json())
        .then(data => {
            setTrackImages(data.results);
        })
        .catch(e => {
            console.log(e.message)
        })
    }

    function getTrackTourns(){
        if(!trackSelected) return;
        let url = `${SERVICE_URL}/tournaments/getFilteredTournaments?tracks=${trackSelected}`
        fetch(url)
        .then(res => res.json())
        .then(data => {
            setTrackTourns(data);
        })
        .catch(e => {
            console.log(e.message)
        })
    
    }

    useEffect(() => {
        if(trackSelected){
            getTrackImages(); 
            getTrackTourns(); 
        } else {
            setTrackImages([]);
            setTrackTourns([]);
        }
    }, [trackSelected])


    useEffect(() => {
        fetchTracks(); 
    }, []);

    return (
        <div className="container mb-2">
            <div className="text-center font-x-large my-2"><b>Track Locations</b></div>
            <StateHandler loading={loading} error={errorLoading}>
                <div className="container">
                    <div className="row g-0">
                        <div className="col-md-4 col-12">
                            <div className='bg-white rounded mx-1 '>
                                <SelectionSection 
                                    trackSelected={trackSelected} setTrackSelected={setTrackSelected} 
                                    tracks={tracks} trackImages={trackImages} trackTourns={trackTourns}/>
                            </div>
                        </div>
                        <div className="col-md-8 col-12">
                            <div className='mx-1 h-100 d-flex flex-column map-selection-made-height'>
                                <div className='flex-grow-1'>
                                    <LocationMapWrapper setTrackSelected={setTrackSelected}
                                        tracks={tracks} selectedTrack={trackSelected} mapsApiKey={MAPS_API_KEY} />   
                                </div>
                                {
                                    !trackImages.length ? <></> : 
                                        <div className='w-100 bg-white rounded mt-1'>
                                            <TrackImages trackImages={trackImages} trackSelected={trackSelected} />                    
                                        </div>

                                }
                            </div>
                        </div>
                    </div>
                </div>
            </StateHandler>
        </div>

    )
}

interface TrackImagesProps {
    trackImages: ImageDbEntry[];
    trackSelected: string;
}

function TrackImages({trackImages, trackSelected}: TrackImagesProps){
    const [showImage, setShowImage] = useState("");

    return (
        <div className="w-100 overflow-scroll text-nowrap ">
        {
            trackImages
                .sort((a,b) => { 
                    return a.sortOrder < b.sortOrder ? -1 : 1
                })
                .map(el => {
                return (
                    <img 
                        src={el.thumbnailUrl} alt={el?.fileName || ''} className=" m-2 d-inline-block pointer" 
                        onClick={() => {setShowImage(el.url)}}
                        />
                )})
        }

        <Modal
            size="xl"
            show={!!showImage}
            onHide={() => setShowImage("")}
            aria-labelledby="image-modal"
            centered
        >
            <Modal.Header closeButton>
            <Modal.Title id="image-modal">
                {trackSelected} Image
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <img src={showImage} alt="track-image" className="w-100 track-image-mx-ht" />
            </Modal.Body>
        </Modal>

        </div>

    )

}




interface SelectionSectionProps {
    trackSelected: string;
    setTrackSelected: (track: string) => void;
    tracks: Track[];
    trackImages: ImageDbEntry[];
    trackTourns: Tournament[];
}


function SelectionSection({trackSelected, setTrackSelected, tracks, trackImages, trackTourns}: SelectionSectionProps){

    return (
        <div className='p-1 w-100'>
            <div className='px-2 h-100 map-selection-height'>
                {trackSelected ? 
                    <TrackInfo 
                        track={tracks.find(el => el.name === trackSelected) as Track}
                        trackImages={trackImages}
                        setTrackSelected={setTrackSelected}
                        trackTourns={trackTourns}
                        /> : 
                    <div>
                        <div className='ps-1 py-1'>Select a track or click a marker on the map:</div>
                        <Form.Select aria-label="Select Track" value={trackSelected} onChange={((e) => {
                                setTrackSelected(e.target.value)
                            })}>
                            <option value=""></option>
                            {tracks.sort((a,b) => a.name < b.name ? -1 : 1).map(el => {
                                return <option key={el.name} value={el.name}>{el.name}</option>
                            })}
                        </Form.Select>                        
                    </div>
                }
            </div>
        </div>
    )
}


interface StateHandlerProps {
    loading: boolean;
    error: boolean;
    children: React.ReactNode;
}


const StateHandler = function({loading, error, children}: StateHandlerProps){

    return (
        <>
        {
            loading ? <div className="spinner-border text-secondary" role="status"></div> : 
            error ? <div>Error loading tracks</div> :
            children
        }
        </>

    )
}


const otherMapStates = (status: Status) => {
    if(status === Status.FAILURE) return <div>Failed to load map</div>
    if(status === Status.LOADING) return <div>Loading map...</div>
}

interface LocationMapWrapperProp {
    tracks: Track[];
    selectedTrack?: string;
    mapsApiKey: string;
    setTrackSelected: (str: string) => void;
}

function LocationMapWrapper({tracks, selectedTrack, mapsApiKey, setTrackSelected}: LocationMapWrapperProp){
    return (
        <Wrapper 
            apiKey={mapsApiKey}
            render={otherMapStates}
            >
                <LocationMap tracks={tracks} selectedTrack={selectedTrack} setTrackSelected={setTrackSelected} />
        </Wrapper>
    )
}

interface LocationMapProp {
    tracks: Track[];
    selectedTrack: string;
    setTrackSelected: (str: string) => void;
}

function LocationMap({tracks, selectedTrack, setTrackSelected}: LocationMapProp){
    const ref = useRef<HTMLDivElement>(null); 
    const [map, setMap] = useState<google.maps.Map>();
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

    const iconBase = {
        path: "M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", 
        fillColor: "orange", 
        fillOpacity: .8,
        strokeWeight: 0,
        rotation: 0, 
        scale: 8, 
        anchor: new google.maps.Point(8, 8.5)
    }
    const normalIcon = { icon: {...iconBase}}; 
    const activeIcon = { icon: {...iconBase, fillColor: "green"}}

    useEffect(() => {
        const bounds = new google.maps.LatLngBounds();
        const track = selectedTrack ? tracks.find(el => el.name === selectedTrack) : undefined;

        if(track && track.latitude && track.longitude) {
            bounds.extend({lat: parseFloat(track.latitude), lng: parseFloat(track.longitude)});
        } else {
            tracks.forEach(track => {
                if(track.latitude && track.longitude){
                    console.log(parseFloat(track.latitude), parseFloat(track.longitude))
                    bounds.extend({lat: parseFloat(track.latitude), lng: parseFloat(track.longitude)});
                }
            })    
        }
    
        if(ref.current && !map){
            const myMap = new google.maps.Map(ref.current, {
                mapTypeControl: false, 
                streetViewControl: false,
            }); 
            setMap(myMap);
            myMap.fitBounds(bounds);
            if(track && track.latitude && track.longitude) myMap.setZoom(15);
        } else if(map){
            map.fitBounds(bounds);
            if(track && track.latitude && track.longitude) map.setZoom(15);
        }
    }, [tracks, selectedTrack])

    useEffect(() => {
        if(!map) return;
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]); 
        
        const newMarkerArr: google.maps.Marker[] = [];
        tracks
            .forEach(track => {
            // const infoWindow = new google.maps.InfoWindow({
            //     content: `<div><b>${track.name}</b></div>`, 
            //     ariaLabel: `${track.name}-marker`
            // }); 
            const iconChange = track.active ? activeIcon : normalIcon; 
            const marker = new google.maps.Marker({
                ...iconChange, 
                position: {lat: parseFloat(track.latitude), lng: parseFloat(track.longitude)}, 
                map: map,
            });
            marker.addListener("click", () => {
                // infoWindow.open({anchor: marker}); 
                setTrackSelected(track.name);
            })
            newMarkerArr.push(marker);
        })
        setMarkers([...newMarkerArr]);
    }, [tracks, selectedTrack, map])

    if(selectedTrack && !(tracks.find(el => el.name === selectedTrack))){
        return <div>Track is missing location data.</div>
    }

    return (
        <div ref={ref} className="w-100 map-height" /> 
    )
}



interface TrackInfo {
    track: Track; 
    trackImages: ImageDbEntry[];
    setTrackSelected: (str: string) => void;
    trackTourns: Tournament[];
}

function TrackInfo({track, trackImages, setTrackSelected, trackTourns}: TrackInfo){
    console.log('trackTourns', trackTourns)
    return (
        <div className='pt-3 d-flex flex-column h-100 map-selection-made-height'>
            <div className="d-flex justify-content-between">
                <div className='h4 mb-4'>{track.name}</div>
                <div>
                    <FontAwesomeIcon className='font-x-large pointer' icon={faXmark} onClick={() => setTrackSelected("")} />
                </div>
            </div>
            <div className='my-2 h5'>Address: {track.address}{track.address && track.city ? ", " : ""}{track.city}</div>
            {
                track.archHeightFt && track.archHeightInches ?
                    <div className='h5'>Arch Height: {track.archHeightFt}'{track.archHeightInches}"</div> : <></>
            }
            {
                track.distanceToHydrant ?
                    <div className='h5'>Arch Distance to Hydrant: {track.distanceToHydrant} feet</div> : <></>
            }
            {
                track.notes ?
                    <div className='my-2'>{track.notes}</div> : <></>
            }
            {
                !track.active ?
                    <div className='my-2'><i>This track is no longer in active use.</i></div> : <></>
            }
            {
                !track.latitude || !track.longitude ?
                    <div className='my-2'><i>Location information is missing for this track.</i></div> : <></>
            }
            <div className="flex-grow-1" />
            <div className='my-2'>
                <h6>Years Active</h6>
                <YearsActiveChart tournaments={trackTourns} />
            </div>
        </div>
    )
}

interface YearsActiveChartProps {
    tournaments: Tournament[];
}


function YearsActiveChart({tournaments}: YearsActiveChartProps){
    const counter = tournaments.reduce((accum: Record<number, number>, el) => {
        if(!accum[el.year]){
            accum[el.year] = 1; 
        } 
        return accum; 
    }, {})
    const data = Object.keys(counter).map(el => {
        return {
            year: parseInt(el), 
            numTourns: counter[parseInt(el)]
        }
    })

    return (
        <div style={{ width: '100%', height: 60 }}>

            <ResponsiveContainer>
                <BarChart
                layout="horizontal"
                data={data}
                margin={{
                    top: 5,
                    right: 5,
                    left: 0,
                    bottom: 10,
                }}
                >
                    <XAxis dataKey="year" type="number" domain={[1945, new Date().getFullYear()+2]} 
                        ticks={[1960, 1980,2000,2020]}>
                        <Label value="Year" position="bottom" offset={-5} />
                    </XAxis>
                    <YAxis dataKey="numTourns" type="number" domain={[0,1]} hide />
                    <Bar dataKey={"numTourns"} fill="#546f8a" radius={2} maxBarSize={5} /> 
                </BarChart>
            </ResponsiveContainer>
        </div>

    )
}

