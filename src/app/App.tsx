import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@features/auth/components/LoginForm';
import { RegisterForm } from '@features/auth/components/RegisterForm';
import OAuthSuccess from '@features/auth/components/OAuthSuccess';
import ProtectedRoute from '@components/ProtectedRoute';
import PublicRoute from '@components/PublicRoute';
import RoleRedirect from '@components/RoleRedirect';
import { Toaster } from 'react-hot-toast';

// Admin Imports
import AdminLayout from '@components/admin/AdminLayout';
import AdminDashboard from '@pages/admin/AdminDashboard';
import UsersPage from '@pages/admin/UsersPage';
import AirlinesPage from '@pages/admin/AirlinesPage';
import AirportsPage from '@pages/admin/AirportsPage';
import NotificationsPage from '@pages/admin/NotificationsPage';
import BookingsPage from '@pages/admin/BookingsPage';
import BookingDetailsPage from '@pages/admin/BookingDetailsPage';
import PaymentsPage from '@pages/admin/PaymentsPage';
import AirlineStaffPage from '@pages/admin/AirlineStaffPage';
import AdminProfile from '@pages/admin/AdminProfile';

// Staff Imports
import StaffLayout from '@pages/staff/StaffLayout';
import StaffDashboard from '@pages/staff/StaffDashboard';
import FlightList from '@pages/staff/FlightList';
import FlightForm from '@pages/staff/FlightForm';
import FlightBookings from '@pages/staff/FlightBookings';
import FlightManifest from '@pages/staff/FlightManifest';
import FlightSeats from '@pages/staff/FlightSeats';
import RevenueAnalytics from '@pages/staff/RevenueAnalytics';
import AlertSystem from '@pages/staff/AlertSystem';
import AddSeatsPage from '@pages/staff/AddSeatsPage';
import StaffProfile from '@pages/staff/StaffProfile';

// User (Passenger) Imports
import PassengerLayout from '@pages/user/PassengerLayout';
import Home from '@pages/user/Home';
import SearchResults from '@pages/user/SearchResults';
import SeatSelection from '@pages/user/SeatSelection';
import PassengerForm from '@pages/user/PassengerForm';
import Checkout from '@pages/user/Checkout';
import Confirmation from '@pages/user/Confirmation';
import MyBookings from '@pages/user/MyBookings';
import Profile from '@pages/user/Profile';
import BookingDetail from '@pages/user/BookingDetail';

import Settings from '@pages/user/Settings';
import UnauthorizedPage from '@pages/UnauthorizedPage';
import PaymentPage from '@pages/user/PaymentPage';
import FlightDetails from '@pages/user/FlightDetails';
import TermsPage from '@pages/legal/TermsPage';
import PrivacyPage from '@pages/legal/PrivacyPage';
import CookiePage from '@pages/legal/CookiePage';
import RefundPage from '@pages/legal/RefundPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      <Routes>
        {/* 1. PUBLIC ROUTES (Login/Register) - Guarded against logged-in users */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
        </Route>

        {/* 2. PASSENGER & SHARED PUBLIC ROUTES - Guarded against Admin/Staff */}
        <Route element={<RoleRedirect><PassengerLayout /></RoleRedirect>}>
          {/* Publicly accessible but only for Passengers/Guests */}
          <Route path="/" element={<Home />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/flight/:id" element={<FlightDetails />} />
          <Route path="/flight-details/:flightId" element={<SeatSelection />} />
          
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />
          <Route path="/legal/cookies" element={<CookiePage />} />
          <Route path="/legal/refund" element={<RefundPage />} />

          {/* Protected Passenger Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PASSENGER']} />}>
            <Route path="/seat-selection/:flightId" element={<SeatSelection />} />
            <Route path="/passenger-details" element={<PassengerForm />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/booking-success" element={<Confirmation />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/booking/:id" element={<BookingDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 3. STAFF WORKSPACE - Locked to AIRLINE_STAFF */}
        <Route element={<ProtectedRoute allowedRoles={['AIRLINE_STAFF']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/flights" element={<FlightList />} />
            <Route path="/staff/flights/add" element={<FlightForm />} />
            <Route path="/staff/flights/edit/:id" element={<FlightForm />} />
            <Route path="/staff/flights/:flightId/add-seats" element={<AddSeatsPage />} />
            <Route path="/staff/bookings" element={<FlightBookings />} />
            <Route path="/staff/bookings/:flightId" element={<FlightBookings />} />
            <Route path="/staff/manifest" element={<FlightManifest />} />
            <Route path="/staff/manifest/:flightId" element={<FlightManifest />} />
            <Route path="/staff/seats" element={<FlightSeats />} />
            <Route path="/staff/seats/:flightId" element={<FlightSeats />} />
            <Route path="/staff/revenue" element={<RevenueAnalytics />} />
            <Route path="/staff/alerts" element={<AlertSystem />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
          </Route>
        </Route>

        {/* 4. ADMIN WORKSPACE - Locked to ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/airline-staff" element={<AirlineStaffPage />} />
            <Route path="/admin/airlines" element={<AirlinesPage />} />
            <Route path="/admin/airports" element={<AirportsPage />} />
            <Route path="/admin/bookings" element={<BookingsPage />} />
            <Route path="/admin/bookings/:id" element={<BookingDetailsPage />} />
            <Route path="/admin/payments" element={<PaymentsPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* UTILITY ROUTES */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* SECURE FALLBACK: Redirect based on role if logged in, else login */}
        <Route path="*" element={<RoleRedirect><Navigate to="/login" replace /></RoleRedirect>} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;
