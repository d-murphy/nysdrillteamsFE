import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLoginContext } from "../../utils/context";
import AdminTeams  from "./AdminTeams";
import AdminTracks from "./AdminTracks";
import { Team, Track } from "../../types/types"
import AdminTournaments from "./AdminTournaments";
import AdminUpdates from "./AdminUpdates";
import AdminAnnouncements from "./AdminAnnouncements";
import AdminUsers from './AdminUsers';

declare var SERVICE_URL: string;

const TABS = ['Updates', 'Teams', 'Tracks', 'Tournaments', 'Announcements', 'Users'] as const;
type Tab = typeof TABS[number];

export default function AdminHome() {
    let [view, setView] = useState<Tab>("Updates")
    const { username, logout } = useLoginContext();

    const teamsQuery = useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: () => fetch(`${SERVICE_URL}/teams/getTeams`).then(res => res.json()),
    });

    const tracksQuery = useQuery<Track[]>({
        queryKey: ['tracks'],
        queryFn: () => fetch(`${SERVICE_URL}/tracks/getTracks`).then(res => res.json()),
    });

    const teams: Team[] = [...(teamsQuery.data ?? [])].sort((a, b) =>
        !a.fullName ? -1 : !b.fullName ? 1 :
        a.fullName.toLowerCase() < b.fullName.toLowerCase() ? -1 : 1
    );
    const tracks: Track[] = [...(tracksQuery.data ?? [])].sort((a, b) => a.name < b.name ? -1 : 1);
    const isError = teamsQuery.isError || tracksQuery.isError;

    if(!username) return (
        <div className="container d-flex align-items-center justify-content-center p-5">
            <h4>Sorry, you must login.</h4>
        </div>
    )

    return (
        <div className="container">
            <div className="content-box">
                <div className="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
                    <div>
                        <h4 className="mb-0">Admin Home</h4>
                        <small className="text-muted">Welcome, {username}. Thanks for helping with this project.</small>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => logout()}>Log Out</button>
                </div>

                <div className="px-3 pb-2">
                    <details>
                        <summary className="text-muted small" style={{ cursor: 'pointer' }}>Guidelines &amp; reminders</summary>
                        <div className="mt-2 small">
                            <ul className="mb-1">
                                <li>This DB is becoming THE history for our game. Please be professional as you make and edit entries.</li>
                                <li>On the Updates tab you'll see changes you and other users are making — this keeps everyone honest.</li>
                                <li>No one is checking video links. Don't send people anywhere inappropriate.</li>
                                <li>If you're not sure about something, feel free to ask.</li>
                            </ul>
                        </div>
                    </details>
                </div>

                {!isError && (
                    <ul className="nav nav-tabs px-3">
                        {TABS.map(tab => (
                            <li className="nav-item" key={tab}>
                                <button
                                    className={`nav-link${view === tab ? ' active' : ''}`}
                                    onClick={() => setView(tab)}
                                >{tab}</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="content-box my-2 p-3">
                {view === "Updates"       && <AdminUpdates />}
                {view === "Teams"         && <AdminTeams teams={teams} />}
                {view === "Tracks"        && <AdminTracks tracks={tracks} />}
                {view === "Tournaments"   && <AdminTournaments tracks={tracks} teams={teams} />}
                {view === "Announcements" && <AdminAnnouncements />}
                {view === "Users"         && <AdminUsers />}
                {isError && <div className="text-danger">Sorry, an error occurred. Please try again later.</div>}
            </div>
        </div>
    );
}
