import * as React from "react";
import { useEffect } from 'react'; 
import { Outlet, useLocation } from "react-router-dom";

import Nav from '../Components/Nav';  
import ScrollToTop from "../utils/ScrollToTop";
import Footer from "../Components/Footer";


export default function Root() {
    console.log('Root component rendered');
    const location = useLocation(); 
    const pagePath = location.pathname + location.search
    useEffect(() => {
        //@ts-ignore
        window.gtag('event', 'page_view', {
            page_path: pagePath,
            page_location: window.location.href, 
            page_title: location.pathname
        })
    }, [pagePath]);

    return (

        <div className="d-flex flex-column min-screen-height">
            <ScrollToTop />
            <Nav />
            <div className="">
                <Outlet />
            </div>
            <div className="flex-grow-1"></div>
            <Footer />
        </div>


    )
}