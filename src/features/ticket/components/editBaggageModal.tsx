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
import useUpdateBaggageTicketMutation from "../hooks/useUpdateBaggageTicketMutation";

interface EditBaggageModalProps {
  ticket: AggregatedTicketType;
  cashiers: CashierType[];
  onSuccess?: () => void;
}

export default function EditBaggageDialog({
  ticket,
  cashiers,
  onSuccess,
}: EditBaggageModalProps) {
  const [cashierId, setCashierId] = useState("");
  const [price, setPrice] = useState("");
  const [senderNo, setSenderNo] = useState("");
  const [dispatcherNo, setDispatcherNo] = useState("");
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [item, setItem] = useState("");
  const [open, setOpen] = useState(false);
  const updateBaggageTicketMutation = useUpdateBaggageTicketMutation();

  useEffect(() => {
    if (open) {
      setPrice(ticket.price.toString());
      setCashierId(ticket.cashier.id.toString() || "");
      setSenderNo(ticket.baggage_ticket.sender_no || "");
      setDispatcherNo(ticket.baggage_ticket.dispatcher_no || "");
      setSenderName(ticket.baggage_ticket.sender_name || "");
      setReceiverName(ticket.baggage_ticket.receiver_name || "");
      setItem(ticket.baggage_ticket.item || "");
    }
  }, [ticket, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !cashierId &&
      !price &&
      !senderNo &&
      !dispatcherNo &&
      !senderName &&
      !receiverName &&
      !item
    ) {
      return;
    }

    try {
      await updateBaggageTicketMutation.mutateAsync({
        id: ticket.id,
        price: parseFloat(price),
        trip_id: ticket.trip_id,
        cashier_id: cashierId
          ? parseInt(cashierId)
          : (ticket.cashier?.id ?? undefined),
        ticket_type: ticket.ticket_type,
        sender_no:
          parseInt(senderNo) || parseInt(ticket.baggage_ticket.sender_no),
        dispatcher_no:
          parseInt(dispatcherNo) ||
          parseInt(ticket.baggage_ticket.dispatcher_no),
        sender_name: senderName || ticket.baggage_ticket.sender_name,
        receiver_name: receiverName || ticket.baggage_ticket.receiver_name,
        item: item || ticket.baggage_ticket.item,
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error updating baggage ticket:", err);
      // Error handling is done in the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit baggage ticket">
          <SquarePen size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Baggage Ticket #{ticket.id}</DialogTitle>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2">Sender No.</Label>
              <Input
                type="number"
                value={senderNo}
                onChange={e => setSenderNo(e.target.value)}
                placeholder="Sender number"
              />
            </div>
            <div>
              <Label className="mb-2">Dispatcher No.</Label>
              <Input
                type="number"
                value={dispatcherNo}
                onChange={e => setDispatcherNo(e.target.value)}
                placeholder="Dispatcher number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2">Sender Name</Label>
              <Input
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="Sender name"
              />
            </div>
            <div>
              <Label className="mb-2">Receiver Name</Label>
              <Input
                value={receiverName}
                onChange={e => setReceiverName(e.target.value)}
                placeholder="Receiver name"
              />
            </div>
          </div>
          <div>
            <Label className="mb-2">Item Description</Label>
            <Input
              value={item}
              onChange={e => setItem(e.target.value)}
              placeholder="Item description"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#71AC61] hover:bg-[#456A3B]"
            disabled={updateBaggageTicketMutation.isPending}
          >
            {updateBaggageTicketMutation.isPending
              ? "Saving..."
              : "Update Baggage Ticket"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
