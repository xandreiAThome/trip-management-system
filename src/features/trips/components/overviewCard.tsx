"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TripCard from "@/features/trips/components/tripCard";
import { CreateTripModal } from "@/features/trips/components/CreateTrip";
import { useState, useMemo } from "react";
import { Toaster } from "sonner";
import { format } from "date-fns";
import useDailyTripsQuery from "@/features/trips/hooks/useDailyTripsQuery";
import useStationsQuery from "@/features/station/hooks/useStationsQuery";
import useBusesQuery from "@/features/bus/hooks/useBusesQuery";
import useDriversQuery from "@/features/driver/hooks/useDriversQuery";

type TripStatus = "all" | "transit" | "complete" | "boarding";

export default function OverviewCard() {
  const [statusFilter, setStatusFilter] = useState<TripStatus>("boarding");
  const today = format(new Date(), "yyyy-MM-dd");

  // TanStack Query hooks
  const {
    data: trips = [],
    isLoading: isTripsLoading,
    refetch: refetchTrips,
  } = useDailyTripsQuery(today);
  const { data: stations = [], isLoading: isStationsLoading } =
    useStationsQuery();
  const { data: buses = [], isLoading: isBusesLoading } = useBusesQuery();
  const { data: drivers = [], isLoading: isDriversLoading } = useDriversQuery();

  // Computed values
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      if (statusFilter === "all") return true;
      return trip.status === statusFilter;
    });
  }, [trips, statusFilter]);

  const isLoading = isTripsLoading;
  const isMetaLoading = isStationsLoading || isBusesLoading || isDriversLoading;

  const handleRefetchTrips = () => {
    refetchTrips();
  };

  if (isMetaLoading) {
    return (
      <div className="h-full flex items-center justify-center p-5 min-h-screen">
        <Card className="w-full max-w-2xl mx-auto p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#71AC61] mb-4"></div>
          <div className="text-lg text-gray-600 font-semibold">
            Loading data...
          </div>
        </Card>
      </div>
    );
  }

  console.log(trips);

  return (
    <div className="h-full flex items-start justify-center p-5  sm:pt-5 pt-12 relative bg-green-50">
      <Card className="w-full max-w-4xl h-full min-h-[calc(100vh-40px)] overflow-y-auto p-5">
        <CardHeader className="border-b border-gray-300">
          <div className="flex flex-col items-center">
            <CardTitle className="mt-2 text-xl font-extrabold text-green-700">
              Trips Overview
            </CardTitle>
            <div className="mt-1 text-green-700 font-semibold text-base">
              {format(new Date(), "MMMM dd, yyyy")}
            </div>

            {/* Status Filter Buttons */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {(["all", "transit", "complete", "boarding"] as TripStatus[]).map(
                status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      statusFilter === status
                        ? "bg-green-800 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all"
                      ? "All Trips"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 mt-4">
          {isLoading ? (
            <div className="text-center text-green-700 font-bold">
              Loading trips...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-bold">
              {trips.length === 0
                ? "No trips found"
                : `No ${statusFilter} trips found`}
            </div>
          ) : (
            <div className="flex flex-col overflow-y-auto gap-y-4">
              {filteredTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  onSuccessEdit={handleRefetchTrips}
                  trip={trip}
                  stations={stations}
                  buses={buses}
                  drivers={drivers}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex mt-4 justify-center absolute bottom-10">
        <CreateTripModal
          onTripCreated={handleRefetchTrips}
          stations={stations}
          buses={buses}
          drivers={drivers}
        />
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
