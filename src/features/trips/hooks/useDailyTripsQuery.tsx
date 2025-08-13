import { useQuery } from "@tanstack/react-query";
import { AggregatedTripType } from "@/features/trips/types/types";

export default function useDailyTripsQuery(date: string) {
  return useQuery<AggregatedTripType[]>({
    queryKey: ["daily-trips", date],
    queryFn: async () => {
      const res = await fetch(`/api/trip/daily?date=${date}`);
      if (!res.ok) {
        throw new Error("Failed to fetch daily trips");
      }
      const data = await res.json();
      return data.trips || [];
    },
    enabled: !!date,
    staleTime: 60 * 1000, // 5 minutes
  });
}
