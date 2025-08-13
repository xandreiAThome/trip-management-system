import { CashierType } from "@/features/cashier/types/types";

interface BaggageTicketType {
  id: number;
  sender_no: string;
  dispatcher_no: string;
  sender_name: string;
  receiver_name: string;
  item: string;
}

interface PassengerTicketType {
  id: number;
  passenger_name: string | null;
  discount: "student" | "pwd" | "senior" | null;
  ticket_id: number;
}

interface SeatType {
  id: number;
  seat_number: string;
  bus_id: number;
  status: "available" | "occupied";
}

interface TicketType {
  id: number;
  price: number;
  trip_id: number;
  cashier_id: number;
  ticket_type: "passenger" | "baggage";
  seat_id: number | null;
  created_at: Date;
}

interface AggregatedTicketType {
  id: number;
  price: number;
  trip_id: number;
  ticket_type: "passenger" | "baggage";
  seat_id: number | null;
  created_at: Date;
  passenger_ticket: PassengerTicketType;
  baggage_ticket: BaggageTicketType;
  cashier: CashierType;
  seat: SeatType | null;
}

export type {
  PassengerTicketType,
  BaggageTicketType,
  TicketType,
  AggregatedTicketType,
  SeatType,
};
