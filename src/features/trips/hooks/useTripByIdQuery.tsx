import { useQuery } from "@tanstack/react-query";
import { AggregatedTripType } from "../types/types";

export default function useTripByIdQuery(tripId: string) {
  return useQuery<AggregatedTripType>({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      if (!tripId) throw new Error("Trip ID is required");
      const res = await fetch(`/api/trip/${tripId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch trip");
      }
      const data = await res.json();
      return {
        ...data,
        start_time: data.start_time ? new Date(data.start_time) : null,
        end_time: data.end_time ? new Date(data.end_time) : null,
      };
    },
    enabled: !!tripId,
    staleTime: 60 * 1000, // 5 minutes
  });
}
