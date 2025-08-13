"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import TripCard from "@/features/trips/components/tripCard";
import { Toaster } from "sonner";
import useDailyTripsQuery from "@/features/trips/hooks/useDailyTripsQuery";

export default function PastTripsPage() {
  // Use string for date in yyyy-MM-dd format for compatibility with input[type=date]
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  // Use TanStack Query hook to fetch trips
  const { data: trips = [], isLoading } = useDailyTripsQuery(selectedDate);

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-8 px-2">
      <Toaster richColors position="top-center" />
      <div className="w-full max-w-2xl mb-8 bg-green-100 rounded-lg shadow p-2 border border-green-300">
        <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
          Past Trips
        </h2>
        <form
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          onSubmit={e => {
            e.preventDefault();
            // TanStack Query will automatically refetch when selectedDate changes
          }}
        >
          <label className="font-semibold text-green-700" htmlFor="date-picker">
            Select Date:
          </label>
          <input
            id="date-picker"
            type="date"
            className="rounded border border-green-400 px-3 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-green-900"
            defaultValue={selectedDate}
            max={format(new Date(), "yyyy-MM-dd")}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </form>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        {isLoading ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-8 text-center text-green-700">
              Loading trips...
            </CardContent>
          </Card>
        ) : trips.length === 0 ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-8 text-center text-green-700">
              No trips found for this day.
            </CardContent>
          </Card>
        ) : (
          trips.map(trip => <TripCard key={trip.id} trip={trip} />)
        )}
      </div>
    </div>
  );
}
