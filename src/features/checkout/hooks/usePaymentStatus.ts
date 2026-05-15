import { useState, useEffect, useRef } from 'react';
import { checkoutApi } from '../services/checkoutApi';

type BookingStatus = 'PENDING' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

/**
 * Polls the booking status every 3 seconds until it reaches a terminal state.
 * Used by the Confirmation page to handle async payment confirmations.
 */
export const usePaymentStatus = (bookingId: string | null) => {
  const [status, setStatus] = useState<BookingStatus>('PAYMENT_PENDING');
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TERMINAL_STATES: BookingStatus[] = ['CONFIRMED', 'FAILED', 'EXPIRED', 'CANCELLED'];

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  };

  const checkStatus = async () => {
    if (!bookingId) return;
    try {
      const data = await checkoutApi.getBookingStatus(bookingId);
      // data is the raw BookingResponse object from the API
      const currentStatus = (data?.status ?? 'PAYMENT_PENDING') as BookingStatus;
      setStatus(currentStatus);
      if (TERMINAL_STATES.includes(currentStatus)) {
        stopPolling();
      }
    } catch (err) {
      console.error('[usePaymentStatus] Failed to poll status:', err);
    }
  };

  useEffect(() => {
    if (!bookingId) return;

    setLoading(true);

    // Immediate first check
    checkStatus().finally(() => setLoading(false));

    // Poll every 3 seconds
    pollRef.current = setInterval(checkStatus, 3000);

    // Safety: stop after 90 seconds
    timeoutRef.current = setTimeout(() => {
      console.warn('[usePaymentStatus] Polling timed out after 90s for booking:', bookingId);
      stopPolling();
    }, 90_000);

    return stopPolling;
  }, [bookingId]);

  return { status, loading };
};
