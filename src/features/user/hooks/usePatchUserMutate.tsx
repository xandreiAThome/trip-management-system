import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserType } from "../types/types";

export default function usePatchUserMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      update,
    }: {
      id: number;
      update: Partial<UserType>;
    }) => {
      const res = await fetch(`/api/user/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Failed to patch user");
      return res.json();
    },
    onMutate: async ({ id, update }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<UserType[]>(["users"]);

      // Optimistically update to the new value
      queryClient.setQueryData<UserType[]>(["users"], (old = []) =>
        old.map(user => (user.id === id ? { ...user, ...update } : user))
      );

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }
      toast.error(error.message || "Failed to update user");
    },
    onSuccess: () => {
      toast.success("Successfully updated user");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
