import * as React from "react";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './Pages/Home';
import Nav from './Components/Nav';  
import Schedule from './Pages/Schedule'; 
import Tournament from './Pages/Tournament';

export default function App() {


    return (
        <BrowserRouter>
            <div className="">
                <Nav />
                <div className="">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/Schedule" element={<Schedule year={new Date().getFullYear()} />} />
                        <Route path="/test" element={<div>test</div>} />
                        <Route path="/Tournament/:id" element={<Tournament />} />
                        <Route
                        path="*"
                        element={
                                <main style={{ padding: "1rem" }}>
                                <p>There's nothing here!</p>
                                </main>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}