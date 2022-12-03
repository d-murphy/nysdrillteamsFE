import { useLoginContext } from "../utils/context";

export class CustomError extends Error {
    status: number; 
    response: any; 
    constructor(response: any, status: number, message:string) {
      super(message);  
      this.status = status;
      this.response = response; 
      // 👇️ because we are extending a built-in class
      Object.setPrototypeOf(this, CustomError.prototype);
    }
}

  export const fetchPost = async function(url:string, body:{}, sessionId?:string){
    return fetch(url, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId: sessionId, 
            ...body
        })
    })
    .then(res => {
        // have fetch throw an error if non-200
        if (!res.ok) {
            throw new CustomError(res, res.status, "HTTP Status Code: " + res.status); 
        }
        return res
    })
}

export const fetchGet = async function(url:string, sessionId?:string){
    return fetch(url, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        // have fetch throw an error if non-200
        if (!res.ok) {
            throw new CustomError(res, res.status, "HTTP Status Code: " + res.status); 
        }
        return res
    })
}