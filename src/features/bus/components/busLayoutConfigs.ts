import { BusSeatLayoutConfig, SeatPosition } from "./BusSeatLayout";

/**
 * Generate a standard bus layout with driver area (front-left empty)
 * @param capacity Total bus capacity
 * @returns BusSeatLayoutConfig
 */
export function generateStandardBusLayout(
  capacity: number
): BusSeatLayoutConfig {
  const backRowSeats = Math.min(5, capacity);
  const mainSeats = capacity - backRowSeats;

  // Calculate rows needed for main seating
  // Each row has 4 seats (2 left + 2 right), but first row only has 2 (right side)
  // So: 2 seats in first row, then 4 seats per additional row
  const seatsAfterFirstRow = Math.max(0, mainSeats - 2);
  const additionalRows = Math.ceil(seatsAfterFirstRow / 4);
  const mainRows = 1 + additionalRows; // 1 for first row + additional rows
  const totalRows = mainRows + (backRowSeats > 0 ? 1 : 0);

  const seatPositions: SeatPosition[] = [];
  let currentSeatNumber = 1;

  // Generate main seating area
  for (let row = 0; row < mainRows; row++) {
    // Left side (columns 0-1)
    if (row === 0) {
      // First row: driver area (empty) on left side
      seatPositions.push({ seatNumber: null, row, column: 0 });
      seatPositions.push({ seatNumber: null, row, column: 1 });
    } else {
      // Other rows: normal seating on left side
      if (currentSeatNumber <= capacity - backRowSeats) {
        seatPositions.push({ seatNumber: currentSeatNumber++, row, column: 0 });
      } else {
        seatPositions.push({ seatNumber: null, row, column: 0 });
      }
      if (currentSeatNumber <= capacity - backRowSeats) {
        seatPositions.push({ seatNumber: currentSeatNumber++, row, column: 1 });
      } else {
        seatPositions.push({ seatNumber: null, row, column: 1 });
      }
    }

    // Aisle (column 2) - handled by aisleColumns

    // Right side (columns 3-4)
    if (currentSeatNumber <= capacity - backRowSeats) {
      seatPositions.push({ seatNumber: currentSeatNumber++, row, column: 3 });
    } else {
      seatPositions.push({ seatNumber: null, row, column: 3 });
    }
    if (currentSeatNumber <= capacity - backRowSeats) {
      seatPositions.push({ seatNumber: currentSeatNumber++, row, column: 4 });
    } else {
      seatPositions.push({ seatNumber: null, row, column: 4 });
    }
  }

  // Generate back row if needed (immediately after the last main row)
  if (backRowSeats > 0) {
    const backRow = mainRows;

    for (let i = 0; i < 5; i++) {
      if (i < backRowSeats) {
        seatPositions.push({
          seatNumber: currentSeatNumber++,
          row: backRow,
          column: i,
        });
      } else {
        seatPositions.push({ seatNumber: null, row: backRow, column: i });
      }
    }
  }

  return {
    rows: totalRows,
    columns: 5, // [left1, left2, aisle, right1, right2]
    seatPositions,
    aisleColumns: [2], // Middle column is the aisle
  };
}

/**
 * Generate a custom bus layout
 * @param rows Number of rows
 * @param columns Number of columns
 * @param seatArrangement Array of seat numbers (null for empty spaces)
 * @param aisleColumns Column indices that are aisles
 * @returns BusSeatLayoutConfig
 */
export function generateCustomBusLayout(
  rows: number,
  columns: number,
  seatArrangement: (number | null)[][],
  aisleColumns: number[] = []
): BusSeatLayoutConfig {
  const seatPositions: SeatPosition[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const seatNumber = seatArrangement[row]?.[col] ?? null;
      seatPositions.push({ seatNumber, row, column: col });
    }
  }

  return {
    rows,
    columns,
    seatPositions,
    aisleColumns,
  };
}

/**
 * Example preset layouts
 */
export const presetLayouts = {
  // 30-seat standard bus
  standard30: (): BusSeatLayoutConfig => generateStandardBusLayout(30),

  // 20-seat mini bus
  mini20: (): BusSeatLayoutConfig => generateStandardBusLayout(20),

  // Custom example: 15-seat van
  van15: (): BusSeatLayoutConfig =>
    generateCustomBusLayout(
      4, // 4 rows
      4, // 4 columns [left1, left2, right1, right2]
      [
        [null, null, 1, 2], // Row 0: driver area + front right
        [3, 4, 5, 6], // Row 1: regular seating
        [7, 8, 9, 10], // Row 2: regular seating
        [11, 12, 13, 14], // Row 3: back row (missing seat 15)
      ],
      [] // No aisle in van
    ),
};
