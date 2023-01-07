import * as React from "react";
import { Outlet } from "react-router-dom";

import Nav from '../Components/Nav';  


export default function Root() {

    return (

        <div className="">
            <Nav />
            <div className="">
                <Outlet />
            </div>
        </div >


    )
}