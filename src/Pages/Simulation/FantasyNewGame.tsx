import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import { FantasyGame } from "../../types/types";
import { useNavigate } from "react-router-dom";
import { Accordion, Button, Form, Placeholder } from "react-bootstrap";
import { useMakeGameMutation } from "../../hooks/fantasy/useMakeGameMutation";
import { Filter } from 'bad-words'
import { useRandomTownName } from "../../hooks/fantasy/useTownNames";

declare var SERVICE_URL: string;


export default function FantasyNewGame() {
    const auth = useAuth(); 
    const navigate = useNavigate(); 
    const filter = new Filter();

    const [gameType, setGameType] = useState<'decade' | '8-team' | '8-team-no-repeat'>('8-team-no-repeat');
    const [secondsPerPick, setSecondsPerPick] = useState(30);
    const [tournamentSize, setTournamentSize] = useState<10 | 30 | 50>(10);


    const possibleDrillNames =[
        "Invitational Drill",
        "Invitational", 
        "Drill",
        "Classic"
    ]; 
    const randomDrillName = possibleDrillNames[Math.floor(Math.random() * possibleDrillNames.length)];
    
    const [drillName, _] = useState(randomDrillName);

    const { data: randomTownName, isLoading: isLoadingRandomTownName, error: errorRandomTownName, refetch: refetchRandomTownName } = useRandomTownName();
    if(errorRandomTownName) throw new Error("Error generating tournament name"); 

    const onSuccess = async (result: Response) => {
        const resultJson = await result.json() as FantasyGame; 
        const gameId = resultJson.gameId; 
        navigate(`/Simulation/Fantasy/game/${gameId}`);
    }

    const onError = (_error: Error) => {
        navigate("/Error");
    }

    const mutation = useMakeGameMutation(onSuccess,onError);
    const tournamentName = randomTownName?.town + " " + drillName; 

    return (

        <div className="p-5 bg-white rounded shadow-sm">
            <div className="text-center w-100 fs-4 mt-2">
                {
                    isLoadingRandomTownName ? 
                        <div className="d-flex justify-content-center align-items-center">
                            <Placeholder animation="glow" className="p-0 text-center d-block w-50 mt-1">
                                <Placeholder xs={12} className="rounded" size="lg" bg="secondary"/>
                            </Placeholder> 
                        </div>
                        : 
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <b>{tournamentName}</b>
                            <div className="text-muted font-x-small">Tournament names are randomly generated</div>
                        </div>
                }
            </div>
            <div className="w-100 d-flex justify-content-end">
                <button data-type="button" className="btn filter-icon-bg d-flex justify-content-center align-items-center me-1" onClick={() => navigate("/Simulation/Fantasy")}>
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" className="m-2"/> 
                    <div>Back to Home</div>
                </button>
            </div>

            <div className="w-100">
                <Form className="d-flex flex-column align-items-start justify-content-center gap-1 mt-2">

                    <Form.Label className="mt-4">Tournament Size</Form.Label>
                    <Form.Select aria-label="Select Game Type" value={tournamentSize} onChange={(e) => setTournamentSize(parseInt(e.target.value) as 10 | 30 | 50)}>
                        <option value="10">Town Tournament</option>
                        <option value="30">County Tournament</option>
                        <option value="50">State Tournament</option>
                    </Form.Select>

                    <Form.Label className="mt-4">Draft Type</Form.Label>
                    <Form.Select aria-label="Select Game Type" value={gameType} onChange={(e) => setGameType(e.target.value as 'decade' | '8-team' | '8-team-no-repeat')}>
                        <option value="8-team-no-repeat">Single Year Teams - No Team/Contest Repeat</option>
                        <option value="8-team">Single Year Teams - Allow Team/Contest Repeat</option>
                        {/* <option value="decade">Decade Teams</option> */}
                    </Form.Select>

                    <Form.Label className="mt-4">Seconds per Pick</Form.Label>
                    <Form.Control type="number" min={10} max={60} value={secondsPerPick} onChange={(e) => setSecondsPerPick(parseInt(e.target.value))} />


                </Form>

                <div className="d-flex justify-content-center align-items-center mt-4">
                    <Button disabled={isLoadingRandomTownName} onClick={() => mutation.mutate({
                        gameType,
                        secondsPerPick,
                        tournamentSize,
                        name: tournamentName
                    })}>Create Game</Button>
                </div>


            </div>


        </div>

    )
}