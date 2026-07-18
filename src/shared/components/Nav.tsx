import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { fetchGet } from "../../utils/network";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useQuery } from "@tanstack/react-query";

declare var SERVICE_URL: string;

const statsLinks = [
    { label: "State Champions", to: "/TournamentHistory/New%20York%20State%20Championship" },
    { label: "Total Points", to: "/TotalPoints" },
    { label: "Top Runs", to: "/TopRuns" },
    { label: "Team Histories", to: "/TeamHistory" },
    { label: "Team Seasons", to: "/TeamSummaries" },
    { label: "Run Search", to: "/RunSearch" },
    { label: "Locations", to: "/Locations" },
] as const;

const funLinks = [
    { label: "Forty for Forty", to: "/Forty-for-Forty" },
    { label: "Projections", to: "/Simulation/Projections" },
    // { label: "Twanny Stat Files", to: "/TwannyStatFiles" },
    // { label: "Fantasy Racing", to: "/Simulation/Fantasy" },
] as const;

const statsActivePrefixes = [
    "/tournamenthistory",
    "/totalpoints",
    "/topruns",
    "/teamhistory",
    "/teamsummaries",
    "/runsearch",
    "/locations",
    "/simulation",
    "/forty-for-forty",
    "/twannystatfiles",
];

function isStatsRoute(pathname: string) {
    const path = pathname.toLowerCase();
    return statsActivePrefixes.some((prefix) => path.startsWith(prefix));
}

function isStatsLinkActive(pathname: string, to: string) {
    const current = decodeURIComponent(pathname).toLowerCase().replace(/\/$/, "");
    const target = decodeURIComponent(to).toLowerCase().replace(/\/$/, "");
    return current === target || current.startsWith(`${target}/`);
}

interface StatsCentralMenuProps {
    onNavigate: () => void;
}

function StatsCentralMenu({ onNavigate }: StatsCentralMenuProps) {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<number | null>(null);
    const statsActive = isStatsRoute(location.pathname);

    const clearCloseTimer = () => {
        if (closeTimer.current != null) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimer.current = window.setTimeout(() => setOpen(false), 160);
    };

    const openMenu = () => {
        clearCloseTimer();
        setOpen(true);
    };

    useEffect(() => {
        const onDocClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKeyDown);
            clearCloseTimer();
        };
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    return (
        <div
            ref={rootRef}
            className={`nav-stats ${open ? "is-open" : ""} ${statsActive ? "is-active" : ""}`}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
        >
            <button
                type="button"
                className={`nav-pill ${statsActive || open ? "is-selected" : ""}`}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-controls="stats-central-menu"
                onClick={() => setOpen((prev) => !prev)}
            >
                Stats Central
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`nav-stats-chevron ${open ? "is-rotated" : ""}`}
                />
            </button>

            <div
                id="stats-central-menu"
                className={`nav-stats-panel ${open ? "is-visible" : ""}`}
                role="menu"
                aria-label="Stats Central"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
            >
                <div className="nav-stats-panel-label">Browse Official Stats</div>
                <div className="nav-stats-grid">
                    {statsLinks.map((link) => {
                        const active = isStatsLinkActive(location.pathname, link.to);
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                role="menuitem"
                                className={`nav-stats-item ${active ? "is-active" : ""}`}
                                onClick={() => {
                                    setOpen(false);
                                    onNavigate();
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="nav-stats-panel-label nav-stats-panel-label-secondary">
                    Just for Fun
                </div>
                <div className="nav-stats-grid">
                    {funLinks.map((link) => {
                        const active = isStatsLinkActive(location.pathname, link.to);
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                role="menuitem"
                                className={`nav-stats-item ${active ? "is-active" : ""}`}
                                onClick={() => {
                                    setOpen(false);
                                    onNavigate();
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function SiteNav() {
    const [expanded, setExpanded] = useState(false);

    const { data } = useQuery<string[]>({
        queryKey: ["announcements"],
        queryFn: () => fetchGet(`${SERVICE_URL}/announcements/getAnnouncements`).then((res) => res.json()),
    });
    const announcements = data ?? [];

    const closeNav = () => setExpanded(false);

    return (
        <header className="site-header">
            {announcements.length > 0 && (
                <div className="banner text-center">
                    <div className="d-flex justify-content-center p-3 banner-bg">
                        <span>
                            <b dangerouslySetInnerHTML={{ __html: announcements[0] }} />
                        </span>
                    </div>
                </div>
            )}

            <div className="nav-bg-color-dk">
                <Container className="py-3 py-md-4">
                    <Link to="/" onClick={closeNav} className="d-inline-block" aria-label="Home">
                        <div className="header-logo">
                            <Image fluid src="/static/img/logo_onetone_nysfdracing.png" alt="NYS FD Racing" />
                        </div>
                    </Link>
                </Container>
            </div>

            <Navbar
                expand="md"
                variant="dark"
                expanded={expanded}
                onToggle={setExpanded}
                className="site-navbar nav-bg-color py-0"
            >
                <Container>
                    <Navbar.Toggle aria-controls="main-site-nav" className="ms-auto my-2" />
                    <Navbar.Collapse id="main-site-nav">
                        <Nav className="site-navbar-nav w-100 justify-content-md-evenly align-items-md-center py-2 py-md-0">
                            <Nav.Link
                                as={NavLink}
                                to="/Schedule"
                                onClick={closeNav}
                                className="nav-pill"
                            >
                                Schedule / Results
                            </Nav.Link>
                            <Nav.Link
                                as={NavLink}
                                to="/PastSeasons"
                                onClick={closeNav}
                                className="nav-pill"
                            >
                                Past Seasons
                            </Nav.Link>

                            <StatsCentralMenu onNavigate={closeNav} />

                            <Nav.Link
                                as={NavLink}
                                to="/About"
                                onClick={closeNav}
                                className="nav-pill"
                            >
                                About
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}
