import * as React from "react";
import Carousel from "react-bootstrap/Carousel";
import { homepageAdverts } from "../homepageAdverts";

const ADVERT_DIR = "/static/img/adverts";

export default function SponsorBannerCarousel() {
    if (!homepageAdverts.length) return null;

    return (
        <div className="sponsor-banner-carousel rounded shadow-sm overflow-hidden bg-white mb-3">
            <div className="sponsor-banner-heading px-3 pt-3 pb-2 text-center">
                Support Our Sponsors
            </div>
            <Carousel
                fade
                interval={4500}
                controls={homepageAdverts.length > 1}
                indicators={false}
                pause="hover"
                touch
            >
                {homepageAdverts.map((advert) => {
                    const src = `${ADVERT_DIR}/${encodeURIComponent(advert.filename)}`;
                    const alt = advert.alt ?? advert.filename.replace(/\.[^.]+$/, "");
                    const image = (
                        <img
                            className="d-block w-100 sponsor-banner-image"
                            src={src}
                            alt={alt}
                        />
                    );

                    return (
                        <Carousel.Item key={advert.filename}>
                            {advert.url ? (
                                <a
                                    href={advert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${alt} (opens sponsor website)`}
                                >
                                    {image}
                                </a>
                            ) : (
                                image
                            )}
                        </Carousel.Item>
                    );
                })}
            </Carousel>
        </div>
    );
}
