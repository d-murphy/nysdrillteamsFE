import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useAuth } from "react-oidc-context";
import { FantasyGame } from "../../types/types";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";


declare var SERVICE_URL: string;


export default function FantasyNewGame() {
    const auth = useAuth(); 
    const navigate = useNavigate(); 
    const email = auth.user?.profile.email; 

    const [gameType, setGameType] = useState<'one-team' | '8-team' | '8-team-no-repeat'>('8-team');
    const [countAgainstRecord, setCountAgainstRecord] = useState(true);
    const [secondsPerPick, setSecondsPerPick] = useState(30);

    const mutation = useMutation({
        mutationFn: ({ gameType, countAgainstRecord, secondsPerPick }: { gameType: 'one-team' | '8-team' | '8-team-no-repeat', countAgainstRecord: boolean, secondsPerPick: number }) => {
            return createFantasyGame(email, gameType, countAgainstRecord, secondsPerPick);
        },
        onSuccess: async (result) => {
            console.log(result); 
            const resultJson = await result.json() as FantasyGame; 
            const gameId = resultJson.gameId; 
            navigate(`/Simulation/Fantasy/${gameId}`);
        }
    });

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

                    <Form.Label>Game Type</Form.Label>
                    <Form.Select aria-label="Select Game Type" value={gameType} onChange={(e) => setGameType(e.target.value as 'one-team' | '8-team' | '8-team-no-repeat')}>
                        <option>Select Game Type</option>
                        <option value="one-team">One Team - All 8 Contests</option>
                        <option value="8-team">New Team Each Contest</option>
                        <option value="8-team-no-repeat">New Team Each Contest - No Repeats</option>
                    </Form.Select>

                    <Form.Label className="mt-4">Count Against Record</Form.Label>
                    <Form.Check 
                        type="switch"
                        id="countAgainstRecord"
                        checked={countAgainstRecord}
                        onChange={(e) => setCountAgainstRecord(e.target.checked)}
                    />
                    <Form.Label className="mt-4">Seconds Per Pick</Form.Label>
                    <Form.Control type="number" value={secondsPerPick} onChange={(e) => setSecondsPerPick(parseInt(e.target.value))} />
                </Form>

                <div className="d-flex justify-content-center align-items-center mt-4">
                    <Button onClick={() => mutation.mutate({ gameType, countAgainstRecord, secondsPerPick })}>Create Game</Button>
                </div>


            </div>


        </div>





    )
}




function createFantasyGame(
        user: string, 
        gameType: 'one-team' | '8-team' | '8-team-no-repeat', 
        countAgainstRecord: boolean, 
        secondsPerPick: number) 
    {


    const body = {
        user, 
        gameType, 
        countAgainstRecord, 
        secondsPerPick
    }
    console.log(body); 
        
    return fetch(`${SERVICE_URL}/fantasy/createGame`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
}