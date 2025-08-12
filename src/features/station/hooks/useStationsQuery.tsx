import { useQuery } from "@tanstack/react-query";
import { StationType } from "../types/types";

export default function useStationsQuery(initStations?: StationType[]) {
  return useQuery<StationType[]>({
    queryKey: ["stations"],
    queryFn: async () => {
      const res = await fetch("/api/station");
      if (!res.ok) {
        throw new Error("Failed to fetch stations");
      }
      const data = await res.json();
      return data.stations;
    },
    initialData: initStations,
  });
}
