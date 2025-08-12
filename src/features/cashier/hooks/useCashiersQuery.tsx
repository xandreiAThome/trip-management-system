import { useQuery } from "@tanstack/react-query";
import { CashierType } from "../types/types";

export default function useCashiersQuery(initCashiers?: CashierType[]) {
  return useQuery<CashierType[]>({
    queryKey: ["cashiers"],
    queryFn: async () => {
      const res = await fetch("/api/cashier");
      if (!res.ok) {
        throw new Error("Failed to fetch cashiers");
      }
      const data = await res.json();
      return data.cashiers;
    },
    initialData: initCashiers,
  });
}
