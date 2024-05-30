
import React, { useEffect, useState } from "react"
import { Tournament } from "../types/types";
import Placeholder from "react-bootstrap/Placeholder"; 
import getTournamentWinner from "../utils/getTournamentWinners";
import { WinnerIconNoHov } from "./SizedImage";
import { useNavigate } from "react-router-dom";
import dateUtil from "../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";

interface StateWinnersProps {
    year: string
}

declare var SERVICE_URL: string; 

export default function StateWinners(props: StateWinnersProps) {
    const [tourns, setTourns] = useState<Tournament[]>([])
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(false); 


    useEffect(() => {
        fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?years=${props.year}&tournaments=New York State Championship,New York State OF Championship,New York State Jr. Championship`)
        .then(response => response.json())
        .then(data => {
            data.sort((a:Tournament, b:Tournament) => a.name < b.name ? -1 : 1)
            setTourns(data); 
            setLoading(false);
        })
        .catch((err:Error) => {
            console.log(err)
            setError(true);
        })
    },[])

    const skeletonKeys = [0,1,2]; 

    if(error) return <></> // fail quietly
    if(!loading && !tourns.length) return <></> // fail quietly


    const content = loading ?
        skeletonKeys.map((el:number) => {
            return (
                <StateWinnerLoadingSq key={el}/>
            )
        })
        :
        tourns.map((el:Tournament) => {
            if(Object.keys(el.top5).length === 0) return <></>;
            return (
                <StateWinnerSq tournament={el} />
            )
        })

    return (
        <div className="px-2 py-3 my-2">
            <div className="row ">
                <span className="h4 pb-3 me-3">Season Champions</span>
            </div>

            <div className="d-flex justify-content-center flex-wrap">
                {content}
            </div>
        </div>
    )
}

interface StateWinnerSqProps {
    tournament: Tournament
}

function StateWinnerSq(props: StateWinnerSqProps) {
    const tourn = props.tournament; 

    const seperator = " | "; 
    let winnerStr = getTournamentWinner(tourn, seperator); 
    let winnerArr = winnerStr.split(seperator); 
    const navigate = useNavigate(); 

    let secondStr = getTournamentWinner(tourn, seperator, true, "2nd Place"); 
    let thirdStr = getTournamentWinner(tourn, seperator, true, "3rd Place"); 
    let fourthStr = getTournamentWinner(tourn, seperator, true, "4th Place"); 
    let fifthStr = getTournamentWinner(tourn, seperator, true, "5th Place"); 

    return (
        <div className="mx-1 my-1 flex-grow-1">
            <div className="champs-bg rounded shadow-sm d-flex flex-column align-items-start justify-content-center p-4 text-center pointer" 
                onClick={() => navigate(`/Tournament/${tourn.id}`)}> 
                <div className="text-wrap h5" >
                    <span>{tourn.name.replace("New York State", "NYS")}</span>
                </div>
                <div className="text-wrap h6 grayText text-start mb-2" >
                    <span>{tourn.date ? dateUtil.getMMDDYYYY(new Date(tourn.date)) : ""}</span>
                    <span className="ps-1 grayText font-small">{tourn.track ? "@ " + tourn.track : ""}</span>
                    <span className="ps-1 grayText font-small">{(tourn.host && tourn.track && tourn.track !== tourn.host) ? "hosted by " + tourn.host : ""}</span>
                </div>
                <div className="flex-grow-1" />
                <div className="d-flex flex-row justify-content-center align-items-center align-self-center flex-wrap">
                    {winnerArr.map(el => <span className="p-1"><WinnerIconNoHov team={el} size="lg"/></span>)}
                </div>
                <div className="flex-grow-1" />
                <div className="w-100 d-flex flex-column h-100">
                    <div className="pb-2 pt-1 d-flex align-items-start flex-column">
                        <div className="h5 text-start mt-2 text-wrap">
                            {
                                winnerArr.map(el => {
                                    return (
                                        <>
                                            <FontAwesomeIcon className="pe-2 trophyGold" icon={faTrophy} size="sm"/>
                                            <span className="me-2">{el}</span>                                        
                                        </>
                                    )
                                })
                            }  
                        </div>
                        <div className="text-wrap h6 grayText text-start">
                            {tourn?.top5 && Object.keys(tourn?.top5).length && tourn.top5[0].points + " points"}
                        </div>
                    </div>
                    <div className="d-flex flex-column align-items-end grayText font-xx-small pt-3">
                        <div className="flex-grow-1"></div>
                        <div>{secondStr}</div>
                        <div>{thirdStr}</div>
                        <div>{fourthStr}</div>
                        <div>{fifthStr}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StateWinnerLoadingSq() {
    return (
        <div className="mx-1 w-25">
            <div className="champs-bg rounded shadow-sm w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center" > 
                <Placeholder animation="glow" className="p-0 text-center w-100">
                    <Placeholder xs={10} className="rounded" size="lg" bg="secondary"/>
                </Placeholder>
                 <div className="placeholder-glow d-flex justify-content-center align-items-center">
                    <div className="image-wrap-md placeholder bg-secondary mt-3 mb-4 rounded"></div>
                </div>
                <Placeholder animation="glow" className="p-0 text-center w-100">
                    <Placeholder xs={10} className="rounded" size="lg" bg="secondary"/>
                </Placeholder>
            </div>
        </div>
    )
}