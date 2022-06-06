import * as React from "react";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
        <BrowserRouter>
            <div className="page-color">
                <Nav />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="test" element={<div>test</div>} />
                    <Route path="*" element={
                            <div>
                                <p>Sorry, this URL doesn't mean anything to me.  <a href="/">Return Home?</a></p>
                            </div>
                        }/>
                </Routes>
            </div>
        </BrowserRouter>
    );
}