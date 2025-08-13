import { useQuery } from "@tanstack/react-query";
import { AggregatedBusType } from "../types/types";

export default function useBusesQuery(initBuses?: AggregatedBusType[]) {
  return useQuery<AggregatedBusType[]>({
    queryKey: ["buses"],
    queryFn: async () => {
      const res = await fetch("/api/bus");
      if (!res.ok) {
        throw new Error("Failed to fetch buses");
      }
      const data = await res.json();
      return data.buses || data;
    },
    initialData: initBuses,
    staleTime: 60 * 1000, // 5 minutes
  });
}
