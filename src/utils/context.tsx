import React from 'react'; 
import {createContext , useContext, useReducer } from "react"; 
import { loginReducerInitialState, loginReducer } from './reducers'; 

const LoginContext = createContext(loginReducerInitialState); 

interface LoginProviderProps {
    children?: React.ReactNode
}

export const LoginProvider = ({children}: LoginProviderProps) => {
    const [state, dispatch] = useReducer(loginReducer, loginReducerInitialState); 

    const login = (username:string, rolesArr:string[], jwt:string) => {
        dispatch({
            type: "LOGIN", 
            payload: {
                username: username, 
                rolesArr: rolesArr, 
                jwt: jwt
            }
        })
    }
    const logout = () => {
        dispatch({
            type: "LOGOUT", 
            payload: {
                username: '', 
                rolesArr: [], 
                jwt: ''
            }
        })
    }
    const value = {
        username: state.username, 
        rolesArr: state.rolesArr, 
        jwt: state.jwt, 
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
