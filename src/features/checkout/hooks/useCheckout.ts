import { useState, useCallback } from 'react';
import { checkoutApi, CreateBookingRequest } from '../services/checkoutApi';
import { toast } from 'react-hot-toast';

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const startCheckout = useCallback(async (
    bookingData: CreateBookingRequest, 
    amount: number, 
    email: string,
    username: string,
    flightId: string,
    route: string,
    cabinClass: string,
    airlineId: string
  ) => {
    setLoading(true);
    try {
      // 1. Create Booking
      const bookingResponse = await checkoutApi.createBooking(bookingData);
      const newBookingId = bookingResponse.bookingId;
      setBookingId(newBookingId);

      // 2. Initiate Payment
      const paymentResponse = await checkoutApi.initiatePayment({
        bookingId: newBookingId,
        userId: bookingData.userId,
        username,
        contactEmail: email,
        amount,
        paymentMode: 'CARD',
        flightId,
        route,
        cabinClass,
        airlineId
      });

      setClientSecret(paymentResponse.clientSecret);
    } catch (error: any) {
      console.error('Checkout initialization failed:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    bookingId,
    clientSecret,
    startCheckout
  };
};
