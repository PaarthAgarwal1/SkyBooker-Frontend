import apiClient from './apiClient';
import paymentClient from './paymentClient';
import { Flight, Seat } from './staff';

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchFlightsRequest {
  origin: string;
  destination: string;
  date?: string;         // One-way search uses 'date'
  departureDate?: string; // Round-trip uses 'departureDate'
  returnDate?: string;
  passengers: number;
}

// ─── Seat ────────────────────────────────────────────────────────────────────

export interface SeatInfo {
  seatId: string;
  seatNumber: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface PassengerDTO {
  title: string;           // "Mr." | "Mrs." | "Ms." | "Dr."
  firstName: string;
  lastName: string;
  gender: string;          // "MALE" | "FEMALE" | "OTHER"
  dateOfBirth: string;     // "YYYY-MM-DD"
  passportNumber: string;
  nationality: string;     // e.g. "INDIAN"
  seatId: string;
  seatNumber: string;
  passengerType: string;   // "ADULT" | "CHILD" | "INFANT"
  passportExpiry: string;  // "YYYY-MM-DD"
}

export interface BookingRequest {
  idempotencyKey: string;  // unique per attempt, prevents double booking
  userId: string;
  flightId: string;
  tripType: string;        // "ONE_WAY" | "ROUND_TRIP"
  contactEmail: string;
  contactPhone: string;
  seatIds: string[];
  passengers: PassengerDTO[];
  mealPreference: string;  // "VEG" | "NON_VEG" | "VEGAN" | "JAIN"
  luggageKg: number;
}

export interface BookingResponse {
  id: string;           // booking UUID
  pnr: string;          // e.g. "KHWTE3"
  passenger: string[];  // ["John Doe", "Jane Doe"]
  route: string;        // "BOM → BLR"
  amount: number;
  status: string;       // "PAYMENT_PENDING" | "CONFIRMED" | "CANCELLED" | ...
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentInitiateRequest {
  bookingId: string;
  userId: string;
  username: string;
  contactEmail: string;
  amount: number;
  paymentMode: string;   // "CARD" | "UPI" | "NET_BANKING"
  flightId: string;
  route: string;
  cabinClass: string;
  airlineId: string;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  bookingId: string;
  clientSecret: string;  // Stripe Payment Intent client secret
  amount: number;
  status: string;        // "PENDING"
  transactionId: string | null;
  username: string | null;
}

// ─── My Bookings ─────────────────────────────────────────────────────────────

export interface MyBookingSummary {
  id: string;
  pnr: string;
  passenger: string[];
  route: string;
  amount: number;
  status: string;
  departureTime?: string;
}

export interface BookingDetailResponse {
  bookingId: string;
  pnr: string;
  status: string;
  route: string;
  airline: string;
  flightId: string;
  departureTime: string;
  arrivalTime: string;
  passengers: {
    name: string;
    gender: string;
    seatNumber: string;
    passportNumber: string;
  }[];
  totalFare: number;
  baseFare: number;
  taxes: number;
  mealPreference: string;
  luggageKg: number;
  contactEmail: string;
  contactPhone: string;
  bookedAt: string;
}

// ─── Airlines ─────────────────────────────────────────────────────────────────

export interface Airline {
  airlineId: string;
  airlineName: string;
  iataCode: string;
  country: string;
  logoUrl: string;
  active: boolean;
}

// ─── API Methods ───────────────────────────────────────────────────────────────

export const passengerApi = {
  // ── Flights ──────────────────────────────────────────────────────────────
  searchFlights: (params: SearchFlightsRequest) => {
    const { passengers, departureDate, returnDate, ...rest } = params;
    return apiClient.get<Flight[]>('/flights/search', { params: { ...rest } });
  },

  searchRoundTrip: (params: SearchFlightsRequest) => {
    const { passengers, date, ...rest } = params;
    return apiClient.get<Flight[]>('/flights/round-trip', { params: { ...rest } });
  },

  getFlightDetails: (flightId: string) =>
    apiClient.get<Flight>(`/flights/${flightId}`),

  // ── Seats ─────────────────────────────────────────────────────────────────
  getSeatMap: (flightId: string) =>
    apiClient.get<Seat[]>(`/seats/flight/${flightId}`),

  // ── Booking ───────────────────────────────────────────────────────────────
  createBooking: (data: BookingRequest) => {
    return apiClient.post<BookingResponse>('/bookings/create', data)
  },

  confirmBooking: (bookingId: string, paymentId: string) =>
    apiClient.post<BookingResponse>(`/bookings/confirm/${bookingId}`, { paymentId }),

  getBookingStatus: (bookingId: string) =>
    apiClient.get<BookingResponse>(`/bookings/status/${bookingId}`),

  getMyBookings: (userId: string) =>
    apiClient.get<MyBookingSummary[]>(`/bookings/user/${userId}`),

  getBookingDetails: (id: string) =>
    apiClient.get<BookingDetailResponse>(`/bookings/details/${id}`),

  cancelBooking: (bookingId: string) =>
    apiClient.put(`/bookings/cancel/${bookingId}`),

  webCheckin: (bookingId: string, seatNumbers: string[]) =>
    apiClient.put(`/bookings/checkin/${bookingId}`, { seatNumbers }),

  // ── Payment (port 8088 via dedicated paymentClient) ──────────────────────
  initiatePayment: (data: PaymentInitiateRequest) =>
    paymentClient.post<PaymentInitiateResponse>('/payments/initiate', data),

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications: () =>
    apiClient.get<any[]>('/notifications/my'),

  // ── Airlines ──────────────────────────────────────────────────────────────
  getAirlines: () =>
    apiClient.get<Airline[]>('/airline'),

  getFlightsByAirline: (airlineId: string) =>
    apiClient.get<Flight[]>(`/flights/airline/${airlineId}`),
};
