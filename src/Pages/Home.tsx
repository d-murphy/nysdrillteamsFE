import * as React from "react";
import Big8 from "../shared/components/Big8";
import UpcomingEvents from "../shared/components/UpcomingEvents";
import { Link } from "react-router-dom";
import { Social } from "./About";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function Home() {


    const year = new Date() < new Date(`5/30/${new Date().getFullYear()}`) ? new Date().getFullYear() -1  : new Date().getFullYear(); 

    return (
        <div className="container">
            <div className="row">
                <Big8 />
            </div>
            <div className="row mt-3">
                <div className="col-12 col-md-6">
                    <div className="d-flex flex-column align-items center px-3 pb-3">
                        <h4>Upcoming Events</h4>
                        <UpcomingEvents year={new Date().getFullYear()} />
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="h-100 d-flex align-items-start mb-4 mx-3">
                            <FortyForFortyAdvert />
                            {/* <Social /> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FortyForFortyAdvert() {
    return (
        <div
            className="w-100 rounded shadow-sm overflow-hidden"
            style={{ backgroundColor: '#0d1b2a', color: '#fff' }}
        >
            {/* Top accent stripe */}
            <div style={{ height: 4, backgroundColor: '#013369' }} />

            <div className="p-4">
                {/* Label */}
                <div
                    className="fw-semibold mb-3"
                    style={{ fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8899aa' }}
                >
                    New Game
                </div>

                {/* Headline */}
                <div
                    className="fw-bold mb-2"
                    style={{ fontSize: '1.75rem', lineHeight: 1.15 }}
                >
                    Can you go{' '}
                    <span style={{ color: '#c9a000' }}>40 for 40?</span>
                </div>

                {/* Subtext */}
                <div
                    className="mb-4"
                    style={{ fontSize: '0.9rem', color: '#8899aa', lineHeight: 1.5 }}
                >
                    Pick one team per contest from a randomly drawn season.
                    Simulate the drill and see how you score.
                </div>

                <Link
                    to="/Forty-for-Forty"
                    className="btn fw-bold d-inline-flex align-items-center gap-2 text-white"
                    style={{ backgroundColor: '#013369', fontSize: '0.92rem' }}
                >
                    <FontAwesomeIcon icon={faDice} />
                    Play Now
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.7rem' }} />
                </Link>
            </div>
        </div>
    );
}