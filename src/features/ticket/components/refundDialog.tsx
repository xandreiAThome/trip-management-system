"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";
import useDeleteTicketMutation from "../hooks/useDeleteTicketMutation";

interface RefundDialogProps {
  ticketId: number;
  onSuccess: () => void;
}

export default function RefundDialog({
  ticketId,
  onSuccess,
}: RefundDialogProps) {
  const deleteTicketMutation = useDeleteTicketMutation();

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await deleteTicketMutation.mutateAsync(ticketId);
      onSuccess(); // Let parent component know
      document.getElementById(`close-${ticketId}`)?.click(); // Close dialog
    } catch (err) {
      console.error("Refund error:", err);
      // Error handling is done in the mutation hook
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-[70%] rounded-lg bg-[#B81F1F] hover:bg-[#8B1919] font-semibold text-lg">
          Refund
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleRefund}>
          <DialogHeader>
            <DialogTitle>Refund Ticket</DialogTitle>
            <DialogDescription className="mb-5 text-md">
              Are you sure you want to refund this ticket?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" id={`close-${ticketId}`}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={deleteTicketMutation.isPending}>
              {deleteTicketMutation.isPending ? "Refunding..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
