import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UpdateTicketPayload = {
  id: number;
  price?: number;
  cashier_id?: number;
  trip_id: number;
  ticket_type: string;
};

export default function useUpdateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTicketPayload) => {
      const res = await fetch(`/api/ticket/passenger/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update ticket");
      }

      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ticket");
    },
    onSuccess: () => {
      toast.success("Ticket updated successfully");
      // Invalidate ticket queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["passenger-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["baggage-tickets"] });
    },
  });
}
