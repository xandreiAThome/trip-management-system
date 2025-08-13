import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateTripStatusParams {
  tripId: number;
  status: "boarding" | "transit" | "complete";
}

export default function useUpdateTripStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, status }: UpdateTripStatusParams) => {
      const res = await fetch(`/api/trip/${tripId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update trip status");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate daily trips queries to refresh the overview
      queryClient.invalidateQueries({ queryKey: ["daily-trips"] });
      // Also invalidate specific trip queries
      queryClient.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}
