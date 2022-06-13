import { Tournament } from "../types/types";

const getTournamentWinner = function(tournament:Tournament, seperator:string):string {
    let winnerStr = ""; 
    if(tournament.top5) {
        let numOfFirsts = 0; 
        tournament.top5.forEach(team => {
            if(team.finishingPosition=="1") {
                if(numOfFirsts >= 1) winnerStr += seperator
                winnerStr += team.teamName; 
                numOfFirsts++; 
            }
        })    
    }
    console.log('here winner str', winnerStr)
    return winnerStr; 
}

export default getTournamentWinner; 

