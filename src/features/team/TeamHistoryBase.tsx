import React from "react";
import { Team } from "../../types/types";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

const sortOrder: Record<string, number> = {
    nassau: 1,
    northern: 2,
    suffolk: 3,
    western: 4,
    juniors: 5,
    "old fashioned": 6,
};

export default function TeamHistoryBase() {
    const { data, isLoading: loading, isError: error } = useQuery<Team[]>({
        queryKey: ["teams"],
        queryFn: () =>
            fetch(`${SERVICE_URL}/teams/getTeams`).then((res) => res.json()),
    });

    const teams = (data ?? [])
        .filter((el) => el.fullName)
        .sort((a, b) =>
            a.fullName?.trim()?.toLowerCase() < b.fullName?.trim()?.toLowerCase()
                ? -1
                : 1
        );

    const groups = teams.reduce((accum: Record<string, Team[]>, el: Team) => {
        if (!el.display) return accum;
        if (!accum[el.circuit]) {
            accum[el.circuit] = [el];
        } else {
            accum[el.circuit].push(el);
        }
        return accum;
    }, {});

    if (loading) return <></>;

    if (error) {
        return (
            <div className="container mb-3">
                <div className="text-center w-100 fs-4 my-3">
                    <b>Team Histories</b>
                </div>
                <div className="bg-white rounded shadow-sm p-4 text-center text-muted">
                    An error occurred. Please try again.
                </div>
            </div>
        );
    }

    const circuits = Object.keys(groups).sort((a, b) =>
        sortOrder[a.toLowerCase()] < sortOrder[b.toLowerCase()] ? -1 : 1
    );

    return (
        <div className="container mb-3">
            <div className="text-center w-100 fs-4 my-3">
                <b>Team Histories</b>
            </div>
            <div className="text-center text-muted small mb-3">
                Select a team to view its history.
            </div>

            <div className="team-history-panel bg-white rounded shadow-sm p-3 p-md-4">
                <div className="row g-4">
                    {circuits.map((circuit) => (
                        <div
                            key={circuit}
                            className="col-12 col-sm-6 col-md-4 col-lg-2"
                        >
                            <div className="team-history-circuit-label mb-2">
                                {circuit}
                            </div>
                            <div className="d-flex flex-column gap-1">
                                {groups[circuit].map((team) => (
                                    <Link
                                        key={team.fullName}
                                        className="team-history-team-link video-links small"
                                        to={`/TeamHistory/${encodeURIComponent(
                                            team.fullName
                                        )}`}
                                    >
                                        {team.fullName}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
