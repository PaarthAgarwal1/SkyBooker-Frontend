import apiClient from './apiClient';

/* ================================
   TYPES
================================ */

export interface Flight {
  flightId: string;
  flightNumber: string;
  airlineId: string;
  airlineName: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'BOARDING';
  aircraftType: string;
  availableSeats: number;
  basePrice: number;
}

export interface CreateFlightRequest {
  flightNumber: string;
  airlineId: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string; // send as-is (IMPORTANT)
  arrivalTime: string;
  aircraftType: string;
  basePrice: number;
}

export interface Seat {
  seatId: string;
  seatNumber: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST_CLASS';
  status: 'AVAILABLE' | 'HELD' | 'CONFIRMED' | 'BLOCKED';
  rowNumber: number;
  columnNumber: number;
  priceMultiplier: number;
}

export interface StaffStats {
  totalFlights: number;
  flightsToday: number;
  availableSeats: number;
  delayedFlights: number;
}

export type WeatherCondition = 'RAIN' | 'STORM' | 'CLEAR' | 'FOG' | 'WIND';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  city?: string;
  weatherCondition?: WeatherCondition;
  createdAt: string;
}

export interface RouteRevenue {
  route: string;
  revenue: number;
}

export interface CabinDistribution {
  economy: number;
  business: number;
  firstClass: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface RevenueAnalyticsResponse {
  totalRevenue: number;
  growthPercentage: number;
  routeRevenue: RouteRevenue[];
  cabinDistribution: CabinDistribution;
  revenueTrends: RevenueTrend[];
}

export interface Passenger {
  seatNumber: string;
  name: string;
  passportNumber: string;
  gender: string;
}

export interface Booking {
  id: string;             // backend field name: 'id'
  pnr: string;
  route: string;
  amount: number;
  status: string;
  seatIds?: string[];
  // Optional enriched fields
  flightId?: string;
  departureTime?: string;
  arrivalTime?: string;
  // Normalized fields used by various components
  bookingId?: string;     // alias for id
  passenger?: string[];   // original field (names)
  passengers?: any[];     // flexible field for strings or passenger objects
  totalFare?: number;     // alias for amount
  bookedAt?: string;      // timestamp
}

export interface PassengerResponse {
  passengerId: string;
  bookingId: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  passportNumber: string;
  nationality: string;
  passportExpiry: string;
  seatId: string;
  seatNumber: string;
  ticketNumber: string;
  passengerType: string;
  createdAt: string;
}

export interface StaffApiResponse<T> {
  data: T;
  error: string | null;
  isFallback: boolean;
  status: number | null;
}

/* ================================
   ERROR HANDLER
================================ */

const handleApiError = (err: any, fallbackData: any): StaffApiResponse<any> => {
  console.error('Staff API Error:', err);

  return {
    data: fallbackData,
    error: err.response?.data?.message || err.message || 'Unknown error',
    isFallback: true,
    status: err.response?.status || 500,
  };
};

/* ================================
   HELPER
================================ */

// ✅ DO NOT convert to UTC (fixes "departure must be future")
const toLocalDateTime = (date: string) => date;

/* ================================
   STAFF API
================================ */

export const staffApi = {
  /* ================================
     FLIGHTS
  ================================= */

  getAllFlights: async (
    airlineId: string
  ): Promise<StaffApiResponse<Flight[]>> => {
    try {
      const res = await apiClient.get(`/flights/airline/${airlineId}`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  getFlightById: (id: string) =>
    apiClient.get<Flight>(`/flights/${id}`),

  createFlight: (data: CreateFlightRequest) => {
    const payload = {
      ...data,
      departureTime: toLocalDateTime(data.departureTime),
      arrivalTime: toLocalDateTime(data.arrivalTime),
    };

    return apiClient.post('/flights', payload);
  },

  updateFlight: (id: string, data: Partial<CreateFlightRequest>) => {
    const payload = {
      ...data,
      departureTime: data.departureTime
        ? toLocalDateTime(data.departureTime)
        : undefined,
      arrivalTime: data.arrivalTime
        ? toLocalDateTime(data.arrivalTime)
        : undefined,
    };

    return apiClient.put(`/flights/${id}`, payload);
  },

  deleteFlight: (id: string) =>
    apiClient.delete(`/flights/${id}`),

  // ✅ status handled separately (IMPORTANT)
  updateFlightStatus: (
    id: string,
    status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'BOARDING'
  ) =>
    apiClient.put(`/flights/status/${id}`, null, {
      params: { status },
    }),

  /* ================================
     BOOKINGS
  ================================= */

  getAllBookings: async (): Promise<StaffApiResponse<Booking[]>> => {
    try {
      const res = await apiClient.get(`/bookings`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  getBookingsByFlight: async (flightId: string): Promise<StaffApiResponse<Booking[]>> => {
    try {
      const res = await apiClient.get(`/bookings/flight/${flightId}`);
      console.log("booking data for staff  ", res.data);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  getManifest: async (flightId: string): Promise<StaffApiResponse<Passenger[]>> => {
    try {
      const res = await apiClient.get(`/manifest/flight/${flightId}`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  getPassengersByFlight: async (flightId: string): Promise<StaffApiResponse<PassengerResponse[]>> => {
    try {
      const res = await apiClient.get(`/passengers/flight/${flightId}`);
      console.log("passengers detail ", res.data);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  /* ================================
     SEATS
  ================================= */

  getSeatMap: async (
    flightId: string
  ): Promise<StaffApiResponse<Seat[]>> => {
    try {
      const res = await apiClient.get(`/seats/flight/${flightId}`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  getSeatCount: async (
    flightId: string
  ): Promise<StaffApiResponse<number>> => {
    try {
      const res = await apiClient.get(`/seats/count/${flightId}`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, 0);
    }
  },

  addSeats: (flightId: string, seatData: any) =>
    apiClient.post(`/seats/add/${flightId}`, seatData),

  holdSeat: (seatId: string) =>
    apiClient.put(`/seats/hold/${seatId}`),

  confirmSeat: (seatId: string) =>
    apiClient.put(`/seats/confirm/${seatId}`),

  releaseSeat: (seatId: string) =>
    apiClient.put(`/seats/release/${seatId}`),

  /* ================================
     DASHBOARD
  ================================= */

  getDashboardStats: async (
    airlineId: string
  ): Promise<StaffApiResponse<StaffStats>> => {
    try {
      const res = await apiClient.get(`/flights/airline/${airlineId}`);

      const totalFlights = res.data.length;

      const today = new Date().toISOString().split('T')[0];
      const flightsToday = res.data.filter((f: Flight) =>
        f.departureTime.startsWith(today)
      ).length;

      const availableSeats = res.data.reduce(
        (sum: number, f: Flight) => sum + (f.availableSeats || 0),
        0
      );

      const delayedFlights = res.data.filter((f: Flight) =>
        f.status === 'DELAYED'
      ).length;

      return {
        data: { totalFlights, flightsToday, availableSeats, delayedFlights },
        error: null,
        isFallback: false,
        status: 200,
      };
    } catch (err: any) {
      return handleApiError(err, { totalFlights: 0, availableSeats: 0 });
    }
  },

  sendAlert: async (flightId: string, message: string): Promise<StaffApiResponse<any>> => {
    try {
      const res = await apiClient.post('/notifications/alert', { flightId, message });
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, null);
    }
  },

  /* ================================
     REVENUE ANALYTICS
  ================================= */

  getRevenueAnalytics: async (airlineId: string, range: string = 'monthly'): Promise<StaffApiResponse<RevenueAnalyticsResponse>> => {
    try {
      const res = await apiClient.get(`/payments/analytics/${airlineId}`, {
        params: { range }
      });
      console.log("revenue data  ", res.data);
      const normalizedData: RevenueAnalyticsResponse = {
        totalRevenue: res.data.totalRevenue || 0,
        growthPercentage: res.data.growthPercentage || 0,
        routeRevenue: res.data.routeRevenue || [],
        cabinDistribution: res.data.cabinDistribution || { economy: 0, business: 0, firstClass: 0 },
        revenueTrends: res.data.revenueTrends || []
      };
      console.log("Revenue Analytics Data (Normalized):", normalizedData);
      return { data: normalizedData, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      const fallbackData: RevenueAnalyticsResponse = {
        totalRevenue: 0,
        growthPercentage: 0,
        routeRevenue: [],
        cabinDistribution: { economy: 0, business: 0, firstClass: 0 },
        revenueTrends: []
      };
      return handleApiError(err, fallbackData);
    }
  },

  getAlerts: async (airlineId: string): Promise<StaffApiResponse<Alert[]>> => {
    try {
      const res = await apiClient.get(`/notifications/alerts/airline/${airlineId}`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      const fallbackAlerts: Alert[] = [
        {
          id: '1',
          title: 'Weather Alert: NYC/JFK',
          message: 'Heavy snowfall expected. Possible delays for SB-102.',
          severity: 'WARNING',
          createdAt: new Date().toISOString()
        }
      ];
      return handleApiError(err, fallbackAlerts);
    }
  },
};