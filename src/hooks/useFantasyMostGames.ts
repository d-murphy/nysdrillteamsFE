import { useQuery } from "@tanstack/react-query";


declare var SERVICE_URL: string;


export default function useFantasyMostGames() {

    console.log("useFantasyMostGames");
    const {
        data: mostGames,
        isLoading,
        isError,
        error,
        refetch
      } = useQuery({
        queryKey: ['fantasyMostGames'],
        queryFn: async (): Promise<{_id: string, gameCount: number}[]> => {
          const response = await fetch(`${SERVICE_URL}/fantasy/getMostGamesPlayed?limit=10&offset=0`);
          if (!response.ok) {
            throw new Error(`Failed to fetch most games played: ${response.statusText}`);
          }
          const data = await response.json();
          return data;
        },
      });
      return {
        mostGames,
        isLoading,
        isError,
        error,
        refetch
      };
}