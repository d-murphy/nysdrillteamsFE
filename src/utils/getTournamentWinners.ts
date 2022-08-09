import { Tournament } from "../types/types";

const getTournamentWinner = function(tournament:Tournament, seperator:string):string {
    let winnerStr = ""; 
    if(tournament.top5) {
        let numOfFirsts = 0; 
        tournament.top5.forEach(team => {
            if(team.finishingPosition=="1st Place") {
                if(numOfFirsts >= 1) winnerStr += seperator
                winnerStr += team.teamName; 
                numOfFirsts++; 
            }
        })    
    }
    return winnerStr; 
}

export default getTournamentWinner; 

