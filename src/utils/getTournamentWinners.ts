import { Tournament } from "../types/types";

const getTournamentWinner = function(tournament:Tournament, seperator:string, includePts=false, place="1st Place"):string {
    let winnerStr = ""; 
    let points:number ; 
    if(tournament.top5) {
        let numOfFirsts = 0; 
        tournament.top5.forEach(team => {
            if(team.finishingPosition==place) {
                if(numOfFirsts >= 1) winnerStr += seperator
                winnerStr += team.teamName; 
                numOfFirsts++; 
                points = team.points; 
            }
        })    
    }
    if(includePts && points) winnerStr += ` (${points} pts)`
    return winnerStr; 
}

export default getTournamentWinner; 

