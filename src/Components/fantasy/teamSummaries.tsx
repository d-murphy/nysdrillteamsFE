import React from "react";
import { useSimTeamSummaries } from "../../hooks/useSimTeamSummaries";


export default function TeamSummaries() {
  
    const teamSummaries = useSimTeamSummaries('Buckets', undefined, '', 100, 0, 'speedRating');

    return (
        <div>
            {teamSummaries.simTeamSummaries.map((teamSummary) => (
                <div key={teamSummary._id}>
                    {teamSummary.team} - {teamSummary.year}  - {teamSummary.consistency} - {teamSummary.speedRating}
                </div>
            ))}
        </div>
  )
}


