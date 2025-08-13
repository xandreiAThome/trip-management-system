"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { AlignJustify, Map } from "lucide-react";
import IssuedTicketsModal from "@/features/ticket/components/issuedTicketsModal";
import EditTripModal from "./EditTrip";
import { AggregatedTripType } from "../types/types";
import { AggregatedBusType } from "@/features/bus/types/types";
import { DriverType } from "@/features/driver/types/types";
import { StationType } from "@/features/station/types/types";
import { formatTime } from "@/lib/utils";
import { toast } from "sonner";
import usePassengerTicketsQuery from "@/features/ticket/hooks/usePassengerTicketsQuery";
import useUpdateTripStatusMutation from "@/features/trips/hooks/useUpdateTripStatusMutation";

interface TripCardProps {
  trip: AggregatedTripType;
  onSuccessEdit: () => void;
  stations: StationType[];
  drivers: DriverType[];
  buses: AggregatedBusType[];
}

export default function TripCard({
  trip,
  onSuccessEdit,
  buses,
  stations,
  drivers,
}: TripCardProps) {
  const [status, setStatus] = useState<"boarding" | "transit" | "complete">(
    trip.status ?? "boarding"
  );

  // TanStack Query hooks
  const { data: passengerTickets = [] } = usePassengerTicketsQuery(trip.id);
  const updateTripStatusMutation = useUpdateTripStatusMutation();

  // Extract data from props (assuming props now includes the relations)
  const { src_station, dest_station, driver, bus } = trip;

  async function handleStatusChange(newStatus: string) {
    try {
      await updateTripStatusMutation.mutateAsync({
        tripId: trip.id,
        status: newStatus as "boarding" | "transit" | "complete",
      });

      setStatus(newStatus as "boarding" | "transit" | "complete");
      onSuccessEdit(); // Refresh trip data in parent component
    } catch (error) {
      console.error("Error updating trip status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update trip status";
      toast.error(errorMessage);
    }
  }

  // Loading state only for status changes now
  if (updateTripStatusMutation.isPending) {
    return (
      <Card className="flex flex-col gap-1 p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-[120px]"></div>
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col justify-center">
      <Card className="flex flex-col gap-1 p-5">
        {/* First Row*/}
        <div>
          <div className="flex items-center justify-between">
            {/* Left Side: Place and Time */}
            <div className="flex gap-2">
              <span className="font-semibold text-[#456A3B]">
                {src_station?.name || "Unknown"} →{" "}
                {dest_station?.name || "Unknown"}
              </span>
              <span>{formatTime(trip.start_time)}</span>
            </div>

            {/* Right Side: Ellipsis Button */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <AlignJustify />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="w-full justify-center"
                  onSelect={e => e.preventDefault()}
                >
                  <IssuedTicketsModal tripId={trip.id} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="text-[#456A3B]">
          {driver
            ? `${driver.first_name} ${driver.last_name}`
            : "Driver unknown"}{" "}
          | {bus.plate_number}
        </div>
        <div>
          <Select
            value={status}
            onValueChange={handleStatusChange}
            disabled={updateTripStatusMutation.isPending}
          >
            <SelectTrigger
              className={`
                w-[120px] rounded-lg font-bold ${status === "boarding" ? "bg-[#AC6161] text-white" : ""}
                ${status === "transit" ? "bg-[#EFA54A] text-white" : ""}
                ${status === "complete" ? "bg-[#71AC61] text-white" : ""}
              `}
            >
              <SelectValue>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="boarding">Boarding</SelectItem>
              <SelectItem value="transit">Transit</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end justify-between">
          {/* Left Side: Place and Time */}
          <div className="flex gap-2 items-center">
            <Link href={`/map/${trip.id}`} aria-label="View on map">
              <button className="p-1 rounded hover:bg-gray-100">
                <Map className="h-5 w-5" />
              </button>
            </Link>
            <EditTripModal
              trip={trip}
              onSuccess={onSuccessEdit}
              stations={stations}
              buses={buses}
              drivers={drivers}
            />
          </div>

          {/* Right Side:  */}
          <div className="flex flex-col items-end">
            <div className="flex flex-row gap-1 justify-end items-baseline mr-1">
              <span
                className={`font-bold ${
                  passengerTickets?.length > bus.capacity
                    ? "text-orange-600"
                    : ""
                }`}
              >
                {passengerTickets?.length} / {bus.capacity}
              </span>
              {passengerTickets?.length > bus.capacity && (
                <span className="text-xs text-orange-600 font-medium">
                  ({passengerTickets.length - bus.capacity} standing)
                </span>
              )}
            </div>
            <Link
              className="bg-green-700 text-white py-1 px-2 rounded-lg font-bold "
              href={`/ticket/${trip.id}`}
            >
              Issue Ticket
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
