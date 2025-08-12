import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CashierType } from "../types/types";

export default function usePatchCashierMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      update,
    }: {
      id: number;
      update: Partial<CashierType>;
    }) => {
      const res = await fetch(`/api/cashier/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Failed to patch cashier");
      return res.json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
      toast.success("Sucessfully updated cashier");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to update cashier");
    },
  });
}
