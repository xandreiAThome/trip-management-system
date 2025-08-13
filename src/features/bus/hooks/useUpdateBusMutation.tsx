import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AggregatedBusType } from "@/features/bus/types/types";

interface UpdateBusParams {
  id: number;
  plate_number: string;
  station_id: number;
  capacity: number;
}

export default function useUpdateBusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      plate_number,
      station_id,
      capacity,
    }: UpdateBusParams) => {
      const res = await fetch(`/api/bus/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plate_number,
          station_id,
          capacity,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update bus");
      }

      return res.json();
    },
    onMutate: async (newBusData: UpdateBusParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["buses"] });

      // Snapshot the previous value
      const previousBuses = queryClient.getQueryData<AggregatedBusType[]>([
        "buses",
      ]);

      // Get stations data for optimistic update
      const stations = queryClient.getQueryData(["stations"]) as
        | { id: number; name: string }[]
        | undefined;
      const station = stations?.find(s => s.id === newBusData.station_id);

      // Optimistically update to the new value
      queryClient.setQueryData<AggregatedBusType[]>(["buses"], old => {
        if (!old) return old;

        return old.map(bus =>
          bus.id === newBusData.id
            ? {
                ...bus,
                plate_number: newBusData.plate_number,
                capacity: newBusData.capacity,
                station: station || bus.station, // Use found station or keep existing
              }
            : bus
        );
      });

      // Return a context object with the snapshotted value
      return { previousBuses };
    },
    onError: (error: Error, newBusData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBuses) {
        queryClient.setQueryData(["buses"], context.previousBuses);
      }
      toast.error(error.message || "Failed to update bus");
    },
    onSuccess: () => {
      toast.success("Bus updated successfully");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      queryClient.invalidateQueries({ queryKey: ["bus-seats"] });
    },
  });
}
