import * as React from "react";
import { Run } from "../types/types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCrown } from '@fortawesome/free-solid-svg-icons'; 
import Tooltip from "react-bootstrap/Tooltip"; 
import OverlayTrigger from "react-bootstrap/OverlayTrigger"; 


interface StateRecordProps {
    run: Run
    size: "xs" | "sm" | "lg"
}


export default function StateRecordIcon(props:StateRecordProps) {
    let run = props.run; 
    if(!run.stateRecord && !run.currentStateRecord) return <></>

    let msg = run?.currentStateRecord ? "Current State Record" : 
        run?.stateRecord ? "Former State Record" : ""; 

    console.log('here the msg: ', msg); 

    //@ts-ignore
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props} >{`${msg}!`}</Tooltip>
    );
            
    return (     
        <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
        >
            <span><FontAwesomeIcon className={run.currentStateRecord ? "current-record" : "former-record"} icon={faCrown} size={props.size} /></span>
        </OverlayTrigger>
    )
}