import { prisma } from "@/lib/prisma";
import { AggregatedTripType } from "../types/types";

/**
 * Gets all trips
 * Fields Are Aggregated
 */
export async function getAllTrips() {
  const trips = await prisma.trip.findMany({
    include: {
      bus: {
        include: {
          station: true,
        },
      },
      driver: true,
      station_trip_dest_station_idTostation: true,
      station_trip_src_station_idTostation: true,
    },
  });
  const mappedTrips: AggregatedTripType[] = trips.map(trip => {
    // Send UTC times to frontend - let frontend handle Manila conversion
    return {
      id: trip.id,
      start_time: trip.start_time,
      end_time: trip.end_time,
      status: trip.status,
      dest_station: trip.station_trip_dest_station_idTostation,
      src_station: trip.station_trip_src_station_idTostation,
      bus: trip.bus,
      driver: trip.driver,
    };
  });
  return mappedTrips;
}
/**
 * Gets a specific trip by ID
 */
export async function getTrip(id: number) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      bus: {
        include: {
          station: true,
        },
      },
      driver: true,
      station_trip_dest_station_idTostation: true,
      station_trip_src_station_idTostation: true,
    },
  });

  if (!trip) {
    return null;
  }
  // Send UTC times to frontend - let frontend handle Manila conversion
  const mappedTrips: AggregatedTripType = {
    id: trip.id,
    start_time: trip.start_time,
    end_time: trip.end_time,
    status: trip.status,
    dest_station: trip.station_trip_dest_station_idTostation,
    src_station: trip.station_trip_src_station_idTostation,
    bus: trip.bus,
    driver: trip.driver,
  };
  return mappedTrips;
}

/**
 * Adds a new trip
 */
export async function addTrip(
  start_time: string,
  end_time: string,
  bus_id: number,
  src_station: number,
  dest_station: number,
  driver_id: number
) {
  // Store UTC times in database (frontend sends UTC via .toISOString())
  const newStart = new Date(start_time);
  const newEnd = new Date(end_time);

  // Validate that the dates are valid
  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    throw new Error(
      "Invalid date format. Please provide valid ISO date strings."
    );
  }

  // Validate that end time is after start time
  if (newEnd <= newStart) {
    throw new Error("End time must be after start time.");
  }

  // Validate that source and destination stations are different
  if (src_station === dest_station) {
    throw new Error("Source and destination stations cannot be the same.");
  }

  const result = await prisma.$transaction(async tx => {
    // Check for overlapping trips with same driver or bus, that aren't completed
    const overlappingTrips = await tx.trip.findFirst({
      where: {
        NOT: { status: "complete" },
        OR: [{ driver_id }, { bus_id }],
      },
    });

    if (overlappingTrips) {
      // Determine which resource is conflicting
      const isDriverConflict = overlappingTrips.driver_id === driver_id;
      const isBusConflict = overlappingTrips.bus_id === bus_id;

      let conflictMessage = "Cannot create trip: ";
      if (isDriverConflict && isBusConflict) {
        conflictMessage += `both Driver ${driver_id} and Bus ${bus_id} are already assigned to a non-complete trip (Trip ID: ${overlappingTrips.id}).`;
      } else if (isDriverConflict) {
        conflictMessage += `Driver ${driver_id} is already assigned to a non-complete trip (Trip ID: ${overlappingTrips.id}).`;
      } else {
        conflictMessage += `Bus ${bus_id} is already assigned to a non-complete trip (Trip ID: ${overlappingTrips.id}).`;
      }

      throw new Error(conflictMessage);
    }

    // Create the trip
    const created = await tx.trip.create({
      data: {
        start_time: newStart,
        end_time: newEnd,
        bus: { connect: { id: bus_id } },
        driver: { connect: { id: driver_id } },
        station_trip_dest_station_idTostation: {
          connect: { id: dest_station },
        },
        station_trip_src_station_idTostation: {
          connect: { id: src_station },
        },
      },
    });

    return created;
  });

  return result;
}

/**
 * Deletes a trip by ID
 */
export async function deleteTrip(id: number) {
  const deleted = await prisma.trip.delete({
    where: { id },
  });

  return deleted;
}

export const getTripsForDay = async (date: Date) => {
  // Convert Manila date to UTC range for database query
  // Use UTC methods to avoid server timezone issues
  const manilaOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

  // Create Manila day boundaries using UTC methods to avoid server timezone
  // Use UTC methods since the input date might be created with Date.UTC()
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Create Manila midnight and end of day in UTC
  const manilaStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const manilaEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  // Convert Manila time to UTC for database query
  const utcStart = new Date(manilaStart.getTime() - manilaOffset);
  const utcEnd = new Date(manilaEnd.getTime() - manilaOffset);

  const trips = await prisma.trip.findMany({
    where: {
      start_time: {
        gte: utcStart,
        lt: utcEnd,
      },
    },
    include: {
      bus: {
        include: {
          station: true,
        },
      },
      driver: true,
      station_trip_dest_station_idTostation: true,
      station_trip_src_station_idTostation: true,
    },
  });

  const mappedTrips: AggregatedTripType[] = trips.map(trip => {
    // Send UTC times to frontend - let frontend handle Manila conversion
    return {
      id: trip.id,
      start_time: trip.start_time,
      end_time: trip.end_time,
      status: trip.status,
      dest_station: trip.station_trip_dest_station_idTostation,
      src_station: trip.station_trip_src_station_idTostation,
      bus: trip.bus,
      driver: trip.driver,
    };
  });
  return mappedTrips;
};

export const getTripsForMonth = async (month: number, year: number) => {
  // Convert Manila month range to UTC for database query using UTC methods
  const manilaOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

  // Create Manila month boundaries using UTC to avoid server timezone issues
  const manilaStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const manilaEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  // Convert to UTC for database query
  const start = new Date(manilaStart.getTime() - manilaOffset);
  const end = new Date(manilaEnd.getTime() - manilaOffset);

  const trips = await prisma.trip.findMany({
    where: {
      start_time: {
        gte: start,
        lt: end,
      },
    },
    include: {
      bus: {
        include: {
          station: true,
        },
      },
      driver: true,
      station_trip_dest_station_idTostation: true,
      station_trip_src_station_idTostation: true,
    },
  });

  const mappedTrips: AggregatedTripType[] = trips.map(trip => {
    // Send UTC times to frontend - let frontend handle Manila conversion
    return {
      id: trip.id,
      start_time: trip.start_time,
      end_time: trip.end_time,
      status: trip.status,
      dest_station: trip.station_trip_dest_station_idTostation,
      src_station: trip.station_trip_src_station_idTostation,
      bus: trip.bus,
      driver: trip.driver,
    };
  });
  return mappedTrips;
};

export async function editTrip(
  id: number,
  start_time?: string,
  end_time?: string,
  bus_id?: number,
  src_station_id?: number,
  dest_station_id?: number,
  driver_id?: number,
  status?: string | null
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};

  const existingTrip = await prisma.trip.findUnique({
    where: { id },
    select: {
      start_time: true,
      end_time: true,
      status: true,
      driver_id: true,
      bus_id: true,
      src_station_id: true,
      dest_station_id: true,
    },
  });

  if (!existingTrip) {
    throw new Error(`Trip with id ${id} not found`);
  }

  // Ensure we have proper Date objects
  const existingStartTime = new Date(existingTrip.start_time!);
  const existingEndTime = new Date(existingTrip.end_time!);

  const newStart = start_time ? new Date(start_time) : existingStartTime;
  const newEnd = end_time ? new Date(end_time) : existingEndTime;

  if (newEnd <= newStart) {
    throw new Error("End time must be after start time.");
  }

  // Validate that source and destination stations are different
  const finalSrcStation = src_station_id ?? existingTrip.src_station_id;
  const finalDestStation = dest_station_id ?? existingTrip.dest_station_id;

  if (finalSrcStation === finalDestStation) {
    throw new Error("Source and destination stations cannot be the same.");
  }

  if (start_time !== undefined) updateData.start_time = newStart;
  if (end_time !== undefined) updateData.end_time = newEnd;
  if (bus_id !== undefined) updateData.bus = { connect: { id: bus_id } };
  if (driver_id !== undefined)
    updateData.driver = { connect: { id: driver_id } };
  if (src_station_id !== undefined) {
    updateData.station_trip_src_station_idTostation = {
      connect: { id: src_station_id },
    };
  }
  if (dest_station_id !== undefined) {
    updateData.station_trip_dest_station_idTostation = {
      connect: { id: dest_station_id },
    };
  }
  if (status !== undefined) updateData.status = status;

  const finalStatus = status ?? existingTrip.status;
  const isBecomingActive = finalStatus !== "complete";
  const driverToCheck = driver_id ?? existingTrip.driver_id;
  const busToCheck = bus_id ?? existingTrip.bus_id;

  let updated;

  if (isBecomingActive) {
    // Only run this block if trip is active or being reactivated
    updated = await prisma.$transaction(async tx => {
      // Check for overlapping trips if:
      // 1. Driver or bus is being changed
      // 2. Trip is changing from complete to non-complete status
      // 3. Trip is already non-complete and we're changing driver/bus
      const shouldCheckConflicts =
        driver_id !== undefined ||
        bus_id !== undefined ||
        (existingTrip.status === "complete" && finalStatus !== "complete");

      if (shouldCheckConflicts) {
        // Check for driver conflicts ONLY if driver is being changed
        if (driver_id !== undefined) {
          const driverConflict = await tx.trip.findFirst({
            where: {
              id: { not: id },
              NOT: { status: "complete" },
              driver_id: driverToCheck,
            },
          });

          if (driverConflict) {
            throw new Error(
              `Conflict: Driver ${driverToCheck} is already assigned to a non-complete trip (Trip ID: ${driverConflict.id}).`
            );
          }
        }

        // Check for bus conflicts ONLY if bus is being changed
        if (bus_id !== undefined) {
          const busConflict = await tx.trip.findFirst({
            where: {
              id: { not: id },
              NOT: { status: "complete" },
              bus_id: busToCheck,
            },
          });

          if (busConflict) {
            throw new Error(
              `Conflict: Bus ${busToCheck} is already assigned to a non-complete trip (Trip ID: ${busConflict.id}).`
            );
          }
        }

        // ONLY check for reactivation conflicts when actually reactivating
        // AND ONLY when driver/bus are NOT being changed (since those are checked above)
        if (
          existingTrip.status === "complete" &&
          finalStatus !== "complete" &&
          driver_id === undefined &&
          bus_id === undefined
        ) {
          const reactivationConflict = await tx.trip.findFirst({
            where: {
              id: { not: id },
              NOT: { status: "complete" },
              OR: [{ driver_id: driverToCheck }, { bus_id: busToCheck }],
            },
          });

          if (reactivationConflict) {
            // Determine which resource is conflicting for reactivation
            const isDriverConflict =
              reactivationConflict.driver_id === driverToCheck;
            const isBusConflict = reactivationConflict.bus_id === busToCheck;

            let conflictMessage = "Cannot reactivate trip: ";
            if (isDriverConflict && isBusConflict) {
              conflictMessage += `both Driver ${driverToCheck} and Bus ${busToCheck} are already assigned to a non-complete trip (Trip ID: ${reactivationConflict.id}).`;
            } else if (isDriverConflict) {
              conflictMessage += `Driver ${driverToCheck} is already assigned to a non-complete trip (Trip ID: ${reactivationConflict.id}).`;
            } else {
              conflictMessage += `Bus ${busToCheck} is already assigned to a non-complete trip (Trip ID: ${reactivationConflict.id}).`;
            }

            throw new Error(conflictMessage);
          }
        }
      }

      const updatedTrip = await tx.trip.update({
        where: { id },
        data: updateData,
        include: {
          bus: true,
          driver: true,
          station_trip_src_station_idTostation: true,
          station_trip_dest_station_idTostation: true,
        },
      });

      return updatedTrip;
    });
  } else {
    // Just update normally
    updated = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        bus: true,
        driver: true,
        station_trip_src_station_idTostation: true,
        station_trip_dest_station_idTostation: true,
      },
    });
  }

  // Handle seat status changes based on trip status
  if (status !== undefined && updated.bus?.id) {
    if (status === "complete") {
      // Free up all seats on the bus when trip is completed
      await prisma.seat.updateMany({
        where: { bus_id: updated.bus.id },
        data: { status: "available" },
      });
    } else if (
      existingTrip.status === "complete" &&
      (status === "transit" || status === "boarding")
    ) {
      // Re-occupy seats that have active tickets when trip is reactivated
      await prisma.seat.updateMany({
        where: {
          bus_id: updated.bus.id,
          ticket: {
            some: {
              trip_id: updated.id,
              ticket_type: "passenger",
            },
          },
        },
        data: { status: "occupied" },
      });
    }
  }

  return updated;
}
