import { useQuery } from "@tanstack/react-query";
import { SimulationRun } from "../types/types";


declare const SERVICE_URL: string;


export default function useFantasySimulationRuns(draftPickKeys: string[]) {
    const sortedDraftPickKeys = draftPickKeys.sort((a, b) => a.localeCompare(b));
    const { data, isLoading, isError, error, refetch } = useQuery<SimulationRun[]>({
        queryKey: ['fantasySimulationRuns', sortedDraftPickKeys],
        queryFn: () => getFantasySimulationRuns(sortedDraftPickKeys)        
    })
    return { data, isLoading, isError, error, refetch }
}

async function getFantasySimulationRuns(draftPickKeys: string[]) {
    const response = await fetch(`${SERVICE_URL}/simulationRuns/getSimulationRuns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keys: draftPickKeys })
    })
    return response.json()
}