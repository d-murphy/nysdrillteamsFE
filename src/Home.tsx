import * as React from "react";

export default function Home() {

    return (
        <div>
            <div id="carouselExampleSlidesOnly" className="carousel slide " data-bs-ride="carousel" data-bs-pause="false">
                <div className="carousel-inner ">
                    <div className="carousel-item active">
                        <img src="./static/img/homeImg2.jpg" className="d-block w-100"  alt="..."/>
                    </div>
                    <div className="carousel-item">
                        <img src="./static/img/homeImg3.jpg" className="d-block w-100" alt="..."/>
                    </div>
                    <div className="carousel-item">
                        <img src="./static/img/homeImg4.jpg" className="d-block w-100" alt="..."/>
                    </div>
                    <div className="carousel-item">
                        <img src="./static/img/homeImg5.jpg" className="d-block w-100" alt="..."/>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row ">
                    <div className="col d-flex justify-content-center p-5">
                        Next Live Broadcast
                    </div>
                    <div className="col d-flex justify-content-center p-5">
                        Recent Results
                    </div>
                    <div className="col d-flex justify-content-center p-5">
                        Connect                    
                    </div>
                </div>
            </div>

        </div>
    );
}