import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BusSeatLayout from "../../bus/components/BusSeatLayout";
import { generateStandardBusLayout } from "../../bus/components/busLayoutConfigs";
import { SeatType } from "@/features/seat/types/types";
import { AggregatedTripType } from "@/features/trips/types/types";
import { CashierType } from "@/features/cashier/types/types";
import { formatTime } from "@/lib/utils";
import {
  bus23Layout,
  bus29Layout,
} from "../../bus/components/customBusLayouts";

interface TicketPassengerFormProps {
  price: string;
  setPrice: (v: string) => void;
  selectedCashier: string;
  setSelectedCashier: (v: string) => void;
  selectedSeat: number | null;
  setSelectedSeat: (v: number | null) => void;
  selectedStanding: string | null;
  setSelectedStanding: (v: string | null) => void;
  trip: AggregatedTripType;
  seats: SeatType[];
  unavailableSeats: number[];
  cashiers: CashierType[];
  handleSeatSelect: (seatNumber: number) => void;
}

const TicketPassengerForm: React.FC<TicketPassengerFormProps> = ({
  price,
  setPrice,
  selectedCashier,
  setSelectedCashier,
  selectedSeat,
  setSelectedSeat,
  selectedStanding,
  setSelectedStanding,
  trip,
  seats,
  unavailableSeats,
  cashiers,
  handleSeatSelect,
}) => {
  // Utility to get seat by id or number
  const getSeat = (query: { id?: number; number?: number }) => {
    if (query.id !== undefined) {
      return seats.find(s => s.id === query.id) || null;
    }
    if (query.number !== undefined) {
      return (
        seats.find(
          s => parseInt(s.seat_number.replace(/\D/g, "")) === query.number
        ) || null
      );
    }
    return null;
  };

  // Editable default prices with cookie persistence
  const COOKIE_NAME = "defaultPrices";
  function getCookie(name: string) {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }
  function setCookie(name: string, value: string, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      "; expires=" +
      expires +
      "; path=/";
  }

  const getInitialPrices = () => {
    if (typeof window !== "undefined") {
      const cookie = getCookie(COOKIE_NAME);
      if (cookie) {
        try {
          const arr = JSON.parse(cookie);
          if (Array.isArray(arr) && arr.every(n => typeof n === "number")) {
            return arr;
          }
        } catch {}
      }
    }
    return [25, 50, 80];
  };

  const [defaultPrices, setDefaultPrices] =
    React.useState<number[]>(getInitialPrices());

  const [newPrice, setNewPrice] = React.useState<string>("");
  const [editMode, setEditMode] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCookie(COOKIE_NAME, JSON.stringify(defaultPrices));
    }
  }, [defaultPrices]);

  const handleAddPrice = () => {
    const priceNum = Number(newPrice);
    if (!isNaN(priceNum) && priceNum > 0 && !defaultPrices.includes(priceNum)) {
      setDefaultPrices([...defaultPrices, priceNum]);
      setNewPrice("");
    }
  };

  const handleEditPrice = (index: number, value: string) => {
    const priceNum = Number(value);
    if (!isNaN(priceNum) && priceNum > 0) {
      setDefaultPrices(
        defaultPrices.map((p, i) => (i === index ? priceNum : p))
      );
    }
  };

  const handleRemovePrice = (index: number) => {
    setDefaultPrices(defaultPrices.filter((_, i) => i !== index));
  };

  function handleBusLayout() {
    if (trip?.bus?.capacity === 29) {
      return bus29Layout;
    } else if (trip.bus.capacity === 23) {
      return bus23Layout;
    }

    return generateStandardBusLayout(trip?.bus?.capacity);
  }

  return (
    <div className="p-4 bg-white border rounded-sm">
      <div className="flex gap-3 mb-2">
        <div className="w-full">
          <label className="text-sm font-medium mb-1 block">Cashier</label>
          <Select value={selectedCashier} onValueChange={setSelectedCashier}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select cashier" />
            </SelectTrigger>
            <SelectContent>
              {cashiers.map(cashier => (
                <SelectItem key={cashier.id} value={cashier.id.toString()}>
                  {cashier.first_name} {cashier.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg p-3 transition-colors bg-white mb-4">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-4">
          {/* Trip Information */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Trip</p>
            <h3 className="text-sm font-medium truncate">
              {trip ? (
                `${trip.src_station?.name || "Unknown Station"} → ${trip.dest_station?.name || "Unknown Station"} | ${formatTime(trip.start_time)}`
              ) : (
                <span className="text-gray-400">Loading trip...</span>
              )}
            </h3>
          </div>

          {/* Seat Information */}
          <div className="flex-1 min-w-0 text-right">
            <p className="text-xs text-gray-500 mb-1">Assigned Seat</p>
            <div className="text-sm font-medium">
              {selectedSeat === null ? (
                <span className="text-gray-600">Standing</span>
              ) : (
                <span className="text-green-600">
                  Seat {getSeat({ id: selectedSeat })?.seat_number || ""}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="p-6 border rounded bg-gray-50">
            <div className="text-center text-xs font-medium mb-4 text-gray-600">
              AMOEC TRANSPORT
            </div>

            <div className="w-full flex flex-col justify-center items-center">
              {/* Bus seat layout */}
              <BusSeatLayout
                config={handleBusLayout()}
                selectedSeat={selectedSeat}
                unavailableSeats={unavailableSeats}
                onSeatSelect={handleSeatSelect}
                getSeat={getSeat}
              />
            </div>
          </div>

          {selectedSeat === null && (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-300/80 z-50 rounded-md pointer-events-none" />
          )}
        </div>

        <div className="text-center mt-2">
          <button
            onClick={() => {
              if (selectedSeat === null) {
                // Find the first available seat (not in unavailableSeats and status is 'available')
                const availableSeat = seats.find(
                  seat =>
                    seat.status === "available" &&
                    !unavailableSeats.includes(seat.id)
                );
                setSelectedSeat(availableSeat ? availableSeat.id : null);
              } else {
                setSelectedSeat(null);
              }
            }}
            className={`w-full border border-solid text-sm font-medium rounded-md p-1 ${
              selectedSeat === null
                ? "bg-[#71AC61] text-white border-gray-400"
                : "border-[#456A3B]"
            }`}
          >
            Standing
          </button>

          <div className="flex justify-center gap-2 mt-2">
            {["Student", "Senior", "PWD"].map(type => (
              <button
                key={type}
                onClick={() =>
                  setSelectedStanding(selectedStanding === type ? null : type)
                }
                className={`px-3 py-1 text-xs rounded border w-full ${
                  selectedStanding === type
                    ? "bg-[#71AC61] text-white border-green-500"
                    : "bg-white border-gray-300 hover:border-green-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium mb-2 block">Pricing</label>
        <div className="rounded-lg border bg-gray-50 p-4 mb-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center mb-2">
              <Input
                placeholder="Custom price"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-32 h-10 text-center border-gray-300"
              />
              <span className="text-xs text-gray-500">
                Enter or select a price
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {defaultPrices.map((amt, idx) => (
                <div key={amt} className="relative">
                  {editMode ? (
                    <div className="flex items-center gap-1 bg-white border rounded px-2 py-1 shadow-sm">
                      <Input
                        type="number"
                        value={amt}
                        onChange={e => handleEditPrice(idx, e.target.value)}
                        className="w-16 h-8 text-center border-gray-300"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleRemovePrice(idx)}
                        aria-label="Remove price"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 4L12 12M12 4L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant={price === String(amt) ? "default" : "outline"}
                      className={`h-8 px-4 rounded-full transition-all ${price === String(amt) ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-300 text-gray-700 hover:bg-green-50"}`}
                      onClick={() => setPrice(String(amt))}
                    >
                      <span className="font-semibold">₱{amt}</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2 mt-2 items-center">
                <Input
                  type="number"
                  placeholder="Add price"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="w-24 h-8 text-center border-gray-300"
                />
                <Button
                  variant="outline"
                  className="h-8 px-4"
                  onClick={handleAddPrice}
                  disabled={
                    !newPrice ||
                    isNaN(Number(newPrice)) ||
                    Number(newPrice) <= 0
                  }
                >
                  <span className="font-semibold">Add</span>
                </Button>
              </div>
            )}
            <div className="flex justify-end mt-2">
              <Button
                variant="secondary"
                className="text-xs px-3 py-1"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "Done" : "Edit Prices"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPassengerForm;
