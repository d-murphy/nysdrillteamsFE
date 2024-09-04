import React, { useEffect, useRef, useState } from 'react';
import { ImageDbEntry, Tournament, Track } from '../types/types';
import { Wrapper, Status } from "@googlemaps/react-wrapper"; 
import { Form, Modal, Placeholder } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from "@fortawesome/free-solid-svg-icons"; 
import { Bar, BarChart, Label, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';


declare var SERVICE_URL: string;
declare var MAPS_API_KEY: string; 

export default function Locations(){
    const params = useParams();
    const navigate = useNavigate();

    const trackSelected = params.location
    const [loading, setLoading] = useState(true); 
    const [tracks, setTracks] = useState<Track[]>([]);
    const [errorLoading, setErrorLoading] = useState(false);

    const [trackImages, setTrackImages] = useState<ImageDbEntry[]>([])
    const [trackTourns, setTrackTourns] = useState<Tournament[]>([]);

    const setTrackSelected = (track: string) => {
        navigate(`/Locations/${encodeURIComponent(track)}`)
    }

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

    const selectedTrackInfo = tracks.find(el => el.name === trackSelected);

    if(tracks.length && trackSelected && !selectedTrackInfo){
        return <div className='container p-5 d-flex w-100 align-items-center flex-column'>
            <div className='py-2'>
                Sorry, we're missing info on this track.
            </div>
            <div className='py-2'>
                <button className="btn btn-secondary" onClick={() => setTrackSelected("")}>Back to Tracks</button>
            </div>
        </div>
    }


    return (
        <div className="container mb-2">
            <div className="text-center font-x-large my-2"><b>Track Locations</b></div>
            <StateHandler loading={loading} error={errorLoading} trackSelected={trackSelected}>
                <div className="">
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
                    { trackSelected && trackTourns.length ? 
                        <div className='row g-0 px-1 mt-2 pb-2'>
                            <TournamentHistory tourns={trackTourns} />
                        </div> : <></>                
                    }
                </div>
            </StateHandler>
        </div>

    )
}

interface TournamentHistoryProps {
    tourns: Tournament[];
}

function TournamentHistory({tourns}: TournamentHistoryProps){
    const sorted = tourns.sort((a,b) => {
        return new Date(a.date).getTime() < new Date(b.date).getTime() ? 1 : -1
    })
    const navigate = useNavigate(); 


    return(
        <div className='w-100 bg-white rounded '>
            <div className='h5 p-2'>Tournament History</div>
            <div className=''>
                <div className=" overflow-scroll text-nowrap pb-3">
                    {
                        sorted
                            .map(el => {
                            return (
                                <div className='d-inline-block m-1 p-2 bg-light rounded pointer' 
                                    onClick={() => navigate(`/Tournament/${el.id}`)}>
                                    <div>{el.name}</div>
                                    <div className='grayText'>{new Date(el.date).toLocaleDateString()}</div>
                                </div>
                            )})
                    }
                </div>
            </div> 
        </div>

    )

}







interface TrackImagesProps {
    trackImages: ImageDbEntry[];
    trackSelected: string;
}

function TrackImages({trackImages, trackSelected}: TrackImagesProps){
    const [showImage, setShowImage] = useState("");
    const imageObj = trackImages.find(el => el.url === showImage);

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
                {trackSelected} {imageObj?.imageName ? ` - ${imageObj.imageName}` : ""}
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='w-100 d-flex justify-content-center'>
                    <img src={showImage} alt="track-image" className="track-image-mx-ht max-width-100" />
                </div>
                {
                    imageObj?.imageCaption ? 
                        <div className='text-center mt-3 mb-1'>{imageObj?.imageCaption}</div> : <></>
                }
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
            <div className='px-2 h-100'>
                {trackSelected ? 
                    <TrackInfo 
                        track={tracks.find(el => el.name === trackSelected) as Track}
                        trackImages={trackImages}
                        setTrackSelected={setTrackSelected}
                        trackTourns={trackTourns}
                        /> : 
                    <div>
                        <div className='ps-1 py-2'>Select a track or click a marker on the map:</div>
                        <Form.Select aria-label="Select Track" value={trackSelected} onChange={((e) => {
                                setTrackSelected(e.target.value)
                            })}>
                            <option value=""></option>
                            {tracks.sort((a,b) => a.name < b.name ? -1 : 1).map(el => {
                                return <option key={el.name} value={el.name}>{el.name}</option>
                            })}
                        </Form.Select>
                        <div className='py-2' />                        
                    </div>
                }
            </div>
        </div>
    )
}


interface StateHandlerProps {
    loading: boolean;
    trackSelected: string; 
    error: boolean;
    children: React.ReactNode;
}


const StateHandler = function({loading, trackSelected,  error, children}: StateHandlerProps){

    return (
        <>
        {
            loading ? 
                <div className="row g-0">
                    <div className="col-md-4 col-12">
                        {
                            trackSelected ? 
                                <div className='bg-white rounded px-2 pt-4 pb-2 me-1 map-selection-made-height'>
                                    <div className="d-flex flex-column">
                                        <div>
                                            <Placeholder animation="glow" className="p-0 text-center mt-1">
                                                <Placeholder className="rounded w-50 height-30" bg="secondary" />
                                            </Placeholder>
                                        </div>
                                        <div className="mt-5">
                                            <Placeholder animation="glow" className="p-0 text-center mt-1">
                                                <Placeholder className="rounded w-100 minheight-180" bg="secondary" />
                                            </Placeholder>
                                        </div>
                                    </div>
                                </div> : 
                                <div className='bg-white rounded px-1 pt-4 pb-2 me-1'>
                                    <Placeholder animation="glow" className="p-0 text-center my-3">
                                        <Placeholder className="rounded w-100 height-30" bg="secondary" />
                                    </Placeholder>
                                </div>                            
                        }
                    </div>
                    <MapLoadingBlock />
                </div>
            : 
            error ? 
                <div className='m-5 d-flex justify-content-center h5'>
                    There was an error loading location data.  Please try again later. 
                </div> :
            children
        }
        </>

    )
}

const MapLoadingBlock = () => {
    return (
        <div className="col-md-8 col-12">
            <Placeholder animation="glow" className="ms-1">
                <Placeholder  className="w-100 map-selection-made-height"  bg="secondary"/>
            </Placeholder>
        </div>
    )
}


const otherMapStates = (status: Status) => {
    if(status === Status.FAILURE) return <div>Failed to load map</div>
    if(status === Status.LOADING) return <MapLoadingBlock />
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
    const normalIcon = { icon: {...iconBase, fillOpacity: .6}}; 
    const activeIcon = { icon: {...iconBase, fillColor: "green"}}

    useEffect(() => {
        const bounds = new google.maps.LatLngBounds();
        const track = selectedTrack ? tracks.find(el => el?.name === selectedTrack) : undefined;

        if(track && track.latitude && track.longitude) {
            bounds.extend({lat: parseFloat(track.latitude), lng: parseFloat(track.longitude)});
        } else {
            tracks.forEach(track => {
                if(track.latitude && track.longitude){
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
            if(track && track.latitude && track.longitude) {
                myMap.setCenter({lat: parseFloat(track.latitude), lng: parseFloat(track.longitude)});
                myMap.setZoom(15);
            } else {
                myMap.fitBounds(bounds); 
            }
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
            .sort((a,b) => a.active && !b.active ? 1 : -1)
            .forEach(track => {

            const contentStr = track.address && track.city ? 
                `<br/><div><b>${track.name}</b></div><div>${track.address}</div><div>${track.city}</div>` : 
                `<br/><div><b>${track.name}</b></div>`

            const infoWindow = new google.maps.InfoWindow({
                content: contentStr, 
                ariaLabel: `${track.name}-marker`
            }); 
            const iconChange = track.active ? activeIcon : normalIcon; 
            const marker = new google.maps.Marker({
                ...iconChange, 
                position: {lat: parseFloat(track.latitude), lng: parseFloat(track.longitude)}, 
                map: map,
            });
            marker.addListener("mouseover", () => {
                infoWindow.open({anchor: marker}); 
            }); 
            marker.addListener("mouseout", () => {
                infoWindow.close();
            })
            marker.addListener("click", () => {
                setTrackSelected(track.name);
            })
            newMarkerArr.push(marker);
        })
        setMarkers([...newMarkerArr]);
    }, [tracks, selectedTrack, map])

    if(selectedTrack && !(tracks.find(el => el?.name === selectedTrack))){
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
    const stateTournYears = trackTourns.filter(el => {
        return el.name === "New York State Championship"
    }).map(el => el.year).sort((a,b) => a < b ? -1 : 1);



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
                track.archHeightFt && track.archHeightFt !== 999 && 
                track.archHeightInches && track.archHeightInches !== 999 ?
                    <div className='h5'>Arch Height: {track.archHeightFt}'{track.archHeightInches}"</div> : <></>
            }
            {
                track.distanceToHydrant && track.distanceToHydrant !== 999 ?
                    <div className='h5'>Arch Distance to Hydrant: {track.distanceToHydrant} feet</div> : <></>
            }
            {
                stateTournYears.length ?
                    <div className='my-2'>State Tournaments Hosted: {stateTournYears.join(", ")}</div> : <></>
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

