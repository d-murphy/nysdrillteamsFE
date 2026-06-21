import * as React from "react";
import { LoginProvider } from "./utils/context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    createBrowserRouter,
    Link,
    RouterProvider,
    useNavigate,
} from "react-router-dom";

import Root from "./Pages/Root";
import Home from './Pages/Home';
import Image from "react-bootstrap/Image";
import ErrorBoundary from "./shared/components/ErrorBoundary";

const Schedule = React.lazy(() => import('./features/schedule/Schedule'));
const Tournament = React.lazy(() => import('./features/tournament/Tournament'));
const Broadcast = React.lazy(() => import("./Pages/Broadcast"));
const BroadcastInstructions = React.lazy(() => import("./Pages/Broadcast").then(m => ({ default: m.BroadcastInstructions })));
const PastSeasons = React.lazy(() => import("./features/schedule/PastSeasons"));
const PastSeason = React.lazy(() => import("./features/schedule/PastSeason"));
const TopRuns = React.lazy(() => import("./Pages/TopRuns"));
const Login = React.lazy(() => import('./Pages/Login'));
const AdminHome = React.lazy(() => import("./features/admin/AdminHome"));
const About = React.lazy(() => import("./Pages/About"));
const Search = React.lazy(() => import("./features/search/Search"));
const TournamentHistory = React.lazy(() => import("./features/tournament/TournamentHistory"));
const CurrentYearTotalPoints = React.lazy(() => import("./Pages/CurrentYearTotalPoints"));
const TeamSummary = React.lazy(() => import("./features/team/TeamSummary"));
const TeamHistoryBase = React.lazy(() => import("./features/team/TeamHistoryBase"));
const TeamHistory = React.lazy(() => import("./features/team/TeamHistory"));
const Locations = React.lazy(() => import("./Pages/Locations"));
const Projections = React.lazy(() => import("./Pages/Simulation/Projections"));
const Simulation = React.lazy(() => import("./Pages/Simulation"));
const ProjectionsHome = React.lazy(() => import("./Pages/Simulation/ProjectionsHome"));
const FantasyHome = React.lazy(() => import("./Pages/Simulation/FantasyHome"));
const FortyForFortyStart = React.lazy(() => import("./Pages/Simulation/FortyForFortyStart"));
const FortyForFortyEnd = React.lazy(() => import("./Pages/Simulation/FortyForFortyEnd"));


interface ErrorPageProps {
    includeImage?: boolean;
}
  
const ErrorPage = (props: ErrorPageProps) => {
    const { includeImage = true } = props;
    const navigate = useNavigate(); 
    return (
        <div>

            {includeImage && (
                <div className="nav-bg-color-dk">
                <div className="container d-flex justify-content-start p-4 "
                    onClick={() => navigate("/")}>
                    <div className="header-logo">
                        <Image fluid src="/static/img/logo_onetone.png" />                    
                    </div>
                </div>
            </div>
            )}
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
                path: "/Error", 
                element: <ErrorPage includeImage={false} />
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
                element: <ErrorBoundary><AdminHome /></ErrorBoundary>
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
            {
                path: "/TeamHistory", 
                element: <TeamHistoryBase />
            }, 
            {
                path: "/TeamHistory/:teamName", 
                element: <TeamHistory />
            }, 
            {
                path: "/Locations",
                element: <Locations />
            },
            {
                path: "/Locations/:location",
                element: <Locations />
            },
            {
                path: "/Simulation",
                element: <Simulation />
            }, 
            {
                path: "Simulation/Projections", 
                element: <ProjectionsHome />
            }, 
            {
                path: "/Simulation/Projections/:year",
                element: <Projections />
            }, 
            {
                path: "/Simulation/Fantasy", 
                element: <FantasyHome />
            },
            {
                path: "/Simulation/Fantasy/:pageToShow", 
                element: <FantasyHome />
            },
            {
                path: "/Simulation/Fantasy/:pageToShow/:gameId",
                element: <FantasyHome />
            },
            {
                path: "/Forty-for-Forty",
                element: <FortyForFortyStart />
            },
            {
                path: "/Forty-for-Forty/:id",
                element: <FortyForFortyEnd />
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
        path: "/Broadcast/:id/:showing",
        element: <Broadcast />
    },
]);
  
// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
        },
    },
});

export default function App() {

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <LoginProvider>
                    <React.Suspense fallback={<div>&nbsp;</div>}>
                        <RouterProvider router={router} />
                    </React.Suspense>
                </LoginProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}