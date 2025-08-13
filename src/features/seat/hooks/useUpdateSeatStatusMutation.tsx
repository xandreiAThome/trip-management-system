import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateSeatStatusParams {
  seatId: number;
  status: "available" | "occupied";
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
    onSuccess: () => {
      // Invalidate bus seats queries that might contain this seat
      queryClient.invalidateQueries({ queryKey: ["bus-seats"] });
    },
  });
}
