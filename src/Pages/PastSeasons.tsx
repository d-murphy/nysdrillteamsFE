import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PastSeasons() {

    const [tournYrCts, setTournYearCts ] = useState<{_id: number, yearCount: number}[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 

    const navigate = useNavigate();     

    const fetchTournamentsCts = () => {


        fetch(`http://localhost:4400/tournaments/getTournsCtByYear`)
        .then(response => response.json())
        .then(data => {
            data = data.filter((el: {_id: number, yearCount: number}) => {
                return el._id && el._id <= new Date().getFullYear(); 
            })
            setTournYearCts(data); 
            setLoading(false);
        })
        .catch(err => {
            console.error(err)
            setErrorLoading(true); 
        })
    }



    useEffect(() => {
        fetchTournamentsCts(); 
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
                    <div className="">Sorry, there was an error loading past season tournament counts.</div>
                </div>
            </div>
        )
    }


    if(!loading && !errorLoading){
        content = (
            <div className="">
                <div className="d-flex flex-wrap justify-content-center align-items-center mt-4 mb-3 px-5">
                    <div><i>Click a year to navigate to past schedules and drills.</i></div>
                </div>
                <div className="d-flex flex-wrap justify-content-center align-items-center mt-4 mb-3 px-5">
                    {tournYrCts.map(el => {
                        return (
                            <div className="btn btn-light m-2 year-count-width" onClick={() => {navigate(`/Season/${el._id}`)}}>
                                <b>{el._id}</b> Events: {el.yearCount}
                            </div>
                        )
                    })}
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


