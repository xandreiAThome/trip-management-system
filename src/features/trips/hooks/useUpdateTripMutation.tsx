import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type UpdateTripPayload = {
  id: number;
  driver_id?: number;
  bus_id?: number;
  src_station_id?: number;
  dest_station_id?: number;
  start_time?: string;
  end_time?: string;
  status?: "boarding" | "transit" | "complete";
};

export default function useUpdateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTripPayload) => {
      const res = await fetch(`/api/trip/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update trip");
      }

      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update trip");
    },
    onSuccess: () => {
      toast.success("Trip updated successfully");
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["daily-trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip"] });
      // Invalidate seat queries as well in case trip status was updated
      queryClient.invalidateQueries({
        queryKey: ["bus-seats"],
        exact: false,
      });
    },
  });
}
