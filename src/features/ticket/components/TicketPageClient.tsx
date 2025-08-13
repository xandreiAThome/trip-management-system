"use client";
import { useState, useMemo } from "react";
import { toast, Toaster } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TicketPassengerForm from "@/features/ticket/components/TicketPassengerForm";
import TicketBaggageForm from "@/features/ticket/components/TicketBaggageForm";
import { SeatType } from "@/features/seat/types/types";
import { Card } from "@/components/ui/card";
import { Session } from "next-auth";
import useCashiersQuery from "@/features/cashier/hooks/useCashiersQuery";
import useTripByIdQuery from "@/features/trips/hooks/useTripByIdQuery";
import useBusSeatsQuery from "@/features/seat/hooks/useBusSeatsQuery";
import useCreateTicketMutation from "@/features/ticket/hooks/useCreateTicketMutation";
import useUpdateSeatStatusMutation from "@/features/seat/hooks/useUpdateSeatStatusMutation";

interface TicketPageClientProps {
  tripId: string;
  session: Session | null;
}

export default function TicketPageClient({
  tripId,
  session,
}: TicketPageClientProps) {
  const [price, setPrice] = useState("");
  const [selectedType, setSelectedType] = useState("passenger");
  const [selectedCashier, setSelectedCashier] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedStanding, setSelectedStanding] = useState<string | null>(null);
  const [senderNo, setSenderNo] = useState("");
  const [dispatcherNo, setDispatcherNo] = useState("");
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [item, setItem] = useState("");

  // TanStack Query hooks
  const { data: cashiers = [], isLoading: loadingCashiers } =
    useCashiersQuery();
  const { data: trip, isLoading: loadingTrip } = useTripByIdQuery(tripId);
  const { data: seats = [], isLoading: loadingSeats } = useBusSeatsQuery(
    trip?.bus?.id
  );

  // Mutations
  const createTicketMutation = useCreateTicketMutation();
  const updateSeatStatusMutation = useUpdateSeatStatusMutation();

  // Computed values
  const unavailableSeats = useMemo(() => {
    return seats
      .filter((seat: SeatType) => seat.status === "occupied")
      .map((seat: SeatType) => seat.id);
  }, [seats]);

  const isLoading = loadingTrip || loadingSeats || loadingCashiers;
  const isSubmitting =
    createTicketMutation.isPending || updateSeatStatusMutation.isPending;

  // Auto-select current user if they are a cashier
  useMemo(() => {
    if (
      session?.user?.role === "cashier" &&
      session.user?.user_id &&
      cashiers.length > 0 &&
      !selectedCashier
    ) {
      const currentCashier = cashiers.find(
        cashier => cashier.user_id === session.user?.user_id
      );
      if (currentCashier) {
        setSelectedCashier(currentCashier.id.toString());
      }
    }
  }, [cashiers, session, selectedCashier]);

  const leftSeats = Array.from({ length: 12 }, (_, i) => i + 1);
  const rightSeats = Array.from({ length: 12 }, (_, i) => i + 13);
  const backSeats = Array.from({ length: 5 }, (_, i) => i + 25);

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

  const handleSeatSelect = (seatNumber: number) => {
    const seat = getSeat({ number: seatNumber });
    if (seat) setSelectedSeat(seat.id);
  };

  const handleBaggageSubmit = async () => {
    if (!trip) return;

    const payload = {
      price,
      trip_id: trip.id,
      cashier_id: Number(selectedCashier),
      ticket_type: "baggage" as const,
      sender_no: senderNo,
      dispatcher_no: dispatcherNo,
      sender_name: senderName,
      receiver_name: receiverName,
      item,
    };

    try {
      await createTicketMutation.mutateAsync(payload);

      // Clear baggage form fields
      setPrice("");
      setSenderNo("");
      setDispatcherNo("");
      setSenderName("");
      setReceiverName("");
      setItem("");

      toast.success("Baggage Ticket successfully created");
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating baggage ticket"
      );
    }
  };

  const handlePassengerSubmit = async () => {
    if (!trip) return;

    const seatNumber =
      getSeat({ id: selectedSeat ?? undefined })?.seat_number || null;

    const payload = {
      price,
      trip_id: trip.id,
      cashier_id: Number(selectedCashier),
      ticket_type: "passenger" as const,
      passenger_name: "_",
      seat_id: selectedSeat,
      seat_number: seatNumber,
    };

    try {
      await createTicketMutation.mutateAsync(payload);

      // Update seat status if a seat was selected
      if (selectedSeat !== null && seatNumber && trip.bus?.id) {
        await updateSeatStatusMutation.mutateAsync({
          seatId: selectedSeat,
          status: "occupied",
          busId: trip.bus.id,
        });
      }

      setSelectedSeat(null);
      toast.success("Passenger Ticket successfully created");
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating ticket"
      );
    }
  };

  if (isLoading)
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
  if (!trip)
    return (
      <div className="min-h-screen bg-[#71AC61] flex items-center justify-center">
        Trip not found
      </div>
    );

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <Toaster richColors position="top-center" />
      <h1 className="text-2xl font-semibold text-center mt-5 text-[#FFFFFF]">
        Issue Tickets
      </h1>
      <Tabs
        value={selectedType}
        onValueChange={setSelectedType}
        className="mt-2 w-full max-w-4xl"
      >
        <TabsList className="grid w-full grid-cols-2 pb-2 p-0 -my-1.5 bg-[#71AC61] -mb-5.5 mt-4">
          <TabsTrigger
            value="passenger"
            className="bg-white text-green-700 font-semibold data-[state=active]:bg-green-500 data-[state=active]:text-white border rounded-b-none pb-4"
          >
            Passenger
          </TabsTrigger>
          <TabsTrigger
            value="baggage"
            className="bg-white text-green-700 font-semibold data-[state=active]:bg-green-500 data-[state=active]:text-white border rounded-b-none pb-4"
          >
            Baggage
          </TabsTrigger>
        </TabsList>
        <TabsContent value="passenger" className="space-y-4 mt-4 max-w-4xl">
          <TicketPassengerForm
            price={price}
            setPrice={setPrice}
            selectedCashier={selectedCashier}
            setSelectedCashier={setSelectedCashier}
            selectedSeat={selectedSeat}
            setSelectedSeat={setSelectedSeat}
            selectedStanding={selectedStanding}
            setSelectedStanding={setSelectedStanding}
            trip={trip}
            seats={seats}
            unavailableSeats={unavailableSeats}
            leftSeats={leftSeats}
            rightSeats={rightSeats}
            backSeats={backSeats}
            handleSeatSelect={handleSeatSelect}
            cashiers={cashiers}
          />
        </TabsContent>
        <TabsContent value="baggage" className="space-y-4 mt-4">
          <TicketBaggageForm
            price={price}
            setPrice={setPrice}
            selectedCashier={selectedCashier}
            setSelectedCashier={setSelectedCashier}
            senderNo={senderNo}
            setSenderNo={setSenderNo}
            dispatcherNo={dispatcherNo}
            setDispatcherNo={setDispatcherNo}
            senderName={senderName}
            setSenderName={setSenderName}
            receiverName={receiverName}
            setReceiverName={setReceiverName}
            item={item}
            setItem={setItem}
            cashiers={cashiers}
          />
        </TabsContent>
      </Tabs>
      <Button
        className="max-w-4xl w-full mt-6 bg-green-800 font-bold cursor-pointer hover:bg-green-600 text-xl text-white"
        onClick={() => {
          if (selectedType === "baggage") {
            handleBaggageSubmit();
          } else {
            handlePassengerSubmit();
          }
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create Ticket"}
      </Button>
    </div>
  );
}
