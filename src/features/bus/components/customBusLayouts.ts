// Example of how to create custom bus layouts

import { BusSeatLayoutConfig } from "./BusSeatLayout";

// Example 1: 15-seat van layout
export const van15Layout: BusSeatLayoutConfig = {
  rows: 4,
  columns: 4,
  seatPositions: [
    // Row 0 (Front): Driver space + 2 passenger seats
    { seatNumber: null, row: 0, column: 0 }, // Driver area
    { seatNumber: null, row: 0, column: 1 }, // Driver area
    { seatNumber: 1, row: 0, column: 2 }, // Front right seats
    { seatNumber: 2, row: 0, column: 3 },

    // Row 1: Regular seating
    { seatNumber: 3, row: 1, column: 0 },
    { seatNumber: 4, row: 1, column: 1 },
    { seatNumber: 5, row: 1, column: 2 },
    { seatNumber: 6, row: 1, column: 3 },

    // Row 2: Regular seating
    { seatNumber: 7, row: 2, column: 0 },
    { seatNumber: 8, row: 2, column: 1 },
    { seatNumber: 9, row: 2, column: 2 },
    { seatNumber: 10, row: 2, column: 3 },

    // Row 3: Back row (only 3 seats)
    { seatNumber: 11, row: 3, column: 0 },
    { seatNumber: 12, row: 3, column: 1 },
    { seatNumber: 13, row: 3, column: 2 },
    { seatNumber: null, row: 3, column: 3 }, // Empty space
  ],
  aisleColumns: [], // No aisle in van
};

// Example 2: 29-seat bus with center aisle
export const bus29Layout: BusSeatLayoutConfig = {
  rows: 9,
  columns: 5, // [left1, left2, aisle, right1, right2]
  seatPositions: [
    // Row 0: Driver + front right
    { seatNumber: null, row: 0, column: 0 }, // Driver
    { seatNumber: null, row: 0, column: 1 }, // Driver area
    // column 2 is aisle
    { seatNumber: 1, row: 0, column: 3 },
    { seatNumber: 2, row: 0, column: 4 },

    // Rows 1-4: Regular 2+2 seating
    { seatNumber: null, row: 1, column: 0 },
    { seatNumber: null, row: 1, column: 1 },
    { seatNumber: 3, row: 1, column: 3 },
    { seatNumber: 4, row: 1, column: 4 },

    { seatNumber: 5, row: 2, column: 0 },
    { seatNumber: 6, row: 2, column: 1 },
    { seatNumber: null, row: 2, column: 3 },
    { seatNumber: null, row: 2, column: 4 },

    { seatNumber: 7, row: 3, column: 0 },
    { seatNumber: 8, row: 3, column: 1 },
    { seatNumber: null, row: 3, column: 3 },
    { seatNumber: null, row: 3, column: 4 },

    { seatNumber: 9, row: 4, column: 0 },
    { seatNumber: 10, row: 4, column: 1 },
    { seatNumber: 11, row: 4, column: 3 },
    { seatNumber: 12, row: 4, column: 4 },

    { seatNumber: 13, row: 5, column: 0 },
    { seatNumber: 14, row: 5, column: 1 },
    { seatNumber: 15, row: 5, column: 3 },
    { seatNumber: 16, row: 5, column: 4 },

    { seatNumber: 17, row: 6, column: 0 },
    { seatNumber: 18, row: 6, column: 1 },
    { seatNumber: 19, row: 6, column: 3 },
    { seatNumber: 20, row: 6, column: 4 },

    { seatNumber: 21, row: 7, column: 0 },
    { seatNumber: 22, row: 7, column: 1 },
    { seatNumber: 23, row: 7, column: 3 },
    { seatNumber: 24, row: 7, column: 4 },

    // Row 5: Back row (5 seats across)
    { seatNumber: 25, row: 8, column: 0 },
    { seatNumber: 26, row: 8, column: 1 },
    { seatNumber: 27, row: 8, column: 2 }, // Aisle becomes seat in back row
    { seatNumber: 28, row: 8, column: 3 },
    { seatNumber: 29, row: 8, column: 4 },
  ],
  aisleColumns: [2], // Column 2 is the aisle (except in back row)
};

export const bus23Layout: BusSeatLayoutConfig = {
  rows: 8,
  columns: 5, // [left1, left2, aisle, right1, right2]
  seatPositions: [
    // Row 0: Driver + front right
    { seatNumber: null, row: 0, column: 0 }, // Driver
    { seatNumber: null, row: 0, column: 1 }, // Driver area
    // column 2 is aisle
    { seatNumber: 1, row: 0, column: 3 },
    { seatNumber: 2, row: 0, column: 4 },

    // Rows 1-4: Regular 2+2 seating
    { seatNumber: 4, row: 1, column: 0 },
    { seatNumber: 5, row: 1, column: 1 },
    { seatNumber: null, row: 1, column: 3 },
    { seatNumber: 3, row: 1, column: 4 },

    { seatNumber: 6, row: 2, column: 0 },
    { seatNumber: 7, row: 2, column: 1 },
    { seatNumber: null, row: 2, column: 3 },
    { seatNumber: null, row: 2, column: 4 },

    { seatNumber: 8, row: 3, column: 0 },
    { seatNumber: 9, row: 3, column: 1 },
    { seatNumber: null, row: 3, column: 3 },
    { seatNumber: 10, row: 3, column: 4 },

    { seatNumber: 11, row: 4, column: 0 },
    { seatNumber: 12, row: 4, column: 1 },
    { seatNumber: null, row: 4, column: 3 },
    { seatNumber: 13, row: 4, column: 4 },

    { seatNumber: 14, row: 5, column: 0 },
    { seatNumber: 15, row: 5, column: 1 },
    { seatNumber: null, row: 5, column: 3 },
    { seatNumber: 16, row: 5, column: 4 },

    { seatNumber: 17, row: 6, column: 0 },
    { seatNumber: 18, row: 6, column: 1 },
    { seatNumber: null, row: 6, column: 3 },
    { seatNumber: 19, row: 6, column: 4 },

    // Row 5: Back row (5 seats across)
    { seatNumber: 20, row: 7, column: 0 },
    { seatNumber: 21, row: 7, column: 1 },
    { seatNumber: null, row: 7, column: 2 }, // Aisle becomes seat in back row
    { seatNumber: 22, row: 7, column: 3 },
    { seatNumber: 23, row: 7, column: 4 },
  ],
  aisleColumns: [2], // Column 2 is the aisle (except in back row)
};

// Example 3: 40-seat coach bus
export const coach40Layout: BusSeatLayoutConfig = {
  rows: 9,
  columns: 5,
  seatPositions: [
    // Row 0: Driver area
    { seatNumber: null, row: 0, column: 0 },
    { seatNumber: null, row: 0, column: 1 },
    { seatNumber: 1, row: 0, column: 3 },
    { seatNumber: 2, row: 0, column: 4 },

    // Rows 1-7: Regular 2+2 seating (28 seats)
    ...Array.from({ length: 7 }, (_, rowIndex) => {
      const row = rowIndex + 1;
      const startSeat = 3 + rowIndex * 4;
      return [
        { seatNumber: startSeat, row, column: 0 },
        { seatNumber: startSeat + 1, row, column: 1 },
        { seatNumber: startSeat + 2, row, column: 3 },
        { seatNumber: startSeat + 3, row, column: 4 },
      ];
    }).flat(),

    // Row 8: Back row (5 seats)
    { seatNumber: 31, row: 8, column: 0 },
    { seatNumber: 32, row: 8, column: 1 },
    { seatNumber: 33, row: 8, column: 2 },
    { seatNumber: 34, row: 8, column: 3 },
    { seatNumber: 35, row: 8, column: 4 },
  ],
  aisleColumns: [2],
};

/* 
To use these custom layouts in your component:

// In TicketPassengerForm.tsx
import { van15Layout, bus25Layout, coach40Layout } from "./customBusLayouts";

// Then use in the component:
<BusSeatLayout
  config={van15Layout} // or bus25Layout, coach40Layout
  selectedSeat={selectedSeat}
  unavailableSeats={unavailableSeats}
  onSeatSelect={handleSeatSelect}
  getSeat={getSeat}
/>

// Or dynamically choose based on bus capacity:
const getLayoutConfig = (capacity: number) => {
  if (capacity <= 15) return van15Layout;
  if (capacity <= 25) return bus25Layout;
  if (capacity <= 40) return coach40Layout;
  return generateStandardBusLayout(capacity); // fallback to generated layout
};

<BusSeatLayout
  config={getLayoutConfig(trip?.bus?.capacity || 30)}
  // ... other props
/>
*/
