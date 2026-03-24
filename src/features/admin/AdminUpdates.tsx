import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLoginContext } from "../../utils/context";
import { fetchGet } from "../../utils/network";
import { Update } from '../../types/types'
import dateUtil from "../../utils/dateUtils";

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
        <div>
            <h6 className="mb-3">Recent Updates</h6>
            {isLoading && <div className="text-muted">Loading...</div>}
            {isError  && <div className="text-danger">An error occurred loading updates.</div>}
            {!isLoading && !isError && (
                <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover table-striped mb-0">
                        <thead className="table-light sticky-top">
                            <tr>
                                <th style={{ width: '110px' }}>Date</th>
                                <th style={{ width: '140px' }}>User</th>
                                <th>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {updates.map((el, ind) => (
                                <tr key={ind}>
                                    <td className="text-muted small">{dateUtil.getMMDDYYYY(el.date)}</td>
                                    <td className="fw-semibold small">{el.user}</td>
                                    <td className="small">{el.update}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
