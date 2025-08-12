import { useQuery } from "@tanstack/react-query";
import { UserType } from "../types/types";

export default function useUsersQuery(initialUsers?: UserType[]) {
  return useQuery<UserType[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      return data.users;
    },
    initialData: initialUsers,
  });
}
