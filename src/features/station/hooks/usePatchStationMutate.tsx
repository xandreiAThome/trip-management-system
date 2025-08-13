import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StationType } from "../types/types";

export default function usePatchStationMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      update,
    }: {
      id: number;
      update: Partial<StationType>;
    }) => {
      const res = await fetch(`/api/station/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Failed to patch station");
      return res.json();
    },
    onMutate: async ({ id, update }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["stations"] });

      // Snapshot the previous value
      const previousStations = queryClient.getQueryData<StationType[]>([
        "stations",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<StationType[]>(["stations"], (old = []) =>
        old.map(station =>
          station.id === id ? { ...station, ...update } : station
        )
      );

      // Return a context object with the snapshotted value
      return { previousStations };
    },
    onSuccess: () => {
      toast.success("Sucessfully updated station");
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousStations) {
        queryClient.setQueryData(["stations"], context.previousStations);
      }
      toast.error(error.message || "Failed to update station");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    },
  });
}
