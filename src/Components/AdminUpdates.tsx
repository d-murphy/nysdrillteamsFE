import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLoginContext } from "../utils/context";
import { fetchGet } from "../utils/network";
import { Update } from '../types/types'
import dateUtil from "../utils/dateUtils";

declare var SERVICE_URL: string;

interface AdminUpdatesProps {}

export default function AdminUpdates(_props:AdminUpdatesProps) {
    const { sessionId } = useLoginContext();

    const { data, isLoading, isError } = useQuery<Update[]>({
        queryKey: ['updates'],
        queryFn: () => fetchGet(`${SERVICE_URL}/updates/getUpdates`, sessionId).then(res => res.json()),
        enabled: Boolean(sessionId),
    });

    const updates = data ?? [];

    return (
        <div className="container">
            <div className="d-flex flex-column align-items-center justify-content-center">
                <div>
                    <h4>Most recent updates are shown here:</h4>
                </div>
                {isLoading ? <div>Loading...</div> :
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
