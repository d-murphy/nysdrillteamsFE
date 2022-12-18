import * as React from "react";
import { useState, useEffect } from "react";
import { useLoginContext } from "../utils/context";
import { fetchPost, fetchGet } from "../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"; 

declare var SERVICE_URL: string;

interface AdminAnnouncementsProps {}

export default function AdminAnnouncements(props:AdminAnnouncementsProps) {
    let [announcements, setAnnoucements] = useState<string[]>([])
    let [reqSubmitted, setReqSubmitted] = useState(false); 
    let [reqResult, setReqResult] = useState<{error: boolean, message:string}>({error:false, message:""}); 
    const { sessionId, role  } = useLoginContext(); 

    const isAdmin = role === "admin"; 

    function handleTextInput(e:React.ChangeEvent<HTMLTextAreaElement>){
        const inputId = e.target.id; 
        const arrInd = parseInt(inputId.split("-")[1]); 
        const newAnnouncements: string[] = announcements.map((el, ind) => {
            if(ind != arrInd) return el; 
            return e.target.value; 
        })
        setAnnoucements(newAnnouncements); 
        clearResultMessage()
    }

    function removeElement(index:number){
        let newList = announcements.filter((_, ind) => ind != index)
        setAnnoucements(newList); 
        clearResultMessage()
    }

    function addElement(){
        setAnnoucements([...announcements, '']); 
        clearResultMessage()
    }

    function fetchAnnouncements(){
        setReqSubmitted(true)
        fetchGet(`${SERVICE_URL}/announcements/getAnnouncements`)
        .then(data => data.json())
        .then(data => { 
            setAnnoucements(data)
            setReqSubmitted(false); 
        })
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    async function submitAnnouncements(){
        setReqSubmitted(true); 
        const url = `${SERVICE_URL}/announcements/updateAnnouncements`
        try {
            await fetchPost(url, {announcements: announcements}, sessionId)
            setReqResult({error: false, message: "Update successful."}); 
            setReqSubmitted(false);
        } catch (e){
            console.log(e.message)
            setReqResult({error: true, message: "An error occurred. Try again later."}); 
            setReqSubmitted(false); 
        }
    }

    function clearResultMessage(){
        setReqResult({error:false, message:""})
    }
    return (
        <div className="container">
            <div className="text-center">
                <p className="pt-3">These inputs accept HTML so that you can link out to other places.  Here's an exampe.  Be careful here - stick to simple stuff like a tags like this example.  </p>
                <p className="border m-4 p-4">{`We are streaming on <a href="http://youtube.com"  target=”_blank”>YouTube</a>`}</p>
            </div>
            {
            reqSubmitted ? <div>Loading...</div> : 
                reqResult.error ? <div>An error occurred.  Please try again later.</div>:
                <div className="d-flex flex-column align-items-center justify-content-center">
                {
                    announcements.map((el, ind) => {
                        return (
                            <div className="d-flex align-items-center justify-content-center w-100">
                                <textarea 
                                    onChange={(e) => handleTextInput(e)} 
                                    id={`announcementsArrInd-${ind}`} 
                                    value={el} 
                                    className="text-center width-100 my-2 py-3" 
                                    disabled={!isAdmin}
                                    autoComplete="off"></textarea>
                                <FontAwesomeIcon className="crud-links font-large px-2" icon={faTrash} onClick={() => removeElement(ind)} />
                            </div>
                        )
                    })
                }
                <div className="text-center my-3">
                    {reqResult.message ? <span className={reqResult.error ? 'text-danger' : 'text-success'}>
                        {reqResult.message}
                    </span> : <></>}
                </div>
                <div>
                    <button className="btn login-button mx-2" onClick = {() => addElement()}>Add New Announcement</button>
                    <button className="btn login-button mx-2" onClick = {() => submitAnnouncements()}>Submit Announcements</button>
                </div>
            </div>
            }
        </div>
    )
}
