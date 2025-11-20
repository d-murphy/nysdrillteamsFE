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
import useAssureTeamName from "../../hooks/fantasy/useAssureTeamName";
import { useSubmitAccessCode } from "../../hooks/fantasy/useSubmitAccessCode";
import { Form } from "react-bootstrap";
import Button from "../../Components/Button";



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

    const header = !pageToShow ? "Fantasy Home" : 
        pageToShow === 'newgame' ? "New Game" :
        pageToShow === 'game' ? "Fantasy Game" :
        pageToShow === 'profile' ? "My Profile" :
        "Fantasy Home";

    if(!content) navigate('/'); 

    return (
        <AuthProvider {...cognitoAuthConfig}>
            <div className="container">
                <div className="text-center font-x-large my-2"><b>{header}</b></div>
                <LoginWrapper >
                    {content}
                </LoginWrapper>
            </div>
        </AuthProvider>
    )
}


export function TempLandingPage() {


    return (
        <div className="d-flex flex-column align-items-center justify-content-center w-100 bg-white rounded shadow-sm p-5 gap-4">
            <div className="text-center font-x-large">Welcome to the Fantasy Racing League!</div>
            <div className="text-center">We're still putting finishing touches on the league.  Create an account to get updates as we get closer to launch.  We'll be rolling out access for everyone soon.</div>
        </div>
    )
}


interface LoginProps {
    children?: React.ReactNode;
}

function LoginWrapper({children}: LoginProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation();
  const { data: userInfo, isLoading: isLoadingUserInfo, refetch: refetchUserInfo } = useAssureTeamName(auth.user?.profile.email);

  const url = window.location.href;
  const domain = url.split('/')[2];
  const urlToUse = domain.includes('localhost') ? `http://${domain}` : `https://${domain}`;

  const signOutRedirect = () => {
    const clientId = "1slj05luihr2tnuoitm8dfv7nn";
    const logoutUri = `${urlToUse}/Simulation/Fantasy`;
    const cognitoDomain = "https://us-east-1mh5nfkq9z.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading || isLoadingUserInfo) {
    return (
        <div className="text-center w-100 pt-5">
            <div className="spinner-border text-secondary" role="status"></div>
        </div>
    );
  }

  if (auth.error) {
    return <div className="text-center w-100">Encountered error: {auth.error.message}</div>;
  }

  if (auth.isAuthenticated && !userInfo?.codeUsed) {
    return <AccessCodeRequired refetchUserInfo={refetchUserInfo} />;
  }

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
            {
            userInfo?.codeUsed ? children : <TempLandingPage />
            }
        </div>
    );
}


interface AccessCodeRequiredProps {
    refetchUserInfo: () => void;
}

function AccessCodeRequired({refetchUserInfo}: AccessCodeRequiredProps) {
    const [accessCode, setAccessCode] = useState('');
    const auth = useAuth();

    const url = window.location.href;
    const domain = url.split('/')[2];

    const signOutRedirect = () => {
        const clientId = "1slj05luihr2tnuoitm8dfv7nn";
        const urlToUse = domain.includes('localhost') ? `http://${domain}` : `https://${domain}`;
        const logoutUri = `${urlToUse}/Simulation/Fantasy`;
        const cognitoDomain = "https://us-east-1mh5nfkq9z.auth.us-east-1.amazoncognito.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    const mutation = useSubmitAccessCode(
        () => {
            refetchUserInfo();
        },
        (error) => {
            console.error(error);
        }
    );

    return (
        <div className="d-flex flex-column align-items-end justify-content-center w-100">
            <MyTooltip text="Log Out">
                <button 
                    data-type="button" 
                    className="btn filter-icon-bg d-flex justify-content-center align-items-center mb-2" 
                    onClick={() => {auth.removeUser(); signOutRedirect()}}
                    >
                    <FontAwesomeIcon icon={faArrowRightFromBracket} size="lg"/> 
                </button> 
            </MyTooltip>
            <div className="d-flex flex-column align-items-center justify-content-center w-100 bg-white rounded shadow-sm p-5 gap-4">
                <div className="text-center">Thanks for creating an account in our new fantasy racing league.  Please enter your access code to continue.</div>
                <div className="text-center">Don't have a code?  We'll be rolling out access for everyone soon.  Please check back while we finish up some final changes.</div>
                <div className="d-flex flex-column align-items-center justify-content-center w-100 gap-2 mt-4">
                    <Form.Control placeholder="Access Code" className="w-160p text-center" type="text" onChange={(e) => setAccessCode(e.target.value)} />
                    <Button disabled={mutation.isPending || mutation.isSuccess} className="w-80p" onClick={() => mutation.mutate({accessCode: accessCode})} text="Submit"></Button>
                    {mutation.isPending ? 
                    <div className="spinner-border text-secondary" role="status"></div>
                    :
                    mutation.isError ? 
                    <div className="text-danger">
                        {mutation.error.message}
                    </div>
                    :
                    <div className="py-2"></div>
                    }
                </div>            
            </div>
        </div>
    );
}

  
  
  