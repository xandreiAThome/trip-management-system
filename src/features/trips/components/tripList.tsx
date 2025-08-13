"use client";
import React from "react";
// import TripCard from "./tripCard";
import { useQuery } from "@tanstack/react-query";

function useAllTripsQuery() {
  return useQuery({
    queryKey: ["all-trips"],
    queryFn: async () => {
      const response = await fetch("/api/trip");

      if (!response.ok) {
        throw new Error(response.statusText || "Failed to fetch trips");
      }

      const data = await response.json();
      console.log(data);

      // Handle the API response structure
      return data.data || [];
    },
  });
}

function TripsList() {
  const { data: trips = [], isLoading, error } = useAllTripsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 w-full bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Failed to load trips: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (trips.length === 0) {
    return <div className="text-center py-8 text-gray-500">No trips found</div>;
  }

  return (
    <div className="flex flex-col overflow-y-auto gap-y-4">
      {/* {trips.map(trip => (
        <TripCard key={trip.id} {...trip} />
      ))} */}
    </div>
  );
}

export default TripsList;
