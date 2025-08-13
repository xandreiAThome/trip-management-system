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
      return res.json();
    },
    onMutate: async ({ id, update }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cashiers"] });

      // Snapshot the previous value
      const previousCashiers = queryClient.getQueryData<CashierType[]>([
        "cashiers",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<CashierType[]>(["cashiers"], (old = []) =>
        old.map(cashier =>
          cashier.id === id ? { ...cashier, ...update } : cashier
        )
      );

      // Return a context object with the snapshotted value
      return { previousCashiers };
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCashiers) {
        queryClient.setQueryData(["cashiers"], context.previousCashiers);
      }
      toast.error(error.message || "Failed to update cashier");
    },
    onSuccess: () => {
      toast.success("Successfully updated cashier");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });
}
