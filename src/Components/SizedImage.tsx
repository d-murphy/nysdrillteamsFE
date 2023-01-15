import * as React from "react";
import { Image } from "react-bootstrap";

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