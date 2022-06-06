import * as React from "react";
import { useEffect } from "react";
import Home from './Home';
import Nav from './Nav';  

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
        <div className="container">
            <h1 className="d-flex justify-content-center p-3">NYS Drill Teams</h1>
            <Nav />
            <Home/>

        </div>
    );
}