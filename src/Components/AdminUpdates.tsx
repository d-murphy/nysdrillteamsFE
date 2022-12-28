import * as React from "react";
import { useState, useEffect} from "react";
import { useLoginContext } from "../utils/context";
import { fetchGet } from "../utils/network"; 
import { Update } from '../types/types'
import dateUtil from "../utils/dateUtils";

declare var SERVICE_URL: string;

interface AdminUpdatesProps {}

export default function AdminUpdates(props:AdminUpdatesProps) {
    const [updates, setUpdates] = useState<Update[]>([])
    const [loading, setLoading] = useState(false); 
    const [isError, setIsError] = useState(false); 
    const { sessionId  } = useLoginContext(); 

    async function getUpdates(){
        if(!sessionId) return 
        const url = `${SERVICE_URL}/updates/getUpdates`
        setLoading(true); 
        fetchGet(url, sessionId)
            .then(data => data.json())
            .then(data => {
                setUpdates(data)
                setLoading(false)
            })
            .catch(e => {
                console.log(e)
                setLoading(false); 
                setIsError(true)        
            })
    }

    useEffect(() => {
        getUpdates()
    }, [sessionId])

    return (
        <div className="container">
            <div className="d-flex flex-column align-items-center justify-content-center">
                <div>
                    <h4>Most recent updates are shown here:</h4>
                </div>
                {loading ? <div>Loading...</div> : 
                 isError ? <div>An error occurred grabbing the updates.</div>: 
                 <div>
                    {
                        updates.map(el => {
                            return (
                                <div>{`${dateUtil.getMMDDYYYY(el.date)} - ${el.user} - ${el.update}`}</div>
                            )
                        })
                    }
                 </div>
                }
            </div>
        </div>
    )
}
