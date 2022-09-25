import * as React from "react";
import { useEffect, useState } from "react";

declare var SERVICE_URL: string;

interface TotalPointsProp {
    year: number
}

type Regions = "Nassau" | "Northern" | "Suffolk" | "Western"; 

export default function TotalPoints(props:TotalPointsProp) {
    let year = props.year; 

    let url = `${SERVICE_URL}/runs/getTotalPoints?year=${year}&totalPointsFieldName=`; 

    const regionData: {[index: string]: {_id:string, points: number}[]} = {}; 
    const [region, setRegion] = useState<"" | Regions>(""); 
    const [selectedRegionTeamsArr, setTeamsArr] = useState<{_id:string, points: number}[]>([]); 
    const [topPoints, setTopPoints] = useState<number>(0); 

    const [isLoading, setIsLoading] = useState(false); 
    const [errorLoading, setErrorLoading] = useState(false); 
    const [noMoreClicks, setNoMoreClicks] = useState(false); 

    const fetchTotalPoints = (region:Regions) => {
        let urlWithRegion = `${url}${region}`; 
        fetch(urlWithRegion)
        .then(response => response.json())
        .then(data => {
            console.log('Total Point Data: ', data); 
            regionData[region] = data; 
            setTeamsArr(data);
            setTopPoints(data.length ? data[0].points : 0);   
            setNoMoreClicks(false); 
            setIsLoading(false); 
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
            setIsLoading(false);
        })
    }

    const selectRegion = (region:Regions) => {
        if(!noMoreClicks){
            setRegion(region); 
            if(regionData[region]){
                setTeamsArr(regionData[region]);
                setTopPoints(regionData[region].length ? regionData[region][0].points : 0);  
            } else {
                setNoMoreClicks(true)
                setIsLoading(true); 
                fetchTotalPoints(region);     
            }
        }
    }

    useEffect(() => {
        selectRegion('Nassau'); 
    }, [])

    let content = (
        <div className="p-3 m-2 ">
            <div className="row">
            <p><span className="h4 me-3">Total Points</span><i></i></p>
            </div>
            <div className="row">
                <div className="col-12 col-md-3">
                    <div className="d-flex flex-column ms-1 me-3">
                        <div className={`${region == "Nassau" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded`} onClick={() => selectRegion("Nassau")}>Nassau</div>
                        <div className={`${region == "Northern" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded`} onClick={() => selectRegion("Northern")}>Northern</div>
                        <div className={`${region == "Suffolk" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded`} onClick={() => selectRegion("Suffolk")}>Suffolk</div>
                        <div className={`${region == "Western" ? "circuit-selected" : "circuit-not-selected" } m-1 px-3 py-2 rounded`} onClick={() => selectRegion("Western")}>Western</div>
                    </div>                
                </div>
                <div className="col-12 col-md-9">
                    { errorLoading ? 
                        <div className="row">
                            <div className="col-12 d-flex flex-column align-items-center mt-5">
                                <div className="">Sorry, there was an error loading the total points.</div>
                            </div>
                        </div> : <></>
                    }
                    { isLoading ? 
                        <div className="row">
                            <div className="col-12 d-flex flex-column align-items-center mt-5">
                                <div className="spinner-border text-secondary" role="status"></div>
                            </div>
                        </div> : <></>                    
                    }
                    { !isLoading && !errorLoading ?
                        <div className="row">
                            <div className="col-12 big8-bg shadow-sm rounded px-4 py-4 d-flex flex-column align-items-center">
                                {
                                    selectedRegionTeamsArr.length ? 
                                        <>
                                            {year!=new Date().getFullYear() ? <h5 className="mb-2">Total Point Champs:</h5> : <></>}
                                            {selectedRegionTeamsArr.map((el) => {
                                                if(topPoints == el.points) return <div className="font-x-large"><b>{el._id} ({el.points})</b></div>
                                            })}
                                            <h5 className="mt-3">All Others:</h5>
                                            {selectedRegionTeamsArr.map((el) => {
                                                if(topPoints != el.points) return <div className="">{el._id} ({el.points})</div>
                                            })}    
                                        </>
                                        :
                                        <div className="py-5 my-5"><i>No point recorded for {region} in {year}.</i></div>
                                }
                                <div className="mt-4 font-x-small"><i>Total points reflect runs saved in DB and may not match official results.</i></div>
                            </div>
                        </div> : 
                        <></>                    
                    }
                </div>

            </div>
        </div>
    )
    return content; 
}