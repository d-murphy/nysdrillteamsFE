import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFlagCheckered } from "@fortawesome/free-solid-svg-icons";
import { socialLinks } from "../shared/socialLinks";
import UpcomingEvents from "../shared/components/UpcomingEvents";

export default function Social() {
    return (
        <div className="container mb-2">

            <div className="bg-primary text-white rounded shadow-sm p-4 mt-3 d-flex flex-column flex-md-row align-items-md-center gap-3">
                <FontAwesomeIcon icon={faFlagCheckered} className="fs-2 flex-shrink-0" />
                <div className="flex-grow-1">
                    <div className="fs-5 fw-semibold">Interested in competing?</div>
                    <div className="text-white-50">Submit the form and get in the game!</div>
                </div>
                <a
                    className="btn btn-light text-primary fw-semibold flex-shrink-0"
                    href="https://forms.gle/taewdZdYsRbn1Uw9A"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Submit the form
                </a>
            </div>


            <div className="bg-white rounded shadow-sm p-4 my-3 ">
                <div className="text-center w-100 fs-4 my-3">
                    <b>Follow the NYS FD Drill Teams</b>
                </div>
                <p className="mb-0 text-center">
                    Stay connected with New York State firematic racing across the platforms where
                    livestreams, photos, and community discussion happen. Pick a channel
                    below — or follow them all.
                </p>
            </div>

            <div className="row g-3">
                {socialLinks.map((link) => (
                    <div className="col-12 col-md-6 col-lg-4" key={link.name}>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none h-100 d-block"
                        >
                            <div className="bg-white rounded shadow-sm h-100 p-4 d-flex flex-column social-platform-card">
                                <div className="d-flex align-items-center mb-3">
                                    <FontAwesomeIcon
                                        icon={link.icon}
                                        className="crud-links me-3"
                                        style={{ fontSize: "2.5rem" }}
                                    />
                                    <div>
                                        <div className="fs-5 text-dark">{link.name}</div>
                                        <div className="text-muted small">{link.handle}</div>
                                    </div>
                                </div>
                                <p className="text-dark flex-grow-1 mb-3">{link.description}</p>
                                <div className="schedule-entry-button rounded text-center px-3 py-2">
                                    {link.cta}
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded shadow-sm p-4 mt-3">
                <div className="border-bottom w-100 border-secondary mb-3 d-flex align-items-center gap-3">
                    <FontAwesomeIcon icon={faEnvelope} className="crud-links fs-3" />
                    <h3 className="my-2">Media Inquiries</h3>
                </div>
                <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                    <div>
                        <p className="mb-1">
                            The NYS FD Drill Teams Media Committee handles sponsor outreach, media
                            relations, social channels, and the fan experience on tournament day.
                        </p>
                        <p className="mb-0">
                            For media inquiries, reach out to{" "}
                            <a
                                className="video-links"
                                href="mailto:chrismurphy@nysfddrillteams.com"
                            >
                                chrismurphy@nysfddrillteams.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-3 mb-3">
                <UpcomingEvents year={new Date().getFullYear()} />
            </div>
        </div>
    );
}
