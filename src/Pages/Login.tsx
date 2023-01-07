import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPost } from "../utils/network";
import { useLoginContext } from "../utils/context";

declare var SERVICE_URL: string;

export default function Login() {
    let navigate = useNavigate();
    const {login, username} = useLoginContext(); 
    if(username) navigate('/adminHome'); 

    const [inputFields , setInputFields] = useState({
        username: '',
        password: ''
    })
    const [error, setErrorMessage] = useState(''); 
    const [loggingIn, setLoggingIn] = useState(false); 

    const inputsHandler = (e:React.ChangeEvent<HTMLInputElement>) =>{
        setErrorMessage(""); 
        setInputFields( {
            ...inputFields,
            [e.target.name]: e.target.value
        })
    }

    const tryLogin = () => {
        setLoggingIn(true); 
        fetchPost(`${SERVICE_URL}/users/login`, {
            username: inputFields.username, 
            password: inputFields.password
        })
        .then(response => response.json())
        .then(body => {
            let {username, sessionId, role} = body; 
            login(username, role, sessionId); 
            navigate('/adminHome'); 
        })
        .catch(err => {
            console.log(err); 
            setErrorMessage("Unsuccessful login."); 
            setLoggingIn(false); 
            setInputFields( {
                ...inputFields,
                password: ''
            })
        })
    }

    return (
        <div className="mt-4 container">
            <div className="d-flex flex-column align-items-center p-3 ">
                <div><h3>Admin Login</h3></div>
                <div className="mt-3 mb-1"><h5>Username</h5></div>
                <div className="mt-1 mb-3">
                    <input name="username" value={inputFields.username} onChange={inputsHandler} className="login-input text-center"   />
                </div>
                <div className="mt-3 mb-1"><h5>Password</h5></div>
                <div className="mt-1 mb-3">
                    <input name="password" value={inputFields.password} onChange={inputsHandler} className="login-input text-center" type="password" />
                </div>
                <div className="my-3"><button className="btn login-button" onClick={tryLogin} disabled={loggingIn}>Login</button></div>
                <div className="mt-3 mb-5">{error ? error : ' '}</div>
            </div>
        </div>        
    )
}


