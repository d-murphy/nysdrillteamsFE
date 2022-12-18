import React from 'react'; 
import {createContext , useContext, useReducer } from "react"; 
import { loginReducerInitialState, loginReducer } from './reducers'; 

const LoginContext = createContext(loginReducerInitialState); 

interface LoginProviderProps {
    children?: React.ReactNode
}

export const LoginProvider = ({children}: LoginProviderProps) => {
    const [state, dispatch] = useReducer(loginReducer, loginReducerInitialState); 

    const login = (username:string, role:string, sessionId:string) => {
        dispatch({
            type: "LOGIN", 
            payload: {
                username: username, 
                role: role, 
                sessionId: sessionId
            }
        })
    }
    const logout = () => {
        dispatch({
            type: "LOGOUT", 
            payload: {
                username: '', 
                role: '', 
                sessionId: ''
            }
        })
    }
    const value = {
        username: state.username, 
        role: state.role, 
        sessionId: state.sessionId, 
        login, 
        logout
    }
    return <LoginContext.Provider value={value}>{children}</LoginContext.Provider>; 
}

export const useLoginContext = () => {
    const context = useContext(LoginContext)
    if(context === undefined){
        throw new Error("useLoginContext must be used within Login Context")
    }
    return context; 
}
