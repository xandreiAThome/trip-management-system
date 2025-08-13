import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: number) => {
      const res = await fetch(`/api/ticket/${ticketId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Refund failed");
      }

      return res.json();
    },
    onError: (error: Error) => {
      toast.error(`Refund failed: ${error.message || "Unknown error"}`);
    },
    onSuccess: () => {
      toast.success("Ticket refunded successfully");
      // Invalidate ticket queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["passenger-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["baggage-tickets"] });
    },
  });
}
