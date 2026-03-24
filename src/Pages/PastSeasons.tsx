import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

export default function PastSeasons() {

    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery<{_id: number, yearCount: number}[]>({
        queryKey: ['tournamentCounts'],
        queryFn: () => fetch(`${SERVICE_URL}/tournaments/getTournsCtByYear`).then(res => res.json()),
    });

    const yearFilter = new Date().getMonth() >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1;
    const tournYrCts = (data ?? []).filter(el => el._id && el._id <= yearFilter);

    let content;
    if(isLoading){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                </div>
            </div>
        )
    }
    if(isError){
        content = (
            <div className="row">
                <div className="col-12 d-flex flex-column align-items-center mt-5">
                    <div className="">Sorry, there was an error loading past season tournament counts.</div>
                </div>
            </div>
        )
    }


    if(!isLoading && !isError){
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


