import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSubstack, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { Social } from "../../Pages/About";

const footerLinks = [
    { label: "About", to: "/About" },
    { label: "Follow Us", to: "/Social" },
    { label: "Schedule", to: "/Schedule" },
    { label: "Past Seasons", to: "/PastSeasons" },
    { label: "Locations", to: "/Locations" },
] as const;

export default function Footer() {
    return (
        <div className="footer w-100 mt-5">
            <div className="container py-4">
                <div className="row g-4 align-items-center">
                    <div className="col-12 col-md-4">
                        <div className="footer-signature text-center text-md-start">
                            <div className="footer-signature-mark">Site by</div>
                            <div className="footer-signature-name">Dan Murphy</div>
                            <div className="footer-signature-links">
                                <a
                                    href="https://x.com/Dan__Murph"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-signature-link"
                                >
                                    <FontAwesomeIcon icon={faXTwitter} className="me-1" />
                                    @Dan__Murph
                                </a>
                                <span className="footer-signature-sep" aria-hidden="true">
                                    ·
                                </span>
                                <a
                                    href="https://substack.com/@danmurph"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-signature-link"
                                >
                                    <FontAwesomeIcon icon={faSubstack} className="me-1" />
                                    Substack
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-8">
                        <div className="d-flex flex-column align-items-center align-items-md-end py-1">
                            <div className="footer-site-links mb-2">
                                {footerLinks.map((link, index) => (
                                    <React.Fragment key={link.to}>
                                        {index > 0 && (
                                            <span className="footer-site-sep" aria-hidden="true">
                                                ·
                                            </span>
                                        )}
                                        <Link to={link.to} className="footer-site-link">
                                            {link.label}
                                        </Link>
                                    </React.Fragment>
                                ))}
                            </div>
                            {/* <div className="footer-follow-label mb-1">Follow the NYS Drill Teams</div> */}
                            <div className="align-self-md-end">
                                <Social clearBackground={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
