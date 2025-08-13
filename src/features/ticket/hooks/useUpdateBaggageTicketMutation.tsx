import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UpdateBaggageTicketPayload = {
  id: number;
  price?: number;
  cashier_id?: number;
  trip_id: number;
  ticket_type: string;
  sender_no?: string | number;
  dispatcher_no?: string | number;
  sender_name?: string;
  receiver_name?: string;
  item?: string;
};

export default function useUpdateBaggageTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateBaggageTicketPayload) => {
      const res = await fetch(`/api/ticket/baggage/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update baggage ticket");
      }

      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update baggage ticket");
    },
    onSuccess: () => {
      toast.success("Baggage ticket updated successfully");
      // Invalidate ticket queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["passenger-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["baggage-tickets"] });
    },
  });
}
