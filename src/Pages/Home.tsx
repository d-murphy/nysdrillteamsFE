import * as React from "react";
import Big8Contest from "../Components/Big8Contest";
import UpcomingEvents from "../Components/UpcomingEvents"; 


export default function Home() {

    let run1 = {contest: "3 Man Ladder", team: "Central Islip Hoboes", time: "6.35", tournament: "Lindenhurst Invite", date: "6/5/2022" }
    let run2 = {contest: "B Ladder", team: "North Lindenhurst Piston Knockers", time: "5.19", tournament: "Lindenhurst Invite", date: "6/5/2022" }
    let run3 = {contest: "C Ladder", team: "Central Islip Hoboes", time: "8.85", tournament: "Lindenhurst Invite", date: "6/5/2022" }
    let run4 = {contest: "C Hose", team: "Central Islip Hoboes", time: "12.55", tournament: "Central Islip Invite", date: "7/2/2022" }
    let run5 = {contest: "B Hose", team: "West Sayville Flying Dutchmen", time: "7.85", tournament: "Joe Hunter Memorial Drill", date: "7/10/2022" }
    let run6 = {contest: "Efficiency", team: "Central Islip Hoboes", time: "8.65", tournament: "Lindenhurst Invite", date: "6/5/2022" }
    let run7 = {contest: "Motor Pump", team: "Central Islip Hoboes", time: "6.35", tournament: "Lindenhurst Invite", date: "6/5/2022" }
    let run8 = {contest: "Buckets", team: "Central Islip Hoboes", time: "22.35", tournament: "Lindenhurst Invite", date: "6/5/2022" }


    return (
        <div className="container">
            <div className="row">
                <div className="col d-flex flex-column align-items-start p-3 m-2 ">
                    <p><span className="h4 me-3">The Big 8</span>Top times from this year's motorized teams.</p>
                    <div className="row w-100">
                        <Big8Contest run={run1} />
                        <Big8Contest run={run2} />
                        <Big8Contest run={run3} />
                        <Big8Contest run={run4} />
                        <Big8Contest run={run5} />
                        <Big8Contest run={run6} />
                        <Big8Contest run={run7} />
                        <Big8Contest run={run8} />
                    </div>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-8">
                    <div className="d-flex flex-column align-items center py-3 m-2">
                        <h4>Upcoming Events</h4>
                        <UpcomingEvents year={new Date().getFullYear()} />
                    </div>
                </div>
            </div>
        </div>
    );
}