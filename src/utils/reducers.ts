type loginReducerInitialStateType = {
    username: string, 
    rolesArr: string[], 
    jwt: string, 
    login: Function, 
    logout: Function
}

export const loginReducerInitialState:loginReducerInitialStateType = {
    username: '', 
    rolesArr: [], 
    jwt: '', 
    login: () => { }, 
    logout: () => { }, 
}

export const loginReducer = (state:loginReducerInitialStateType, action: {type:string, payload: {username:string, rolesArr:string[], jwt:string} }) => {
    const {type, payload} = action; 

    switch(type) {
        case "LOGIN": 
            return {
                ...state,
                username: payload.username, 
                rolesArr: payload.rolesArr, 
                jwt: payload.jwt 
            }
        case "LOGOUT": 
            return {
                ...state,
                username: '', 
                rolesArr: [], 
                jwt: '' 
            }
        default: 
            throw new Error(`No case for type: ${type}`)
    }
}
