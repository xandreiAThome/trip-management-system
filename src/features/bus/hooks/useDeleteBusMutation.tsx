import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteBusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (busId: number) => {
      const res = await fetch(`/api/bus/${busId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete bus");
      }

      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete bus");
    },
    onSuccess: () => {
      toast.success("Bus deleted successfully");
      // Invalidate and refetch buses
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}
