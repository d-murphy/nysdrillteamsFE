import React from "react";
import { useAuth } from "react-oidc-context";
import { useSimTeamSummaries } from "../../hooks/useSimTeamSummaries";
import { AuthProvider } from "react-oidc-context";
import { Button } from "react-bootstrap";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MyStats from "../../Components/fantasy/myStats";
import Leaderboard from "../../Components/fantasy/leaderboard";
import { useLocation, useNavigate } from "react-router-dom";
import FantasyNewGame from "./FantasyNewGame";
import FantasyGame from "./FantasyGame";




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

    console.log('FantasyHome rendered');


    const content = !pageToShow ? 
        <>
            <MyStats />
            <Leaderboard />
            <div className="d-flex justify-content-center">
                <Button onClick={() => navigate('/Simulation/Fantasy/newgame')}>Start a New Game</Button>
            </div>
        </>
    : pageToShow === 'newgame' ? 
        <>
            <FantasyNewGame />
        </>
    : pageToShow === 'game' ? 
        <>
            <FantasyGame gameId={gameId} />
        </>
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

  const signOutRedirect = () => {
    const clientId = "1slj05luihr2tnuoitm8dfv7nn";
    const logoutUri = "http://localhost:8080/Simulation/Fantasy";
    const cognitoDomain = "https://us-east-1mh5nfkq9z.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div className="text-center w-100">Loading...</div>;
  }

  if (auth.error) {
    return <div className="text-center w-100">Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div className="d-flex flex-column">
        <div className="d-flex justify-content-end w-100">
            <button data-type="button" className="btn filter-icon-bg d-flex justify-content-center align-items-center  me-1" onClick={() => {auth.removeUser(); signOutRedirect()}}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} size="lg" className="mx-2"/> 
            </button> 
        </div>        
        {/* <pre> Hello: {auth.user?.profile.email} </pre>
        <pre> ID Token: {auth.user?.id_token} </pre>
        <pre> Access Token: {auth.user?.access_token} </pre>
        <pre> Refresh Token: {auth.user?.refresh_token} </pre> */}
        {children}
      </div>
    );
  }

  return (
        <div className="d-flex justify-content-center">
            <div>Please login to start fantasy racing</div>
            <Button onClick={() => auth.signinRedirect()}>Sign in</Button>
        </div>
  );
}
  



  
  
  