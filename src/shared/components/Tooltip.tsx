import { Tooltip, OverlayTrigger } from "react-bootstrap";
import React from "react";

interface MyTooltipProps {
    children: React.ReactElement;
    text: string;
}

export default function MyTooltip(props: MyTooltipProps) {
    const { children, text } = props;

    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props} >
            {text}
        </Tooltip>
      );
    
      return (
        <OverlayTrigger
          placement="bottom"
          delay={{ show: 250, hide: 400 }}
          overlay={renderTooltip}
        >
            {children}
        </OverlayTrigger>
      );
}