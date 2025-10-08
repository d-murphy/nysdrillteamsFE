import { FantasyDraftPick, FantasyGame } from "../types/types";



export default function isMyPick(currentDraftPick: number, username: string, game: FantasyGame) {
    const users = game.users;
    const rounds = game.gameType === 'one-team' ? 1 : 8; 

    const draftOrder = []; 
    for(let i = 0; i < rounds; i++) {
        const loopUsers = [...users]; 
        const isSnakeReverseRound = i % 2 === 1;
        const roundUsers = isSnakeReverseRound ? loopUsers.reverse() : loopUsers;
        draftOrder.push(...roundUsers);
    }

    console.log("draftOrder", draftOrder);
    console.log("currentDraftPick", currentDraftPick);
    const nextPick = draftOrder[currentDraftPick];

    return nextPick === username;
}






