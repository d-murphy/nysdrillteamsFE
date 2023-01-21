import * as React from "react";
import { LoginProvider } from "./utils/context"; 
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import Root from "./Pages/Root";

import Home from './Pages/Home';
import Schedule from './Pages/Schedule'; 
import Tournament from './Pages/Tournament';
import Track from './Pages/Track';
import PastSeasons from "./Pages/PastSeasons";
import PastSeason from "./Pages/PastSeason"; 
import RunSearch from "./Pages/RunSearch";
import Login from './Pages/Login'; 
import AdminHome from "./Pages/AdminHome";
import About from "./Pages/About"
  
  

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <div>Sorry, there's an error.</div>,
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
            {
                path: "/Track/:trackName", 
                element: <Track />
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
                path: "/TopRunsAndSearch", 
                element: <RunSearch />
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
            }
        ],
    },
]);
  
export default function App() {

    return (
        <LoginProvider>
            <RouterProvider router={router} />
        </LoginProvider>
    );
}