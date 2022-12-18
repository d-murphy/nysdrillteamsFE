type loginReducerInitialStateType = {
    username: string, 
    role: string, 
    sessionId: string, 
    login: Function, 
    logout: Function
}

export const loginReducerInitialState:loginReducerInitialStateType = {
    username: '', 
    role: '', 
    sessionId: '', 
    login: () => { }, 
    logout: () => { }, 
}

export const loginReducer = (state:loginReducerInitialStateType, action: {type:string, payload: {username:string, role:string, sessionId:string} }) => {
    const {type, payload} = action; 

    switch(type) {
        case "LOGIN": 
            return {
                ...state,
                username: payload.username, 
                role: payload.role, 
                sessionId: payload.sessionId 
            }
        case "LOGOUT": 
            return {
                ...state,
                username: '', 
                role: '', 
                sessionId: '' 
            }
        default: 
            throw new Error(`No case for type: ${type}`)
    }
}
