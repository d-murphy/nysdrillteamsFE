import * as React from "react";
import Leaderboard from "./leaderboard";
import Welcome from "./Welcome";
import WinPercentageLeaderboard from "./winPercentageLeaderboard";

export default function LandingPage() {
    return (
        <div className="row g-3">
            <div className="d-none d-lg-block col-9">
                <Welcome />
            </div>
            <div className="d-none d-lg-block col-3">
                <div className="bg-white rounded shadow-sm">
                    <WinPercentageLeaderboard />
                    <Leaderboard />
                </div>
            </div>
            <div className="d-block d-lg-none col-12">
                <div>
                    <Welcome />
                </div>
                <div className="mt-3 bg-white rounded shadow-sm">
                    <WinPercentageLeaderboard />
                    <Leaderboard />
                </div>
            </div>
        </div>
    );
}