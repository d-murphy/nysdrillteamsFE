import React from "react";
import { useSimTeamSummaries } from "../../hooks/fantasy/useSimTeamSummaries";


export default function TeamSummaries() {
  
    const { data: teamSummaries } = useSimTeamSummaries('Buckets', undefined, '', 100, 0, 'speedRating');

    return (
        <div>
            {teamSummaries.map((teamSummary) => (
                <div key={teamSummary._id}>
                    {teamSummary.team} - {teamSummary.year}  - {teamSummary.consistency} - {teamSummary.speedRating}
                </div>
            ))}
        </div>
  )
}


