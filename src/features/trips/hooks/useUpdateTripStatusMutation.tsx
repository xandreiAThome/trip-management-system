import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AggregatedTripType } from "../types/types";

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
    onMutate: async ({ tripId, status }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["daily-trips"] });
      await queryClient.cancelQueries({ queryKey: ["trip", tripId] });

      // Snapshot the previous values for rollback
      const previousDailyTrips = queryClient.getQueryData<AggregatedTripType[]>(
        ["daily-trips"]
      );
      const previousTrip = queryClient.getQueryData<AggregatedTripType>([
        "trip",
        tripId,
      ]);

      // Optimistically update daily trips cache
      queryClient.setQueryData<AggregatedTripType[]>(["daily-trips"], old => {
        if (!old) return old;
        return old.map(trip =>
          trip.id === tripId ? { ...trip, status } : trip
        );
      });

      // Optimistically update specific trip cache
      queryClient.setQueryData<AggregatedTripType>(["trip", tripId], old => {
        if (!old) return old;
        return { ...old, status };
      });

      // Return context with previous values for potential rollback
      return { previousDailyTrips, previousTrip, tripId };
    },
    onError: (error: Error, variables, context) => {
      // Roll back to previous values on error
      if (context?.previousDailyTrips) {
        queryClient.setQueryData(["daily-trips"], context.previousDailyTrips);
      }
      if (context?.previousTrip) {
        queryClient.setQueryData(
          ["trip", context.tripId],
          context.previousTrip
        );
      }
      toast.error(error.message || "Failed to update trip status");
    },
    onSuccess: () => {
      toast.success("Trip status updated successfully!");
    },
    onSettled: () => {
      // Always refetch to ensure server state is in sync
      queryClient.invalidateQueries({ queryKey: ["daily-trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip"] });
      // Invalidate seat queries as seat status may have changed
      queryClient.invalidateQueries({
        queryKey: ["bus-seats"],
        exact: false,
      });
    },
  });
}
