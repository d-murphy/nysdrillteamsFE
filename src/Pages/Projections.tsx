import React, { useState } from "react";
import { Projection, Run } from "../types/types";
import { useProjections } from "../hooks/useProjections";
import { useTournamentByNameYear } from "../hooks/useTournament";
import { useTournamentRuns } from "../hooks/useTournamentRuns";
import { faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { useParams } from "react-router-dom";

export default function Projections(){

    const { year } = useParams();
    const [sortField, setSortField] = useState<keyof Projection>('team');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    
    const { projections, isLoading, isError, error } = useProjections({ year: year.toString() });
    const { tournaments, isLoading: tournamentLoading, isError: tournamentError } = useTournamentByNameYear('New York State Championship', year.toString());
    const tournament =  tournaments ? tournaments[0] : null;
    const top5 = tournament?.top5;
    const { runs, isLoading: runsLoading, isError: runsError } = useTournamentRuns({ tournamentId: tournament?.id.toString() });

    const handleSort = (field: keyof Projection) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedProjections = [...projections].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
    });

    const formatPercentage = (count: number) => {
        if (count < 5) return '< 1%';
        const percentage = (count / 500) * 100;
        return `${percentage.toFixed(1)}%`;
    };

    const getSortIcon = (field: keyof Projection) => {
        if (sortField !== field) return <FontAwesomeIcon icon={faSort} className="ms-1" />;
        return sortDirection === 'asc' ? <FontAwesomeIcon icon={faSortUp} className="ms-1" /> : <FontAwesomeIcon icon={faSortDown} className="ms-2" />;
    };

    return (
        <div className="container">
            <div className="text-center font-x-large mt-2"><b>{`Projections`}</b></div>
            <div className="w-100 bg-white rounded shadow-sm">
                <div className="overflow-auto pb-3">
                    {
                        isLoading || tournamentLoading || runsLoading ? 
                            <div className="text-center p-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <div className="mt-2">Loading projections data...</div>
                            </div> : 
                            <div className="p-3">
                                <div className="text-center pb-3"><b>Projections Data</b></div>
                                <div className="table-responsive">
                                    <table className="table table-sm w-100 other-tables">
                                        <thead>
                                            <tr>
                                                <th 
                                                    scope="col" 
                                                    className="bg-white px-2 pointer fixed-col scorecard-cell-lg"
                                                    onClick={() => handleSort('team')}
                                                >
                                                    <span className="d-flex align-items-center">
                                                        Team {getSortIcon('team')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Overall Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Overall Wins {getSortIcon('Overall Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Overall Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Overall Top5 {getSortIcon('Overall Top5')}
                                                    </span>
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Finish
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Three Man Ladder Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        3ML Wins {getSortIcon('Three Man Ladder Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Three Man Ladder Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        3ML Top5 {getSortIcon('Three Man Ladder Top5')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        3ML Points
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('B Ladder Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        B Ladder Wins {getSortIcon('B Ladder Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('B Ladder Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        B Ladder Top5 {getSortIcon('B Ladder Top5')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        B Ladder Points
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('C Ladder Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        C Ladder Wins {getSortIcon('C Ladder Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('C Ladder Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        C Ladder Top5 {getSortIcon('C Ladder Top5')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        C Ladder Points
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('C Hose Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        C Hose Wins {getSortIcon('C Hose Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('C Hose Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        C Hose Top5 {getSortIcon('C Hose Top5')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        C Hose Points
                                                    </span>
                                                </th>

                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('B Hose Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        B Hose Wins {getSortIcon('B Hose Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('B Hose Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        B Hose Top5 {getSortIcon('B Hose Top5')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        B Hose Points
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Efficiency Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Efficiency Wins {getSortIcon('Efficiency Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Efficiency Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Efficiency Top5 {getSortIcon('Efficiency Top5')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Efficiency Points
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Motor Pump Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Motor Pump Wins {getSortIcon('Motor Pump Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Motor Pump Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Motor Pump Top5 {getSortIcon('Motor Pump Top5')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Motor Pump Points
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Buckets Wins')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Buckets Wins {getSortIcon('Buckets Wins')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                    onClick={() => handleSort('Buckets Top5')}
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Buckets Top5 {getSortIcon('Buckets Top5')}
                                                    </span>
                                                </th>
                                                <th 
                                                    scope="col" 
                                                    className="text-center pointer scorecard-cell-lg"
                                                >
                                                    <span className="d-flex align-items-center justify-content-center">
                                                        Buckets Points
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedProjections.map((projection, index) => (
                                                <tr key={`projection-${projection._id}-${index}`}>
                                                    <th scope="col" className="px-2 fixed-col bg-white">{projection.team}</th>
                                                    <td className="text-center">{formatPercentage(projection['Overall Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['Overall Top5'])}</td>
                                                    <td className="text-center">{getFinishAndPoints(projection.team, top5)}</td>
                                                    <td className="text-center">{formatPercentage(projection['Three Man Ladder Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['Three Man Ladder Top5'])}</td>
                                                    <td className="text-center">{getRunPoints(projection.team, 'Three Man Ladder', runs)}</td>
                                                    <td className="text-center">{formatPercentage(projection['B Ladder Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['B Ladder Top5'])}</td>
                                                    <td className="text-center">{getRunPoints(projection.team, 'B Ladder', runs)}</td>
                                                    <td className="text-center">{formatPercentage(projection['C Ladder Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['C Ladder Top5'])}</td>
                                                    <td className="text-center">{getRunPoints(projection.team, 'C Ladder', runs)}</td>
                                                    <td className="text-center">{formatPercentage(projection['C Hose Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['C Hose Top5'])}</td>
                                                    <td className="text-center">{getRunPoints(projection.team, 'C Hose', runs)}</td>
                                                    <td className="text-center">{formatPercentage(projection['B Hose Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['B Hose Top5'])}</td>
                                                    <td className="text-center">{getRunPoints(projection.team, 'B Hose', runs)}</td>
                                                    <td className="text-center">{formatPercentage(projection['Efficiency Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['Efficiency Top5'])}</td>
                                                    <td className="text-center">{getRunPoints(projection.team, 'Efficiency', runs)}</td>
                                                    <td className="text-center">{formatPercentage(projection['Motor Pump Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['Motor Pump Top5'])}</td>
                                                    <td className="text-center">{getRunPoints(projection.team, 'Motor Pump', runs)}</td>
                                                    <td className="text-center">{formatPercentage(projection['Buckets Wins'])}</td>
                                                    <td className="text-center">{formatPercentage(projection['Buckets Top5'])}</td>
                                                    <td className="text-center">{getRunPoints(projection.team, 'Buckets', runs)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                    }
                    {
                        isError || tournamentError || runsError && <div className="text-center">An error occurred please try again.</div>
                    }
                </div>
            </div>
        </div>
    )
}

 
function getFinishAndPoints(teamName: string, top5: {teamName: string, points: number, finishingPosition: string}[]) {
    const finish = top5.find(t => t.teamName === teamName)?.finishingPosition;
    const points = top5.find(t => t.teamName === teamName)?.points;
    if(!finish) return ""; 
    return `${finish} - ${points} pt${points === 1 ? "" : "s"}`;
}; 

function getRunPoints(teamName: string, contest: string, runs: Run[]) {
    const run = runs.find(r => r.team === teamName && r.contest === contest);
    if(!run || !run.points) return "";
    return `${run.time} - ${run.points} pt${run.points === 1 ? "" : "s"}`;
}