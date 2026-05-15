import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Domain Types ──────────────────────────────────────────────────────────

export interface SelectedFlight {
  flightId: string;
  flightNumber: string;
  airlineId: string;
  airlineName: string | null;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  aircraftType: string;
  availableSeats: number;
  basePrice: number;
  status: string;
}

export interface SelectedSeat {
  seatId: string;
  seatNumber: string;
  seatClass: string;
  priceMultiplier: number;
  rowNumber: number;
  columnNumber: number;
}

export interface BookingResponse {
  id: string;         // bookingId (UUID)
  pnr: string;
  passenger: string[]; // ["John Doe", "Jane Doe"]
  route: string;       // "BOM → BLR"
  amount: number;
  status: string;      // "PAYMENT_PENDING" | "CONFIRMED" | ...
}

export interface PaymentResponse {
  paymentId: string;
  bookingId: string;
  clientSecret: string;
  amount: number;
  status: string;
  transactionId: string | null;
  username: string | null;
}

// ─── Store Shape ────────────────────────────────────────────────────────────

interface BookingState {
  selectedFlight: SelectedFlight | null;
  selectedSeats: SelectedSeat[];
  bookingResponse: BookingResponse | null;
  paymentResponse: PaymentResponse | null;

  // Contact & passenger info (persisted so Checkout can read it)
  contactEmail: string;
  contactPhone: string;
  mealPreference: string;
  luggageKg: number;
  searchPassengerCount: number;

  // Actions
  setSelectedFlight: (flight: SelectedFlight) => void;
  setSelectedSeats: (seats: SelectedSeat[]) => void;
  setBookingResponse: (booking: BookingResponse) => void;
  setPaymentResponse: (payment: PaymentResponse) => void;
  setContactInfo: (email: string, phone: string) => void;
  setPreferences: (meal: string, luggage: number) => void;
  setSearchPassengerCount: (count: number) => void;
  resetBooking: () => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      selectedFlight: null,
      selectedSeats: [],
      bookingResponse: null,
      paymentResponse: null,
      contactEmail: '',
      contactPhone: '',
      mealPreference: 'VEG',
      luggageKg: 20,
      searchPassengerCount: 1,

      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeats: (seats) => set({ selectedSeats: seats }),
      setBookingResponse: (booking) => set({ bookingResponse: booking }),
      setPaymentResponse: (payment) => set({ paymentResponse: payment }),
      setContactInfo: (email, phone) => set({ contactEmail: email, contactPhone: phone }),
      setPreferences: (meal, luggage) => set({ mealPreference: meal, luggageKg: luggage }),
      setSearchPassengerCount: (count) => set({ searchPassengerCount: count }),

      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedSeats: [],
          bookingResponse: null,
          paymentResponse: null,
          contactEmail: '',
          contactPhone: '',
          mealPreference: 'VEG',
          luggageKg: 20,
          searchPassengerCount: 1,
        }),
    }),
    {
      name: 'skybooker-booking-v2',
      storage: createJSONStorage(() => sessionStorage), // session-scoped, cleared on browser close
    }
  )
);
