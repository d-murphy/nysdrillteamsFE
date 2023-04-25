import * as React from "react";
import { useEffect } from 'react'; 
import { Outlet, useLocation } from "react-router-dom";

import Nav from '../Components/Nav';  


export default function Root() {
    const location = useLocation(); 

    useEffect(() => {
        //@ts-ignore
        window.gtag('event', 'page_view', {
            page_path: location.pathname + location.search,
            page_location: window.location.href
        })
    }, [location]);

    return (

        <div className="">
            <Nav />
            <div className="">
                <Outlet />
            </div>
        </div >


    )
}