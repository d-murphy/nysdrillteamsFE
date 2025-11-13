import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import { AuthProvider } from "react-oidc-context";
import { faArrowRightFromBracket, faCircleUser, faHome, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useLocation, useNavigate } from "react-router-dom";
import FantasyNewGame from "./FantasyNewGame";
import FantasyGame from "./FantasyGame";
import LandingPage from "../../Components/fantasy/LandingPage";
import MyTooltip from "../../GeneralComponents/Tooltip";
import FantasyProfile from "../../Components/fantasy/FantasyProfile";
import useAssureTeamName from "../../hooks/useAssureTeamName";



declare var INSTANCE_URL: string;
// you should use a pathname hook instead

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_MH5nFKQ9Z",
  client_id: "1slj05luihr2tnuoitm8dfv7nn",
  redirect_uri: `${INSTANCE_URL}/Simulation/Fantasy`,
  response_type: "code",
  scope: "email openid phone",
};  


export default function FantasyHome() {
    const navigate = useNavigate(); 
    const pathname = useLocation(); 
    const pathSegments = pathname.pathname.split('/'); 
    const pageToShow = pathSegments[3]; 
    const gameId = pathSegments[4]; 

    const content = !pageToShow ? <LandingPage />
    : pageToShow === 'newgame' ? <FantasyNewGame />
    : pageToShow === 'game' ? <FantasyGame gameId={gameId} />
    : pageToShow === 'profile' ? <FantasyProfile />
    : null; 

    if(!content) navigate('/'); 

    return (
        <AuthProvider {...cognitoAuthConfig}>
            <div className="container">
                <div className="text-center font-x-large my-2"><b>Fantasy Home</b></div>
                <LoginWrapper >
                    {/* <TeamSummaries /> */}
                    {content}
                </LoginWrapper>
            </div>
        </AuthProvider>
    )
}



interface LoginProps {
    children?: React.ReactNode;
}

function LoginWrapper({children}: LoginProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation();
  const { data: teamName } = useAssureTeamName(auth.user?.profile.email);
  console.log("new team name", teamName);

  const signOutRedirect = () => {
    const clientId = "1slj05luihr2tnuoitm8dfv7nn";
    const logoutUri = "http://localhost:8080/Simulation/Fantasy";
    const cognitoDomain = "https://us-east-1mh5nfkq9z.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return (
        <div className="text-center w-100 pt-5">
            <div className="spinner-border text-secondary" role="status"></div>
        </div>
    );
  }

  if (auth.error) {
    return <div className="text-center w-100">Encountering error... {auth.error.message}</div>;
  }

  console.log("pathname", pathname.pathname);

  const includeHomeLink = !['/simulation/fantasy/', '/simulation/fantasy'].includes(pathname.pathname.toLowerCase());


    return (
        <div className="d-flex flex-column">
        <div className="d-flex justify-content-end w-100 mb-2">
            {
                auth.isAuthenticated ? 
                <div className="d-flex justify-content-end w-100 ">
                    {
                        includeHomeLink && (
                            <button data-type="button" className="btn filter-icon-bg d-flex justify-content-center align-items-center me-1" onClick={() => navigate("/simulation/fantasy/")}>
                                <FontAwesomeIcon icon={faHome} size="lg"/> 
                            </button>
                        )
                    }

                    <MyTooltip text="My Profile">
                        <button data-type="button" className="btn filter-icon-bg d-flex justify-content-center align-items-center me-1" onClick={() => navigate("/simulation/fantasy/profile")}>
                            <FontAwesomeIcon icon={faUser} size="lg"/> 
                        </button>
                    </MyTooltip>
                    
                    <MyTooltip text="Log Out">
                        <button 
                            data-type="button" 
                            className="btn filter-icon-bg d-flex justify-content-center align-items-center" 
                            onClick={() => {auth.removeUser(); signOutRedirect()}}
                            >
                            <FontAwesomeIcon icon={faArrowRightFromBracket} size="lg"/> 
                        </button> 
                    </MyTooltip>
                </div> : 
                    <button data-type="button" className="btn filter-icon-bg d-flex justify-content-center align-items-center" onClick={() => auth.signinRedirect()}>
                        Log In
                        <FontAwesomeIcon icon={faCircleUser} size="lg" className="ms-2"/> 
                    </button> 
            }            
        </div>
        {children}
        </div>
    );

}

  
  
  