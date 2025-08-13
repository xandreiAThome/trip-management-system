import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TripType } from "../types/types";
import { toast } from "sonner";

type CreateTripPayload = Omit<
  TripType,
  "status" | "id" | "start_time" | "end_time"
> & {
  start_time: string;
  end_time: string;
};

export default function useCreateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTripPayload) => {
      const res = await fetch("/api/trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create trip");
      }

      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create trip");
    },
    onSuccess: () => {
      // Invalidate daily trips queries to refresh the overview
      queryClient.invalidateQueries({ queryKey: ["daily-trips"] });
    },
  });
}
