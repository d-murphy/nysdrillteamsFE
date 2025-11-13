import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";



export default function useRequireLogIn() {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(!auth.isAuthenticated){
            navigate('/simulation/fantasy/');
        }
    }, [auth.isAuthenticated]);
}