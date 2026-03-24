import * as React from "react";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoginContext } from "../../utils/context";
import { fetchPost, fetchGet } from "../../utils/network"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import MutationStatus from "../../shared/components/MutationStatus";

declare var SERVICE_URL: string;

interface AdminAnnouncementsProps {}

export default function AdminAnnouncements(props:AdminAnnouncementsProps) {
    let [announcements, setAnnoucements] = useState<string[]>([])
    const { sessionId, role  } = useLoginContext();
    const queryClient = useQueryClient();

    const isAdmin = role === "admin" || role === 'scorekeeper';

    const { data: fetchedAnnouncements, isLoading } = useQuery<string[]>({
        queryKey: ['announcements'],
        queryFn: () => fetchGet(`${SERVICE_URL}/announcements/getAnnouncements`).then(res => res.json()),
    });

    useEffect(() => {
        if (fetchedAnnouncements) setAnnoucements(fetchedAnnouncements);
    }, [fetchedAnnouncements]);

    const submitMutation = useMutation({
        mutationFn: () => fetchPost(
            `${SERVICE_URL}/announcements/updateAnnouncements`,
            { announcements },
            sessionId
        ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
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

    return (
        <div>
            <div className="alert alert-info small mb-3">
                These inputs accept HTML so you can link to other pages. Example:&nbsp;
                <code>{`We are streaming on <a href="http://youtube.com" target="_blank">YouTube</a>`}</code>
            </div>

            {isLoading ? (
                <div className="text-muted">Loading...</div>
            ) : (
                <>
                    <div className="d-flex flex-column gap-2 mb-3">
                        {announcements.map((el, ind) => (
                            <div key={ind} className="d-flex align-items-center gap-2">
                                <textarea
                                    id={`announcementsArrInd-${ind}`}
                                    onChange={(e) => handleTextInput(e)}
                                    value={el}
                                    className="form-control form-control-sm"
                                    rows={2}
                                    disabled={!isAdmin}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm flex-shrink-0"
                                    onClick={() => removeElement(ind)}
                                    title="Remove"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <MutationStatus isSuccess={submitMutation.isSuccess} isError={submitMutation.isError} />
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary btn-sm" disabled={!isAdmin} onClick={() => addElement()}>
                                + Add Announcement
                            </button>
                            <button className="btn btn-primary btn-sm" disabled={!isAdmin || submitMutation.isPending} onClick={() => submitMutation.mutate()}>
                                Save All
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
