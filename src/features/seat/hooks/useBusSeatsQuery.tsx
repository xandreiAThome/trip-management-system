import { useQuery } from "@tanstack/react-query";
import { SeatType } from "../types/types";

export default function useBusSeatsQuery(busId: number | undefined) {
  return useQuery<SeatType[]>({
    queryKey: ["bus-seats", busId],
    queryFn: async () => {
      if (!busId) return [];
      const res = await fetch(`/api/bus/${busId}/seats`);
      if (!res.ok) {
        throw new Error("Failed to fetch bus seats");
      }
      const data = await res.json();
      return data.seats || [];
    },
    enabled: !!busId,
    staleTime: 60 * 1000, // 2 minutes
  });
}
