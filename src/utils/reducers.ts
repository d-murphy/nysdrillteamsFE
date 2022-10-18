type loginReducerInitialStateType = {
    username: string, 
    rolesArr: string[], 
    sessionId: string, 
    login: Function, 
    logout: Function
}

export const loginReducerInitialState:loginReducerInitialStateType = {
    username: '', 
    rolesArr: [], 
    sessionId: '', 
    login: () => { }, 
    logout: () => { }, 
}

export const loginReducer = (state:loginReducerInitialStateType, action: {type:string, payload: {username:string, rolesArr:string[], sessionId:string} }) => {
    const {type, payload} = action; 

    switch(type) {
        case "LOGIN": 
            return {
                ...state,
                username: payload.username, 
                rolesArr: payload.rolesArr, 
                sessionId: payload.sessionId 
            }
        case "LOGOUT": 
            return {
                ...state,
                username: '', 
                rolesArr: [], 
                sessionId: '' 
            }
        default: 
            throw new Error(`No case for type: ${type}`)
    }
}
