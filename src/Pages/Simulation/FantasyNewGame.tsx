import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import { FantasyGame } from "../../types/types";
import { useNavigate } from "react-router-dom";
import { Accordion, Button, Form } from "react-bootstrap";
import { useMakeGameMutation } from "../../hooks/fantasy/useMakeGameMutation";
import { Filter } from 'bad-words'

declare var SERVICE_URL: string;


export default function FantasyNewGame() {
    const auth = useAuth(); 
    const navigate = useNavigate(); 
    const filter = new Filter();

    const [gameType, setGameType] = useState<'decade' | '8-team' | '8-team-no-repeat'>('8-team-no-repeat');
    const [secondsPerPick, setSecondsPerPick] = useState(30);
    const [tournamentSize, setTournamentSize] = useState<10 | 30 | 50>(10);
    const [name, setName] = useState('');

    const onSuccess = async (result: Response) => {
        console.log(result); 
        const resultJson = await result.json() as FantasyGame; 
        const gameId = resultJson.gameId; 
        navigate(`/Simulation/Fantasy/game/${gameId}`);
    }

    const onError = (error: Error) => {
        console.log(error); 
        navigate("/Error");
    }

    const mutation = useMakeGameMutation(onSuccess,onError);
    const filteredName = filter.clean(name);
    const inValidName = filteredName !== name;

    return (

        <div className="p-5 bg-white rounded shadow-sm">
            <div className="text-center w-100 font-x-large mt-2"><b>New Game</b></div>
            <div className="w-100 d-flex justify-content-end">
                <button data-type="button" className="btn filter-icon-bg d-flex justify-content-center align-items-center me-1" onClick={() => navigate("/Simulation/Fantasy")}>
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" className="m-2"/> 
                    <div>Back to Home</div>
                </button>
            </div>

            <div className="w-100">
                <Form className="d-flex flex-column align-items-start justify-content-center gap-1 mt-2">

                    <Form.Label className="mt-4">Game Name</Form.Label>
                    <Form.Control maxLength={30} type="text" placeholder="Name your event - this helps others find your game" value={name} onChange={(e) => setName(e.target.value)} />
                    {inValidName && <div className="text-danger">Please, keep it clean.</div>}

                    <Accordion className="w-100 mt-4 ">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header >
                                Advanced Settings
                            </Accordion.Header>
                            <Accordion.Body>

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

                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Form>

                <div className="d-flex justify-content-center align-items-center mt-4">
                    <Button disabled={!name.length} onClick={() => mutation.mutate({
                        gameType,
                        secondsPerPick,
                        tournamentSize,
                        name: filteredName
                    })}>Create Game</Button>
                </div>


            </div>


        </div>

    )
}