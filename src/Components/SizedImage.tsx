import * as React from "react";
import { Image } from "react-bootstrap";
import getImgLocation from "../utils/imgLU";
import OverlayTrigger from "react-bootstrap/OverlayTrigger"; 
import Tooltip from "react-bootstrap/Tooltip"; 



interface Props {
    imageSrc: string,
    size: 'sm' | 'md' | 'lg'
}

export function SizedImage(props: Props) {

    const imageClass = `image-wrap-${props.size} d-flex flex-column`

    return (
        <div className={`${imageClass}`}>
            <div className="flex-grow-1"/>
            <Image src={props.imageSrc} fluid className="fluid-width"/>
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
