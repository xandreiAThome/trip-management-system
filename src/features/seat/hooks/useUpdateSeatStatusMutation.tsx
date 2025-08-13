import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateSeatStatusParams {
  seatId: number;
  status: "available" | "occupied";
  busId?: number; // Add busId to help with cache invalidation
}

export default function useUpdateSeatStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ seatId, status }: UpdateSeatStatusParams) => {
      const res = await fetch(`/api/seat/${seatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update seat status");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate all bus seats queries to ensure all affected queries are refreshed
      queryClient.invalidateQueries({
        queryKey: ["bus-seats"],
        exact: false, // This will invalidate all queries that start with ["bus-seats"]
      });

      // If busId is provided, specifically invalidate that bus's seats
      if (variables.busId) {
        queryClient.invalidateQueries({
          queryKey: ["bus-seats", variables.busId],
        });
      }
    },
  });
}
