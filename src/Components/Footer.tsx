import React from "react";
import Image from "react-bootstrap/Image";
import { Social } from "../Pages/About";



export default function Footer(){


    return (
        <div className="footer w-100 mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-12 col-md-4 text-center text-white">
                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center pt-4 pb-3">
                            <div className="mb-2 font-small">
                                Created By: <a className="text-white" href="https://x.com/Dan__Murph">Dan Murphy</a> 
                            </div>
                            <div className="dash-logo-width">
                                <a href="https://dashweb.net">
                                    <Image fluid src="/static/img/White logo - no background.svg" />                    
                                </a>
                            </div>
                            <div className="my-1">
                                Build Your FD's Next Site with Us
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-8">
                        <div className="d-flex w-100 h-100 justify-content-center align-items-center flex-column py-3">
                            <div>Follow the NYS Drill Teams</div>
                            <Social clearBackground={true}/>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}