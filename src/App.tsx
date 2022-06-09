import * as React from "react";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './Home';
import Nav from './Nav';  
import Schedule from './Schedule'; 

export default function App() {


    return (
        <BrowserRouter>
            <div className="page-color">
                <Nav />
                <div className="">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/Schedule" element={<Schedule year={new Date().getFullYear()} />} />
                        <Route path="test" element={<div>test</div>} />
                        <Route path="*" element={
                                <div>
                                    <p>Sorry, this URL doesn't mean anything to me.  <a href="/">Return Home?</a></p>
                                </div>
                            }/>
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}