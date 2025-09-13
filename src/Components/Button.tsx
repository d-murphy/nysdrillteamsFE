import React from "react";



interface ButtonProps {
    text: string;
    onClick: () => void;
    className?: string;
}


export default function Button({text, onClick, className}: ButtonProps) {
    return (
        <div 
            className={`pointer schedule-entry-button width-50 font-medium px-3 py-2 mb-3 rounded text-center ${className}`} 
            onClick={onClick}
        >
            {text}
        </div>
    )
}