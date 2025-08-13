import React from "react";
import SeatButton from "../../ticket/components/SeatButton";

export interface SeatPosition {
  seatNumber: number | null; // null for empty spaces
  row: number;
  column: number;
}

export interface BusSeatLayoutConfig {
  rows: number;
  columns: number;
  seatPositions: SeatPosition[];
  aisleColumns?: number[]; // Column indices that represent aisles
}

interface BusSeatLayoutProps {
  config: BusSeatLayoutConfig;
  selectedSeat: number | null;
  unavailableSeats: number[];
  onSeatSelect: (seatNumber: number) => void;
  getSeat: (query: { number?: number }) => { id: number } | null;
}

const BusSeatLayout: React.FC<BusSeatLayoutProps> = ({
  config,
  selectedSeat,
  unavailableSeats,
  onSeatSelect,
  getSeat,
}) => {
  const { rows, columns, seatPositions, aisleColumns = [] } = config;

  // Create a grid matrix
  const seatGrid: (SeatPosition | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(null));

  // Populate the grid with seat positions
  seatPositions.forEach(position => {
    if (position.row < rows && position.column < columns) {
      seatGrid[position.row][position.column] = position;
    }
  });

  const renderCell = (
    position: SeatPosition | null,
    rowIndex: number,
    colIndex: number
  ) => {
    // If there's a seat in this position, render it (even if it's in an aisle column)
    if (position && position.seatNumber !== null) {
      const seat = getSeat({ number: position.seatNumber });
      const isUnavailable = seat ? unavailableSeats.includes(seat.id) : false;

      return (
        <SeatButton
          key={`seat-${position.seatNumber}`}
          seatNumber={position.seatNumber}
          isSelected={selectedSeat === (seat && seat.id)}
          isUnavailable={isUnavailable}
          onSeatSelect={() =>
            !isUnavailable && onSeatSelect(position.seatNumber!)
          }
        />
      );
    }

    // Check if this column is an aisle (only if there's no seat)
    if (aisleColumns.includes(colIndex)) {
      return (
        <div
          key={`aisle-${rowIndex}-${colIndex}`}
          className="w-8 flex items-center justify-center"
        >
          <div className="w-full h-1 bg-gray-300 rounded"></div>
        </div>
      );
    }

    // Empty space
    return (
      <div key={`empty-${rowIndex}-${colIndex}`} className="w-12 h-12"></div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Front indicator */}
      <div className="text-xs text-gray-500 mb-2">← Front of Bus</div>

      {/* Seat grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {seatGrid.map((row, rowIndex) =>
          row.map((position, colIndex) =>
            renderCell(position, rowIndex, colIndex)
          )
        )}
      </div>

      {/* Back indicator */}
      <div className="text-xs text-gray-500 mt-2">Back of Bus →</div>
    </div>
  );
};

export default BusSeatLayout;
