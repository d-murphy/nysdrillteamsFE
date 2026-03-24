import * as React from "react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Tournament } from "../../types/types";

import getTournamentWinner from "../../utils/getTournamentWinners";

declare var SERVICE_URL: string;

interface TournamentWinnersProp {
    tournamentName: string;
    numberShown: number;
    yearOfDrill: number;
}


export default function TournamentWinners(props:TournamentWinnersProp) {
    const tournamentName = props.tournamentName;

    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery<Tournament[]>({
        queryKey: ['tournamentsByName', tournamentName],
        queryFn: () => fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?tournaments=${tournamentName}`).then(res => res.json()),
    });

    const tournaments = useMemo(() => {
        if (!data) return [];
        return data
            .map(el => ({ ...el, date: new Date(el.date) }))
            .sort((a, b) => a.date < b.date ? 1 : -1)
            .filter(el => el.top5 && el.top5.length > 0 && el.date.getFullYear() < props.yearOfDrill)
            .slice(0, props.numberShown)
            .map(el => ({ ...el, winnerStr: el.year + ": " + getTournamentWinner(el, ", ") }));
    }, [data, props.yearOfDrill, props.numberShown]);

    let content;
    if(isLoading){
        content = (
            <div className="">{` `}</div>
        )
    }
    if(isError){
        content = (
            <div className=""></div>
        )
    }

    if(!isLoading && !isError){
        let list = tournaments.map((el, index) => {
            return <div key={index} className="past-tourn-entry mx-2 text-center" onClick={() => navigate(`/Tournament/${el.id}`)}>{el.winnerStr}</div>
        })
        if(tournaments.length){
            content = (
                <div className="font-small d-flex flex-row">
                    {list.length ? <div className="mx-2 text-center"><b>Past Winners:</b> </div> : <div/> }
                    {list}
                </div>
            )
        } else {
            content = '';
        }
    }


    return (
        <div className="">
            {content}
        </div>
    )
}


