"use client";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useWebSocket } from "@/features/map/hooks";
import { AutoConnect } from "./index";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";
import useTripByIdQuery from "@/features/trips/hooks/useTripByIdQuery";

// TEMPORARY CONNECT TO AUTH AFTER INTEGRATION

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(
  () => import("@/features/map/components/MapComponent"),
  {
    ssr: false,
  }
);
export default function WebSocketWrapper({
  tripId,
  userName,
}: {
  tripId: string;
  userName: string;
}) {
  // Use TanStack Query to fetch trip data
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useTripByIdQuery(tripId);

  const {
    connected,
    connecting,
    locationUpdates,
    clientInfo,
    connect,
    disconnect,
    register,
    subscribe,
  } = useWebSocket();

  // Show error toast if trip fetch fails
  useEffect(() => {
    if (tripError) {
      toast.error("Failed to fetch trip info");
    }
  }, [tripError]);

  // Auto-subscribe to this trip's busId when trip is loaded
  useEffect(() => {
    if (trip?.bus?.id && userName) {
      subscribe(trip.bus.id.toString(), userName);
    }
    // Only run when trip or userName changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.bus?.id, userName]);

  // Center map on latest location if available, else fallback to Manila
  const latestLocation =
    locationUpdates.length > 0
      ? locationUpdates[locationUpdates.length - 1]
      : null;
  const mapCenter: [number, number] =
    latestLocation &&
    typeof latestLocation.latitude === "number" &&
    typeof latestLocation.longitude === "number"
      ? [latestLocation.latitude, latestLocation.longitude]
      : [14.5995, 120.9842];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster></Toaster>
      <div className="max-w-7xl mx-auto space-y-6">
        {tripLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading trip information...</div>
          </div>
        ) : !trip ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-500">Trip not found</div>
          </div>
        ) : (
          <>
            {/* Map Section */}
            <Card className="pb-0">
              <CardHeader>
                <CardTitle className="space-y-2">
                  <div className="flex justify-between">
                    <h1>{trip?.bus.plate_number} Location Map</h1>
                    <h1>
                      Driver: {trip?.driver.first_name} {trip?.driver.last_name}
                    </h1>
                  </div>
                  <h1>
                    Trip{" "}
                    {trip?.src_station
                      ? (trip.src_station.name ?? "Unknown Station")
                      : "Unknown Station"}{" "}
                    →{" "}
                    {trip?.dest_station
                      ? (trip.dest_station.name ?? "Unknown Station")
                      : "Unknown Station"}{" "}
                    {trip?.start_time ? formatTime(trip.start_time) : ""}
                  </h1>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <MapComponent
                  locations={locationUpdates}
                  center={mapCenter}
                  zoom={15}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Connection Status and Controls */}
              <div className="space-y-6">
                {/* Show connection status only */}
                <AutoConnect
                  connect={connect}
                  register={register}
                  disconnect={disconnect}
                  connected={connected}
                  connecting={connecting}
                  clientInfo={clientInfo}
                  busId={trip?.bus.id.toString() ?? "bus"}
                  subscribe={subscribe}
                  userId={userName}
                  plateNumber={trip?.bus.plate_number || "unknown"}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
