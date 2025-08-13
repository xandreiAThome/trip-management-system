"use client";

import { AggregatedTicketType } from "@features/ticket/types/types";
import React, { useEffect, useState } from "react";
import { CashierType } from "@features/cashier/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUpdateTicketMutation from "../hooks/useUpdateTicketMutation";

interface EditPassengerModalProps {
  ticket: AggregatedTicketType;
  cashiers: CashierType[];
  onSuccess?: () => void;
}

export default function EditPassengerDialog({
  ticket,
  cashiers,
  onSuccess,
}: EditPassengerModalProps) {
  const [cashierId, setCashierId] = useState("");
  const [price, setPrice] = useState("");
  const [open, setOpen] = useState(false);
  const updateTicketMutation = useUpdateTicketMutation();

  useEffect(() => {
    if (open) {
      setPrice(ticket.price.toString());
      setCashierId(ticket.cashier.id.toString() || "");
    }
  }, [ticket, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cashierId && !price) {
      return;
    }

    try {
      await updateTicketMutation.mutateAsync({
        id: ticket.id,
        price: parseFloat(price),
        trip_id: ticket.trip_id,
        cashier_id: cashierId
          ? parseInt(cashierId)
          : (ticket.cashier?.id ?? undefined),
        ticket_type: ticket.ticket_type,
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error updating ticket:", err);
      // Error handling is done in the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit ticket">
          <SquarePen size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Ticket #{ticket.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="mb-2">Price (₱)</Label>
            <Input
              type="number"
              step="1"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-2">Cashier</Label>
            <Select value={cashierId} onValueChange={setCashierId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select cashier" />
              </SelectTrigger>
              <SelectContent>
                {cashiers.map(cashier => (
                  <SelectItem key={cashier.id} value={cashier.id.toString()}>
                    {cashier.first_name} {cashier.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#71AC61] hover:bg-[#456A3B]"
            disabled={updateTicketMutation.isPending}
          >
            {updateTicketMutation.isPending ? "Saving..." : "Update Ticket"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
