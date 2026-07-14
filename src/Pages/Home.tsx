import * as React from "react";
import Big8 from "../shared/components/Big8";
import UpcomingEvents from "../shared/components/UpcomingEvents";
import SponsorBannerCarousel from "../shared/components/SponsorBannerCarousel";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
    return (
        <div className="container">
            <Big8 />
            <div className="row g-3 mt-0 align-items-start">
                <div className="col-12 col-md-6">
                    <UpcomingEvents year={new Date().getFullYear()} />
                </div>
                <div className="col-12 col-md-6">
                    <SponsorBannerCarousel />
                    <FortyForFortyAdvert />
                </div>
            </div>
        </div>
    );
}

function FortyForFortyAdvert() {
    return (
        <div
            className="w-100 rounded shadow-sm overflow-hidden"
            style={{ backgroundColor: "#0d1b2a", color: "#fff" }}
        >
            <div style={{ height: 4, backgroundColor: "#013369" }} />

            <div className="p-4">
                <div
                    className="fw-semibold mb-3"
                    style={{
                        fontSize: "0.65rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#8899aa",
                    }}
                >
                    New Game
                </div>

                <div className="fw-bold mb-2" style={{ fontSize: "1.75rem", lineHeight: 1.15 }}>
                    Can you go <span style={{ color: "#c9a000" }}>40 for 40?</span>
                </div>

                <div
                    className="mb-4"
                    style={{ fontSize: "0.9rem", color: "#8899aa", lineHeight: 1.5 }}
                >
                    Pick one team per contest from a randomly drawn season. Simulate the drill and
                    see how you score.
                </div>

                <Link
                    to="/Forty-for-Forty"
                    className="btn fw-bold d-inline-flex align-items-center gap-2 text-white"
                    style={{ backgroundColor: "#013369", fontSize: "0.92rem" }}
                >
                    <FontAwesomeIcon icon={faDice} />
                    Play Now
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "0.7rem" }} />
                </Link>
            </div>
        </div>
    );
}
