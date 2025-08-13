import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateBusParams {
  plate_number: string;
  station_id: number;
  capacity: number;
}

export default function useCreateBusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plate_number,
      station_id,
      capacity,
    }: CreateBusParams) => {
      const res = await fetch("/api/bus", {
        method: "POST",
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
        throw new Error(errorData.message || "Failed to create bus");
      }

      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create bus");
    },
    onSuccess: () => {
      toast.success("Bus created successfully");
      // Invalidate and refetch buses
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      queryClient.invalidateQueries({ queryKey: ["bus-seats"] });
    },
  });
}
