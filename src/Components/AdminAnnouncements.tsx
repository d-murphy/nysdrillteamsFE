import * as React from "react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLoginContext } from "../utils/context";
import { fetchPost, fetchGet } from "../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import MutationStatus from "./MutationStatus";

declare var SERVICE_URL: string;

interface AdminAnnouncementsProps {}

export default function AdminAnnouncements(props:AdminAnnouncementsProps) {
    let [announcements, setAnnoucements] = useState<string[]>([])
    let [isLoading, setIsLoading] = useState(false);
    const { sessionId, role  } = useLoginContext();

    const isAdmin = role === "admin" || role === 'scorekeeper';

    const submitMutation = useMutation({
        mutationFn: () => fetchPost(
            `${SERVICE_URL}/announcements/updateAnnouncements`,
            { announcements },
            sessionId
        ),
    });

    function handleTextInput(e:React.ChangeEvent<HTMLTextAreaElement>){
        const inputId = e.target.id;
        const arrInd = parseInt(inputId.split("-")[1]);
        const newAnnouncements: string[] = announcements.map((el, ind) => {
            if(ind != arrInd) return el;
            return e.target.value;
        })
        setAnnoucements(newAnnouncements);
        submitMutation.reset();
    }

    function removeElement(index:number){
        let newList = announcements.filter((_, ind) => ind != index)
        setAnnoucements(newList);
        submitMutation.reset();
    }

    function addElement(){
        setAnnoucements([...announcements, '']);
        submitMutation.reset();
    }

    function fetchAnnouncements(){
        setIsLoading(true);
        fetchGet(`${SERVICE_URL}/announcements/getAnnouncements`)
        .then(data => data.json())
        .then(data => {
            setAnnoucements(data)
            setIsLoading(false);
        })
        .catch(() => { setIsLoading(false); })
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    return (
        <div className="container">
            <div className="text-center">
                <p className="pt-3">These inputs accept HTML so that you can link out to other places.  Here's an exampe.  Be careful here - stick to simple stuff like a tags like this example.  </p>
                <p className="border m-4 p-4">{`We are streaming on <a href="http://youtube.com"  target="_blank">YouTube</a>`}</p>
            </div>
            {isLoading ? <div>Loading...</div> :
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
                    <MutationStatus isSuccess={submitMutation.isSuccess} isError={submitMutation.isError} />
                </div>
                <div>
                    <button className="btn login-button mx-2" disabled={!isAdmin} onClick={() => addElement()}>Add New Announcement</button>
                    <button className="btn login-button mx-2" disabled={!isAdmin || submitMutation.isPending} onClick={() => submitMutation.mutate()}>Submit Announcements</button>
                </div>
            </div>
            }
        </div>
    )
}
