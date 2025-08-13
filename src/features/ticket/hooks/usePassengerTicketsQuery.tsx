import { useQuery } from "@tanstack/react-query";
import { AggregatedTicketType } from "@/features/ticket/types/types";

export default function usePassengerTicketsQuery(tripId: number | undefined) {
  return useQuery<AggregatedTicketType[]>({
    queryKey: ["passenger-tickets", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const res = await fetch(`/api/ticket/passenger/trip/${tripId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch passenger tickets");
      }
      const data = await res.json();
      return data.passenger_tickets || [];
    },
    enabled: !!tripId,
    staleTime: 60 * 1000, // 2 minutes
  });
}
