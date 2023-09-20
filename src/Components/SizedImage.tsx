import * as React from "react";
import { Image } from "react-bootstrap";
import getImgLocation from "../utils/imgLU";
import OverlayTrigger from "react-bootstrap/OverlayTrigger"; 
import Tooltip from "react-bootstrap/Tooltip"; 
import { useState } from "react";



interface Props {
    imageSrc: string,
    size: 'sm' | 'md' | 'lg' | 'xl'
}

export function SizedImage(props: Props) {
    const [showLoading, setShowLoading] = useState(true); 

    const imageClass = `image-wrap-${props.size} d-flex flex-column`
    const placeholderClass = `image-wrap-${props.size} placeholder bg-secondary my-5 rounded`

    return (
        <div className={`${imageClass}`}>
            <div className="flex-grow-1"/>
            {
                showLoading ? 
                    <div className="placeholder-glow d-flex justify-content-center align-items-center fluid-width">
                        <div className={placeholderClass}></div>
                    </div> : <></>
            }
            <Image src={props.imageSrc} fluid className="fluid-width" onLoad={() => setShowLoading(false)}/>
            <div className="flex-grow-1"/>
        </div>
    )
}

interface WinnerIconProps {
    team:string,
    size: 'sm' | 'md' | 'lg'
}

export function WinnerIcon(mainprops:WinnerIconProps){

    //@ts-ignore
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props} >
          {mainprops.team}
        </Tooltip>
      );
    
      return (
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
            <div>
                <SizedImage imageSrc={getImgLocation(mainprops.team)} size={mainprops.size}/>

            </div>
        </OverlayTrigger>
      );
}

export function WinnerIconNoHov(mainprops:WinnerIconProps) {
    return <SizedImage imageSrc={getImgLocation(mainprops.team)} size={mainprops.size}/>
}