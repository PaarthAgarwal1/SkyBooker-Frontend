import apiClient from './apiClient';
import { UserProfile } from './auth';

export interface AdminUser {
  userId: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'PASSENGER' | 'AIRLINE_STAFF';
  active: boolean;
  airlineId?: string;
  airlineName?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AdminStats {
  totalUsers: number;
  totalAirlines: number;
  totalAirports: number;
  totalBookings: number;
  totalRevenue: number;
  totalFlights: number;
}

export interface Airline {
  airlineId: string;
  airlineName: string;
  iataCode: string;
  country: string;
  logoUrl?: string;
  active: boolean;
}

export interface Airport {
  airportId: string;
  airportName: string;
  city: string;
  country: string;
  iataCode: string;
  icaoCode?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

export interface BookingDetails {
  bookingId: string;
  pnr: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  route: string;
  airline: string;
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

const handleApiError = (err: any, fallbackData: any) => {
  console.error('Admin API Error:', err);
  return {
    data: fallbackData,
    error: err.response?.data?.message || err.message || 'Unknown error',
    isFallback: true,
    status: err.response?.status
  };
};

export interface AdminApiResponse<T> {
  data: T;
  error: string | null;
  isFallback: boolean;
  status: number | null;
}

export const adminApi = {
  // User Management
  getAllUsers: async (): Promise<AdminApiResponse<AdminUser[]>> => {
    try {
      const res = await apiClient.get<AdminUser[]>('/auth/users');
      console.log("Users API Response:", res.data);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  deactivateUser: (userId: string) => apiClient.put(`/auth/admin/deactivate/${userId}`),
  activateUser: (userId: string) => apiClient.put(`/auth/admin/activate/${userId}`),
  deleteUser: (userId: string) => apiClient.delete(`/auth/admin/delete/${userId}`),

  // Airline Management
  getAllAirlines: async (): Promise<AdminApiResponse<Airline[]>> => {
    try {
      const res = await apiClient.get<Airline[]>('/airline');
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  createAirline: (data: Partial<Airline>) => apiClient.post<Airline>('/airline', data),
  updateAirline: (id: string, data: Partial<Airline>) => apiClient.put<Airline>(`/airline/${id}`, data),
  activateAirline: (id: string) => apiClient.put(`/airline/activate/${id}`),
  deactivateAirline: (id: string) => apiClient.put(`/airline/deactivate/${id}`),
  deleteAirline: (id: string) => apiClient.delete(`/airline/${id}`),

  // Airport Management
  getAllAirports: async (): Promise<AdminApiResponse<Airport[]>> => {
    try {
      const res = await apiClient.get<Airport[]>('/airport');

      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  searchAirports: async (query: string): Promise<AdminApiResponse<Airport[]>> => {
    try {
      const res = await apiClient.get<Airport[]>(`/airport/search?query=${query}`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  getAirportsByCity: async (city: string): Promise<AdminApiResponse<Airport[]>> => {
    try {
      const res = await apiClient.get<Airport[]>(`/airport/city/${city}`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  createAirport: (data: Partial<Airport>) => apiClient.post<Airport>('/airport', data),
  updateAirport: (id: string, data: Partial<Airport>) => apiClient.put<Airport>(`/airport/${id}`, data),
  deleteAirport: (id: string) => apiClient.delete(`/airport/${id}`),

  // Booking & Payment
  getAllBookings: async (): Promise<AdminApiResponse<any[]>> => {
    try {
      const res = await apiClient.get<any[]>('/bookings');
      console.log("booking response from api :", res.data);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  getBookingById: async (id: string): Promise<AdminApiResponse<BookingDetails | null>> => {
    try {
      const res = await apiClient.get<BookingDetails>(`/bookings/details/${id}`);
      console.log("booking response details from api :", res.data);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, null);
    }
  },

  getAllPayments: async (): Promise<AdminApiResponse<any[]>> => {
    try {
      const res = await apiClient.get<any[]>('/payments');
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  // Analytics
  getPlatformAnalytics: async (): Promise<AdminApiResponse<AdminStats>> => {
    const fallbackStats: AdminStats = {
      totalUsers: 0,
      totalBookings: 0,
      totalRevenue: 0,
      totalAirports: 0,
      totalAirlines: 0,
      totalFlights: 0
    };

    try {
      const res = await apiClient.get<AdminStats>('/analytics/platform');
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, fallbackStats);
    }
  },

  getRevenueReport: () => apiClient.get('/analytics/revenue'),

  // Payment Operations
  refundPayment: async (paymentId: string, refundAmount?: number): Promise<AdminApiResponse<any>> => {
    try {
      const res = await apiClient.post('/payments/refund', { paymentId, refundAmount });
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, null);
    }
  },

  downloadReceipt: (paymentId: string) =>
    apiClient.get(`/payments/receipt/${paymentId}`, { responseType: 'blob' }),

  // Booking Operations
  cancelBooking: (bookingId: string) =>
    apiClient.put(`/bookings/cancel/${bookingId}`),

  updateBookingStatus: (bookingId: string, status: string) =>
    apiClient.put(`/bookings/status/${bookingId}?status=${status}`),

  // Notifications
  sendNotification: (data: { subject: string; message: string; emails: string[] }) =>
    apiClient.post('/notifications/bulk', data),

  // Audit Logs
  getAuditLogs: () => apiClient.get('/audit-logs'),

  getAllNotifications: async (): Promise<AdminApiResponse<any[]>> => {
    try {
      const res = await apiClient.get<any[]>('/notifications');
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, []);
    }
  },

  retryNotification: (id: string) =>
    apiClient.post(`/notifications/retry/${id}`),

  // Airline Staff Management
  assignAirline: async (userId: string, airlineId: string): Promise<AdminApiResponse<any>> => {
    try {
      const res = await apiClient.put(`/auth/admin/assign-airline/${userId}?airlineId=${airlineId}`);
      return { data: res.data, error: null, isFallback: false, status: 200 };
    } catch (err: any) {
      return handleApiError(err, null);
    }
  },
};
