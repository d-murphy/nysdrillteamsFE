import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

declare var SERVICE_URL: string;

export default function PastSeasons() {

    const [tournYrCts, setTournYearCts ] = useState<{_id: number, yearCount: number}[]>([]); 
    const [loading, setLoading] = useState(true); 
    const [errorLoading, setErrorLoading] = useState(false); 

    const navigate = useNavigate();     

    const fetchTournamentsCts = () => {

        const yearFilter = new Date().getMonth() >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1; 

        fetch(`${SERVICE_URL}/tournaments/getTournsCtByYear`)
        .then(response => response.json())
        .then(data => {
            data = data.filter((el: {_id: number, yearCount: number}) => {
                return el._id && el._id <= yearFilter;  
            })
            setTournYearCts(data); 
            setLoading(false);
        })
        .catch(err => {
            console.log(err)
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
                    {tournYrCts.map((el, ind) => {
                        return (
                            <div className="btn btn-light m-2 py-2 year-count-width shadow-sm" onClick={() => {navigate(`/Season/${el._id}`)}} key={ind}>
                                <h5>{el._id}</h5>
                                <div>{el.yearCount} Events</div>
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


