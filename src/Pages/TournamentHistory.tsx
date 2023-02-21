import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import getTournamentWinner from '../utils/getTournamentWinners';
import { Tournament } from '../types/types';
import dateUtil from '../utils/dateUtils';

declare var SERVICE_URL: string; 

interface TournamentHistoryProps {

}

export default function TournamentHistory(props:TournamentHistoryProps){
    let params = useParams();
    const name = params.name; 
    const navigate = useNavigate(); 

    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(false); 
    const [tourns, setTourns] = useState<Tournament[]>([]); 

    useEffect(() => {
        fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?tournaments=${name}`)
        .then(data => data.json())
        .then(data => {
            data = data.filter((el: Tournament) => {
                return Number(el.year)  < new Date().getFullYear()
            }).sort((a:Tournament, b:Tournament) => {
                return a.year > b.year ? -1 : 1;
            })
            setTourns(data); 
            setLoading(false); 
        })
        .catch((err:Error) => {
            console.log(err); 
            setError(true); 
        })
    }, [])

    if(error) return <div className='p-3 m-3 w-100 text-center'>There was an error loading this info.  Please try again.</div>
    if(loading) return (
        <div className="col-12 d-flex flex-column align-items-center mt-5">
            <div className="spinner-border text-secondary" role="status"></div>
        </div>
    )

    const list = tourns.map(tourn => {
        const seperator = " | "; 
        let winnerStr = getTournamentWinner(tourn, seperator, true); 
        let secondStr = getTournamentWinner(tourn, seperator, true, "2nd Place"); 
        let thirdStr = getTournamentWinner(tourn, seperator, true, "3rd Place"); 
        let fourthStr = getTournamentWinner(tourn, seperator, true, "4th Place"); 
        let fifthStr = getTournamentWinner(tourn, seperator, true, "5th Place"); 
        return (
            <div className='row shadow-sm rounded my-1 w-100 bg-white pointer' 
                onClick={() => {navigate(`/Tournament/${tourn.id}`)}}>
                <div className='col-12 col-md-3'>
                    <div className='h-100 d-flex justify-content-center align-items-center flex-column'>
                        <div className='font-x-large'>                        
                            {tourn.year}
                        </div>
                        <div className="font-xx-small text-center">
                            {`${dateUtil.getMMDDYYYY(tourn.date)} @ ${tourn.track}`}
                        </div>
                    </div>
                </div>
                <div className='col-12 col-md-5'>
                    <div className='h-100 d-flex flex-column justify-content-center align-items-center text-center py-2'>
                        {winnerStr ? <div className='font-xx-small'>{`1st Place`}</div> : <></> }
                        <div>{winnerStr}</div>
                    </div>
                </div>
                <div className='col-12 col-md-4'>
                    <div className='h-100 d-flex flex-column justify-content-center align-items-center text-center py-2 font-xx-small'>
                        {   
                            secondStr ? 
                                <div>2nd Place: {secondStr}</div> : <></>
                        }
                        {   
                            thirdStr ? 
                                <div>3rd Place: {thirdStr}</div> : <></>
                        }
                        {   
                            fourthStr ? 
                                <div>4th Place: {fourthStr}</div> : <></>
                        }
                        {   
                            fifthStr ? 
                                <div>5th Place: {fifthStr}</div> : <></>
                        }
                    </div>
                </div>
            </div>
        )
    })
    return (
        <div className='container'>
            <div className="text-center w-100 font-x-large mx-2 my-3">Tournament History: {name}</div>
            <div>
                {list}
            </div>
        </div>
    )
}