import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateTicketParams {
  price: string;
  trip_id: number;
  cashier_id: number;
  ticket_type: "passenger" | "baggage";
  // Passenger ticket fields
  passenger_name?: string;
  seat_id?: number | null;
  seat_number?: string | null;
  // Baggage ticket fields
  sender_no?: string;
  dispatcher_no?: string;
  sender_name?: string;
  receiver_name?: string;
  item?: string;
}

export default function useCreateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTicketParams) => {
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create ticket");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate ticket queries for this trip
      queryClient.invalidateQueries({
        queryKey: ["passenger-tickets", variables.trip_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["baggage-tickets", variables.trip_id],
      });
    },
  });
}
