import * as React from "react";
import { useEffect } from "react";

export default function App() {

    const fetchTournaments = () => {
        return fetch("http://localhost:4400/tournaments/getTournaments")
            .then((resp) => console.log(resp.json()))
            .then((data) => console.log(data))
            .catch((err) => console.error(err))
    }

    useEffect(() => {
        console.log('hiya')
        fetchTournaments(); 
    }, []); 

    return (
        <div>
            <h1>NYS Drill Teams</h1>
        </div>
    );
}