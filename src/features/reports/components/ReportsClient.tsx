"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PassengerTicketsTable } from "./passengerTicketsTable";
import { BaggageTicketsTable } from "./baggageTicketsTable";
import { format } from "date-fns";
import useDailyTripsQuery from "@/features/trips/hooks/useDailyTripsQuery";
import usePassengerTicketsQuery from "@/features/ticket/hooks/usePassengerTicketsQuery";
import useBaggageTicketsQuery from "@/features/ticket/hooks/useBaggageTicketsQuery";

export default function ReportsClient() {
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [day, setDay] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  // TanStack Query hooks
  const { data: tripsList = [], isLoading: loadingTrips } =
    useDailyTripsQuery(day);

  const { data: passengerTickets = [], isLoading: loadingPassengerTickets } =
    usePassengerTicketsQuery(selectedTrip === null ? undefined : selectedTrip);

  const { data: baggageTickets = [], isLoading: loadingBaggageTickets } =
    useBaggageTicketsQuery(selectedTrip === null ? undefined : selectedTrip);

  // Auto-select first trip when trips load
  useEffect(() => {
    if (tripsList.length > 0 && !selectedTrip) {
      setSelectedTrip(tripsList[0].id);
    }
  }, [tripsList, selectedTrip]);

  // Reset selected trip when day changes
  useEffect(() => {
    setSelectedTrip(null);
  }, [day]);

  const loadingTickets = loadingPassengerTickets || loadingBaggageTickets;

  return (
    <div className="min-h-screen w-full bg-green-50">
      <div className="max-w-4xl mx-auto py-8 ">
        <div className="mb-6 max-w-4xl mx-auto py-8 ">
          <div className="text-2xl font-bold text-green-700 mb-2">
            Tellers Report
          </div>
          <div className="bg-green-50 border border-green-400 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center shadow">
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-1 font-semibold text-green-700">
                <span className="mr-2">Day</span>
                <Input
                  type="date"
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  className="w-[180px] text-green-700 font-semibold"
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-green-700">
                Select Trip:
              </label>
              <Select
                value={selectedTrip ? String(selectedTrip) : ""}
                onValueChange={val => setSelectedTrip(Number(val))}
                disabled={loadingTrips}
              >
                <SelectTrigger
                  className="w-[220px] text-green-700 font-semibold"
                  aria-label="Select Trip"
                >
                  <SelectValue
                    placeholder={
                      loadingTrips ? "Loading trips..." : "Select a trip"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {loadingTrips ? (
                    <div className="p-4 text-center text-green-600">
                      Loading trips...
                    </div>
                  ) : Array.isArray(tripsList) && tripsList.length > 0 ? (
                    tripsList.map(trip => (
                      <SelectItem key={trip.id} value={String(trip.id)}>
                        Trip {trip.src_station.name} {"-> "}
                        {trip.dest_station.name}{" "}
                        {trip?.start_time
                          ? new Date(trip.start_time).toLocaleString()
                          : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-green-600">
                      No trips found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {loadingTrips || loadingTickets ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-green-600 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <div className="text-green-700 font-semibold text-lg">
              {loadingTrips ? "Loading trips..." : "Loading tickets..."}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="passenger" className="w-full">
            <TabsList className="flex justify-center bg-green-100 rounded mb-4">
              <TabsTrigger
                value="passenger"
                className="text-green-700 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                Passenger Tickets
              </TabsTrigger>
              <TabsTrigger
                value="baggage"
                className="text-green-700 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                Baggage Tickets
              </TabsTrigger>
            </TabsList>
            <TabsContent value="passenger">
              <PassengerTicketsTable
                tickets={passengerTickets}
                selectedTrip={tripsList.find(trip => trip.id === selectedTrip)}
              />
            </TabsContent>
            <TabsContent value="baggage">
              <BaggageTicketsTable
                tickets={baggageTickets}
                selectedTrip={tripsList.find(trip => trip.id === selectedTrip)}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
