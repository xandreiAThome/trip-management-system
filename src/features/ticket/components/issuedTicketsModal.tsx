import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import PassengerCard from "@features/ticket/components/passengerCard";
import BaggageCard from "@features/ticket/components/baggageCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AggregatedTicketType } from "../types/types";
import { useState } from "react";
import usePassengerTicketsQuery from "../hooks/usePassengerTicketsQuery";
import useBaggageTicketsQuery from "../hooks/useBaggageTicketsQuery";
import useCashiersQuery from "@/features/cashier/hooks/useCashiersQuery";

interface IssuedTicketsModalProps {
  tripId?: number; // Added tripId pro
}

export default function IssuedTicketsModal({
  tripId,
}: IssuedTicketsModalProps) {
  const [open, setOpen] = useState(false);

  // TanStack Query hooks
  const { data: passengerTickets = [], isLoading: isPassengerLoading } =
    usePassengerTicketsQuery(tripId);
  const { data: baggageTickets = [], isLoading: isBaggageLoading } =
    useBaggageTicketsQuery(tripId);
  const { data: cashiers = [], isLoading: isCashiersLoading } =
    useCashiersQuery();

  const isLoading = isPassengerLoading || isBaggageLoading || isCashiersLoading;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Issued Tickets</Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-4xl">
        <DrawerHeader className="border-b border-gray-300">
          <DrawerTitle className="font-extrabold text-[#456A3B]">
            Issued Tickets
          </DrawerTitle>
        </DrawerHeader>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <span className="text-lg text-gray-500">Loading tickets...</span>
          </div>
        ) : (
          <Tabs defaultValue="passenger" className="flex">
            <TabsList className="grid w-full grid-cols-2 pb-2 pt-5 p-0 -mb-2.5 ">
              <TabsTrigger
                value="passenger"
                className="border rounded-none font-bold text-md text-[#7B7575] data-[state=active]:text-[#456A3B] data-[state=active]:rounded-tr-lg data-[state=active]:rounded-l-none"
              >
                Passenger
              </TabsTrigger>
              <TabsTrigger
                value="baggage"
                className="border rounded-none font-bold text-md text-[#7B7575] data-[state=active]:text-[#456A3B] data-[state=active]:rounded-r-none data-[state=active]:rounded-tl-lg"
              >
                Baggage
              </TabsTrigger>
            </TabsList>
            <div className="p-4 bg-white">
              <TabsContent
                value="passenger"
                className="max-h-[60vh] min-h-[60vh] overflow-auto "
              >
                {passengerTickets.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                    No tickets
                  </div>
                ) : (
                  <div className="flex flex-col gap-y-4">
                    {passengerTickets.map((pass: AggregatedTicketType) => (
                      <PassengerCard
                        key={pass.id}
                        ticket={pass}
                        cashiers={cashiers}
                        onSuccess={() => {}}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent
                value="baggage"
                className="max-h-[60vh] min-h-[60vh] overflow-auto "
              >
                {baggageTickets.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                    No tickets
                  </div>
                ) : (
                  <div className="flex flex-col gap-y-4">
                    {baggageTickets.map((bag: AggregatedTicketType) => (
                      <BaggageCard
                        key={bag.id}
                        ticket={bag}
                        cashiers={cashiers}
                        onSuccess={() => {}}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DrawerContent>
    </Drawer>
  );
}
