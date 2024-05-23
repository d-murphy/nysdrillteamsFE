import * as React from "react";
import { useEffect } from 'react'; 
import { Outlet, useLocation } from "react-router-dom";

import Nav from '../Components/Nav';  
import ScrollToTop from "../utils/ScrollToTop";


export default function Root() {
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

        <div className="">
            <ScrollToTop />
            <Nav />
            <div className="">
                <Outlet />
            </div>
        </div >


    )
}