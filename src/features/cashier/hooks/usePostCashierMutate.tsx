import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CashierType } from "../types/types";

type CashierPayload = Omit<CashierType, "id" | "shift_start" | "shift_end">;

export default function usePostCashierMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CashierPayload) => {
      const res = await fetch(`/api/cashier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post cashier");
      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add cashier");
    },
    onSuccess: () => {
      toast.success("Successfully added cashier");
    },
    onSettled: () => {
      // Refetch after completion to get the real server data
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });
}
