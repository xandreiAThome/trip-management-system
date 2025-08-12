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
      return res.json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
      toast.success("Sucessfully added cashier");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to add cashier");
    },
  });
}
