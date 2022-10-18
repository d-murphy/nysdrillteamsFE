import React from 'react'; 
import {createContext , useContext, useReducer } from "react"; 
import { loginReducerInitialState, loginReducer } from './reducers'; 

const LoginContext = createContext(loginReducerInitialState); 

interface LoginProviderProps {
    children?: React.ReactNode
}

export const LoginProvider = ({children}: LoginProviderProps) => {
    const [state, dispatch] = useReducer(loginReducer, loginReducerInitialState); 

    const login = (username:string, rolesArr:string[], sessionId:string) => {
        dispatch({
            type: "LOGIN", 
            payload: {
                username: username, 
                rolesArr: rolesArr, 
                sessionId: sessionId
            }
        })
    }
    const logout = () => {
        dispatch({
            type: "LOGOUT", 
            payload: {
                username: '', 
                rolesArr: [], 
                sessionId: ''
            }
        })
    }
    const value = {
        username: state.username, 
        rolesArr: state.rolesArr, 
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
