import * as React from "react";
import { LoginProvider } from "./utils/context"; 
import {
    createBrowserRouter,
    Link,
    RouterProvider,
    useNavigate
} from "react-router-dom";

import Root from "./Pages/Root";

import Home from './Pages/Home';
import Schedule from './Pages/Schedule'; 
import Tournament from './Pages/Tournament';
import Broadcast, { BroadcastInstructions } from "./Pages/Broadcast";
import PastSeasons from "./Pages/PastSeasons";
import PastSeason from "./Pages/PastSeason"; 
import TopRuns from "./Pages/TopRuns";
import Login from './Pages/Login'; 
import AdminHome from "./Pages/AdminHome";
import About from "./Pages/About"
import Search from "./Pages/Search";
import TournamentHistory  from "./Pages/TournamentHistory";
import CurrentYearTotalPoints from "./Pages/CurrentYearTotalPoints";
import Image from "react-bootstrap/Image";
import TeamSummary from "./Pages/TeamSummary";

  
const ErrorPage = () => {
    const navigate = useNavigate(); 
    return (
        <div>

            <div className="nav-bg-color-dk">
                <div className="container d-flex justify-content-start p-4 "
                    onClick={() => navigate("/")}>
                    <div className="header-logo">
                        <Image fluid src="/static/img/logo_onetone.png" />                    
                    </div>
                </div>
            </div>
            <div className="content">
                <div className="container">
                    <div className="d-flex align-items-center justify-content-center mt-5">
                        <div>Sorry, something isn't right. <Link className="video-links" to="/">Let's head home.</Link> </div>

                    </div>
                </div>
            </div>
        </div>
    
    )

}


const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "/Schedule", 
                element: <Schedule year={new Date().getFullYear()} bgColorClass="bg-light" />
            }, 
            {
                path: "/Tournament/:id", 
                element: <Tournament />
            }, 
            // {
            //     path: "/Track/:trackName", 
            //     element: <Track />
            // }, 
            {
                path: "/TournamentHistory/:name", 
                element: <TournamentHistory />
            },
            {
                path: "/PastSeasons", 
                element: <PastSeasons />
            }, 
            {
                path: "/Season/:id", 
                element: <PastSeason />
            }, 
            {
                path: "/TopRuns", 
                element: <TopRuns />
            }, 
            {
                path: "/RunSearch", 
                element: <Search />
            },
            {
                path: "/AdminHome", 
                element: <AdminHome />
            }, 
            {
                path: "/Login", 
                element: <Login />
            }, 
            {
                path: "/About", 
                element: <About />
            },
            {
                path: "/TotalPoints", 
                element: <CurrentYearTotalPoints />
            }, 
            {
                path: "/TeamSummaries", 
                element: <TeamSummary />
            },
        ],
    },
    {
        path: "/Broadcast", 
        element: <BroadcastInstructions />
    },
    {
        path: "/Broadcast/:id", 
        element: <BroadcastInstructions />
    },
    {
        path: "/Broadcast/:id/:topornext", 
        element: <BroadcastInstructions />
    },
    {
        path: "/Broadcast/:id/:topornext/:contest", 
        element: <Broadcast />
    }


]);
  
export default function App() {

    return (
        <LoginProvider>
            <RouterProvider router={router} />
        </LoginProvider>
    );
}