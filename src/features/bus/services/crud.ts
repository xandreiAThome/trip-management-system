import { prisma } from "@/lib/prisma";

/**
 * Get all buses from the database.
 */
export async function getAllBuses() {
  const buses = await prisma.bus.findMany({
    include: {
      station: true,
    },
  });
  return buses;
}

/**
 * Get a specific bus by ID.
 * @param id - Bus ID
 */
export async function getBusById(id: number) {
  const bus = await prisma.bus.findUnique({
    where: { id: id },
  });
  return bus;
}

/**
 * Create a new bus and populate its seats based on capacity.
 * @param plate_number - Plate number
 * @param station_id - Station ID
 * @param capacity - Seating capacity
 */
export async function addBus(
  plate_number: string,
  station_id: number,
  capacity: number
) {
  const result = await prisma.$transaction(async tx => {
    // Create bus
    const bus = await tx.bus.create({
      data: {
        plate_number,
        station_id,
        capacity,
      },
    });

    // Prepare seat data
    const seatsData = [];
    for (let i = 1; i <= capacity; i++) {
      seatsData.push({
        seat_number: `S${i.toString().padStart(2, "0")}`,
        bus_id: bus.id,
      });
    }

    // Bulk create seats
    const seats = await tx.seat.createMany({
      data: seatsData,
    });

    // seats.count is the number of rows created
    if (seats.count !== capacity) {
      throw new Error("Failed to create all seats");
    }

    return { busId: bus.id, seatsCreated: seats.count, seats: seatsData };
  });
  return {
    bus_id: result.busId,
    seats_created: result.seatsCreated,
    seats: result.seats,
  };
}

/**
 * Update an existing bus.
 * @param id - Bus ID
 * @param plate_number - Plate number
 * @param station_id - Station ID
 * @param capacity - Seating capacity
 */
export async function editBus(
  id: number,
  fields: { plate_number?: string; station_id?: number; capacity?: number }
) {
  const data: Record<string, any> = {};
  if (fields.plate_number !== undefined)
    data.plate_number = fields.plate_number;
  if (fields.station_id !== undefined) data.station_id = fields.station_id;
  if (fields.capacity !== undefined) data.capacity = fields.capacity;

  const updatedBus = await prisma.$transaction(async tx => {
    const seatCount = await tx.seat.count({
      where: { bus_id: id },
    });
    if (data.capacity < seatCount) {
      throw new Error(
        `Cannot reduce capacity to ${data.capacity} since bus with id: ${id} has ${seatCount} seats`
      );
    }
    return await tx.bus.update({
      where: { id },
      data: data,
    });
  });

  return updatedBus;
}

/**
 * Delete a bus and its associated seats by ID.
 * @param id - Bus ID
 */
export async function deleteBus(id: number) {
  const result = await prisma.$transaction(async prismaTx => {
    const deletedSeats = await prisma.seat.deleteMany({
      where: { bus_id: id },
    });

    const deletedBus = await prisma.bus.deleteMany({
      where: { id: id },
    });

    return { bus: deletedBus, seats: deletedSeats };
  });

  return result;
}
