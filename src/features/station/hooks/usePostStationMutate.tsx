import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StationType } from "../types/types";

type StationPayload = Omit<StationType, "id">;

export default function usePostStationMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StationPayload) => {
      const res = await fetch(`/api/station`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post station");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Sucessfully added station");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to add station");
    },
  });
}
