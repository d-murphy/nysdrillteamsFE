import * as React from "react";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './Pages/Home';
import Nav from './Components/Nav';  
import Schedule from './Pages/Schedule'; 
import Tournament from './Pages/Tournament';
import Track from './Pages/Track';
import PastSeasons from "./Pages/PastSeasons";
import PastSeason from "./Pages/PastSeason"; 
import RunSearch from "./Pages/RunSearch";

declare var SERVICE_URL: string; 

export default function App() {

    console.log(`checking env var: ${SERVICE_URL}` )

    return (
        <BrowserRouter>
            <div className="">
                <Nav />
                <div className="">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/Schedule" element={<Schedule year={new Date().getFullYear()} bgColorClass="bg-white" />} />
                        <Route path="/Tournament/:id" element={<Tournament />} />
                        <Route path="/Track/:trackName" element={<Track />} />
                        <Route path="/PastSeasons" element={<PastSeasons />} />
                        <Route path="/Season/:id" element={<PastSeason />} />
                        <Route path="/TopRunsAndSearch" element={<RunSearch />} />
                        <Route
                        path="*"
                        element={
                                <div className="d-flex justify-content-center align-items-center my-5">
                                    <div>Sorry, there's nothing at this URL.</div>
                                </div>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}