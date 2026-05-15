import apiClient from '@shared/api/apiClient';
import paymentClient from '@shared/api/paymentClient';

// ─── Request types (kept for backwards compat with useCheckout hook) ───────

export interface CreateBookingRequest {
  idempotencyKey: string;
  flightId: string;
  userId: string;
  passengers: any[];
  seatIds: string[];
  contactEmail: string;
  contactPhone: string;
  tripType?: string;
  mealPreference?: string;
  luggageKg?: number;
}

export interface InitiatePaymentRequest {
  bookingId: string;
  userId: string;
  username: string;
  contactEmail: string;
  amount: number;
  paymentMode: string;
  flightId: string;
  route: string;
  cabinClass: string;
  airlineId: string;
}

// ─── API ───────────────────────────────────────────────────────────────────

export const checkoutApi = {
  /** POST /bookings/create — via API Gateway (port 8083) */
  createBooking: async (data: CreateBookingRequest) => {
    const response = await apiClient.post('/bookings/create', data);
    return response.data;
  },

  /** POST /payments/initiate — via Payment Service (port 8088) */
  initiatePayment: async (data: InitiatePaymentRequest) => {
    console.log('Initiating payment with payload:', data);
    
    const response = await paymentClient.post('/payments/initiate', {
      ...data,
      paymentMode: data.paymentMode || 'CARD',
    });
    
    return response.data;
  },

  /** GET /bookings/status/{bookingId} — polls booking status */
  getBookingStatus: async (bookingId: string) => {
    const response = await apiClient.get(`/bookings/status/${bookingId}`);
    return response.data; // { id, pnr, status, ... }
  },

  /** GET /payments/status/{paymentId} — polls payment status from Payment Service */
  getPaymentStatus: async (paymentId: string) => {
    const response = await paymentClient.get(`/payments/status/${paymentId}`);
    return response.data; // { status: "PAID" | "PENDING" | "FAILED" }
  },

  /** POST /bookings/confirm/{bookingId} — confirms booking after payment success */
  confirmBooking: async (bookingId: string, paymentId: string) => {
    const response = await apiClient.post(`/bookings/confirm/${bookingId}`, { paymentId });
    return response.data; // { pnr, status: "CONFIRMED", ... }
  },
};
