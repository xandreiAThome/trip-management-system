import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DriverType } from "../types/types";

type DriverPayload = Omit<DriverType, "id">;

export default function usePostDriverMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DriverPayload) => {
      const res = await fetch(`/api/driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post driver");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Sucessfully added driver");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to add driver");
    },
  });
}
