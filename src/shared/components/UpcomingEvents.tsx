import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tournament } from "../../types/types";
import dateUtil from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFlagUsa,
    faLocationDot,
    faPersonRunning,
    faTruckPickup,
    faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

interface UpcomingEventsProps {
    year: number;
}

function getDrillMeta(tournament: Tournament) {
    const isMotorized =
        tournament.nassauSchedule ||
        tournament.northernSchedule ||
        tournament.suffolkSchedule ||
        tournament.westernSchedule;

    if (tournament.isParade) {
        return { label: "Parade", icon: faFlagUsa };
    }
    if (isMotorized) {
        return { label: "Motorized", icon: faTruckPickup };
    }
    if (tournament.liOfSchedule) {
        return { label: "Old Fashioned", icon: faPersonRunning };
    }
    if (tournament.juniorSchedule) {
        return { label: "Junior", icon: faPersonRunning };
    }
    return null;
}

function UpcomingEventRow({ tournament }: { tournament: Tournament }) {
    const navigate = useNavigate();
    const drill = getDrillMeta(tournament);
    const date = tournament.date instanceof Date ? tournament.date : new Date(tournament.date);
    const dayLabel = dateUtil.getDay(date.getDay()).substring(0, 3);
    const dateLabel = date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
    });
    const timeLabel = dateUtil.getTime(tournament.startTime);
    const when = [dayLabel.toUpperCase(), dateLabel, timeLabel].filter(Boolean).join(" · ");

    return (
        <div className="upcoming-event-row py-2">
            <div className="d-flex align-items-baseline justify-content-between gap-2">
                <button
                    type="button"
                    className="upcoming-event-name text-start"
                    onClick={() => navigate(`/Tournament/${tournament.id}`)}
                >
                    {tournament.name}
                </button>
                {drill && (
                    <span className="upcoming-event-type flex-shrink-0 text-muted">
                        <FontAwesomeIcon icon={drill.icon} className="me-1" />
                        {drill.label}
                    </span>
                )}
            </div>
            <div className="d-flex flex-wrap align-items-center justify-content-between column-gap-2 row-gap-1 mt-1 small text-muted">
                <div className="d-flex flex-wrap align-items-center column-gap-2">
                    <span>{when}</span>
                    {tournament.track && tournament.track !== "Unknown" && (
                        <>
                            <span className="upcoming-event-dot" aria-hidden="true">
                                ·
                            </span>
                            <Link
                                to={`/locations/${encodeURIComponent(tournament.track)}`}
                                className="video-links pointer"
                            >
                                <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                                {tournament.track}
                            </Link>
                        </>
                    )}
                </div>
                {tournament.liveStreamPlanned && (
                    <span className="upcoming-event-live flex-shrink-0" title="Live Stream Planned">
                        <FontAwesomeIcon icon={faVideo} className="me-1" />
                        Live
                    </span>
                )}
            </div>
        </div>
    );
}

export default function UpcomingEvents({ year }: UpcomingEventsProps) {
    const { data, isLoading, isError } = useQuery<Tournament[]>({
        queryKey: ["tournaments", year],
        queryFn: () =>
            fetch(`${SERVICE_URL}/tournaments/getFilteredTournaments?years=${year}`).then((res) =>
                res.json()
            ),
    });

    const upcomingTournaments = (data ?? [])
        .map((el) => ({ ...el, date: new Date(el.date) }))
        .filter((el) => el.date > new Date())
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(0, 5);

    let body: React.ReactNode;

    if (isLoading) {
        body = (
            <div className="d-flex justify-content-center py-4">
                <div className="spinner-border text-secondary" role="status" />
            </div>
        );
    } else if (isError) {
        body = (
            <div className="text-muted py-2">
                Sorry, there was an error loading the schedule.
            </div>
        );
    } else if (!upcomingTournaments.length) {
        body = <div className="text-muted py-2">No additional events scheduled this year.</div>;
    } else {
        body = (
            <>
                <div className="upcoming-events-list">
                    {upcomingTournaments.map((tournament) => (
                        <UpcomingEventRow key={tournament.id} tournament={tournament} />
                    ))}
                </div>
                <div className="mt-3 text-end">
                    <Link to="/Schedule" className="video-links small">
                        View full schedule →
                    </Link>
                </div>
            </>
        );
    }

    return (
        <div className="upcoming-events-card bg-white rounded shadow-sm p-4">
            <h4 className="mb-3">Upcoming Events</h4>
            {body}
        </div>
    );
}
