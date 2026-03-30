import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { faDice, faTruckPickup, faRunning, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';


interface FantasyGameAnimationProps {
    setAnimationComplete: (complete: boolean) => void;
}

export default function FantasyGameAnimation({ setAnimationComplete }: FantasyGameAnimationProps) {
    const [animationStage, setAnimationStage] = useState(0);

    const stages: { [key: number]: { caption: string, icon: IconProp } } = {
        0: {
            caption: "Draft Complete! Starting the simulation engines...", 
            icon: faDice
        }, 
        1: {
            caption: "Starting the sneakers!", 
            icon: faRunning
        }, 
        2: {
            caption: "Race in progress...", 
            icon: faTruckPickup
        }, 
        3: {
            caption: "Calculating results...", 
            icon: faTrophy
        }, 
    }


    useEffect(() => {
        setTimeout(() => {
            setAnimationStage(animationStage + 1);
            if(animationStage === 3){
                setAnimationComplete(true);
            }
        }, 2000);
    }, [animationStage]);

    return (
        <div>
            <div className="bg-white rounded shadow-sm p-5">
                <div className="text-center m-5">
                    <FontAwesomeIcon icon={stages[animationStage]?.icon} className="bouncing-growing" size="3x" />
                    <h3 className="mt-3">{stages[animationStage]?.caption}</h3>
                </div>
            </div>
             
        </div>
    )
}