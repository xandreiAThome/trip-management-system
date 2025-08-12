import { useQuery } from "@tanstack/react-query";
import { DriverType } from "../types/types";

export default function useDriversQuery(initDrivers?: DriverType[]) {
  return useQuery<DriverType[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await fetch("/api/driver");
      if (!res.ok) {
        throw new Error("Failed to fetch drivers");
      }
      const data = await res.json();
      return data.drivers;
    },
    initialData: initDrivers,
  });
}
