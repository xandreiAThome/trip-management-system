"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SquarePen } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AggregatedTripType } from "../types/types";
import TimePicker from "./timePicker";
import useUpdateTripMutation from "../hooks/useUpdateTripMutation";
import useBusesQuery from "@/features/bus/hooks/useBusesQuery";
import useDriversQuery from "@/features/driver/hooks/useDriversQuery";
import useStationsQuery from "@/features/station/hooks/useStationsQuery";

interface EditTripModalProps {
  trip: AggregatedTripType;
}

export default function EditTripModal({ trip }: EditTripModalProps) {
  // Use TanStack Query hooks to fetch data
  const { data: buses = [] } = useBusesQuery();
  const { data: drivers = [] } = useDriversQuery();
  const { data: stations = [] } = useStationsQuery();

  const updateTripMutation = useUpdateTripMutation();

  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [srcStationId, setSrcStationId] = useState("");
  const [destStationId, setDestStationId] = useState("");
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [originalStartTime, setOriginalStartTime] = useState<Date>(new Date());
  const [originalEndTime, setOriginalEndTime] = useState<Date>(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isSubmitting = updateTripMutation.isPending;

  useEffect(() => {
    // Set form fields from trip prop
    setDriverId(trip.driver?.id ? String(trip.driver.id) : "");
    setBusId(trip.bus?.id ? String(trip.bus.id) : "");
    setSrcStationId(trip.src_station?.id ? String(trip.src_station.id) : "");
    setDestStationId(trip.dest_station?.id ? String(trip.dest_station.id) : "");

    // Convert UTC strings to Date objects
    const startDate = trip.start_time ? new Date(trip.start_time) : new Date();
    const endDate = trip.end_time ? new Date(trip.end_time) : new Date();

    setStartTime(startDate);
    setEndTime(endDate);
    setOriginalStartTime(startDate);
    setOriginalEndTime(endDate);
  }, [trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!driverId && !busId && !srcStationId && !destStationId) {
      updateTripMutation.reset();
      return;
    }
    if (!startTime || !endTime) {
      updateTripMutation.reset();
      return;
    }
    if (endTime <= startTime) {
      updateTripMutation.reset();
      return;
    }

    try {
      // Only include time fields if they've been changed
      const hasStartTimeChanged =
        startTime.getTime() !== originalStartTime.getTime();
      const hasEndTimeChanged = endTime.getTime() !== originalEndTime.getTime();

      const requestBody: Record<string, number | string | undefined> = {
        driver_id: driverId
          ? parseInt(driverId)
          : (trip.driver?.id ?? undefined),
        bus_id: busId ? parseInt(busId) : (trip.bus?.id ?? undefined),
        src_station_id: srcStationId
          ? parseInt(srcStationId)
          : (trip.src_station?.id ?? undefined),
        dest_station_id: destStationId
          ? parseInt(destStationId)
          : (trip.dest_station?.id ?? undefined),
      };

      // Only add time fields if they've been changed
      if (hasStartTimeChanged) {
        requestBody.start_time = startTime.toISOString();
      }
      if (hasEndTimeChanged) {
        requestBody.end_time = endTime.toISOString();
      }

      await updateTripMutation.mutateAsync({
        id: trip.id,
        ...requestBody,
      });

      setDrawerOpen(false);
    } catch (err) {
      console.error("Error updating trip:", err);
    }
  };

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit trip">
          <SquarePen className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-2 max-w-4xl mx-auto flex flex-col">
        <DrawerHeader>
          <DrawerTitle className="text-center text-[#71AC61]">
            Edit Trip
          </DrawerTitle>
          <hr className="border-t-2 mt-2 mb-4" />
        </DrawerHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-4 pb-6 overflow-y-auto flex-1"
        >
          {/* Driver */}
          <div>
            <Label>Driver</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id.toString()}>
                    {`${driver.first_name} ${driver.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source Station */}
          <div>
            <Label>Source Station</Label>
            <Select value={srcStationId} onValueChange={setSrcStationId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Source" />
              </SelectTrigger>
              <SelectContent>
                {stations.map(station => (
                  <SelectItem key={station.id} value={station.id.toString()}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destination Station */}
          <div>
            <Label>Destination Station</Label>
            <Select value={destStationId} onValueChange={setDestStationId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Destination" />
              </SelectTrigger>
              <SelectContent>
                {stations.map(station => (
                  <SelectItem key={station.id} value={station.id.toString()}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bus */}
          <div>
            <Label>Bus</Label>
            <Select value={busId} onValueChange={setBusId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map(bus => (
                  <SelectItem key={bus.id} value={bus.id.toString()}>
                    {bus.plate_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-around flex-wrap gap-2">
            <TimePicker
              time={startTime}
              setTime={setStartTime}
              label="Start Time"
            ></TimePicker>

            <TimePicker
              time={endTime}
              setTime={setEndTime}
              label="End Time"
            ></TimePicker>
          </div>

          <Button
            type="submit"
            className="bg-[#71AC61] hover:bg-[#456A3B] mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Trip"}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
