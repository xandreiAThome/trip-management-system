import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteStationMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/station/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete station");
      return res.json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Sucessfully deleted station");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete station");
    },
  });
}
