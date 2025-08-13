import { useQuery } from "@tanstack/react-query";
import { AggregatedTicketType } from "@/features/ticket/types/types";

export default function useBaggageTicketsQuery(tripId: number | undefined) {
  return useQuery<AggregatedTicketType[]>({
    queryKey: ["baggage-tickets", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const res = await fetch(`/api/ticket/baggage/trip/${tripId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch baggage tickets");
      }
      const data = await res.json();
      return data.baggage_tickets || [];
    },
    enabled: !!tripId,
    staleTime: 60 * 1000, // 2 minutes
  });
}
