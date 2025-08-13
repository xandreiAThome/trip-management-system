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
      return res.json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Sucessfully updated station");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to update station");
    },
  });
}
