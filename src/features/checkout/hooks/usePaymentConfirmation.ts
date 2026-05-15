import { useState, useRef, useCallback } from 'react';
import { checkoutApi } from '../services/checkoutApi';
import toast from 'react-hot-toast';

interface UsePaymentConfirmationProps {
  onSuccess: (bookingData: any) => void;
  onError: (message: string) => void;
}

export const usePaymentConfirmation = ({ onSuccess, onError }: UsePaymentConfirmationProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [loadingSub, setLoadingSub] = useState('');
  const pollInterval = useRef<any>(null);
  const timeoutId = useRef<any>(null);

  const cleanup = useCallback(() => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    if (timeoutId.current) clearTimeout(timeoutId.current);
    pollInterval.current = null;
    timeoutId.current = null;
  }, []);

  const confirmPaymentAndBooking = async (bookingId: string, paymentId: string) => {
    setIsProcessing(true);
    setLoadingText('Processing payment...');
    setLoadingSub('Verifying your transaction with Stripe');

    // 1. Start Polling for Payment Status PAID
    const startTime = Date.now();
    const TIMEOUT_MS = 60000; // 60 seconds

    return new Promise<void>((resolve, reject) => {
      // Setup safety timeout
      timeoutId.current = setTimeout(() => {
        cleanup();
        const msg = 'Payment verification timed out. Please check your bank or contact support.';
        onError(msg);
        setIsProcessing(false);
        reject(new Error(msg));
      }, TIMEOUT_MS);

      pollInterval.current = setInterval(async () => {
        try {
          const res = await checkoutApi.getPaymentStatus(paymentId);
          console.log(`Payment status for ${paymentId}:`, res.status);

          if (res.status === 'PAID') {
            cleanup();
            
            // 2. Proceed to Booking Confirmation
            setLoadingText('Confirming booking...');
            setLoadingSub('Generating your e-ticket and PNR');
            
            try {
              const bookingRes = await checkoutApi.confirmBooking(bookingId, paymentId);
              onSuccess(bookingRes);
              setIsProcessing(false);
              resolve();
            } catch (err: any) {
              const msg = err.response?.data?.message || 'Payment received but booking confirmation failed. Please contact support.';
              onError(msg);
              setIsProcessing(false);
              reject(new Error(msg));
            }
          } else if (res.status === 'FAILED') {
            cleanup();
            const msg = 'Payment failed. Please try a different card.';
            onError(msg);
            setIsProcessing(false);
            reject(new Error(msg));
          }
          // If PENDING, keep polling...
        } catch (err) {
          console.error('Polling error:', err);
          // Don't fail immediately on network error during polling, just keep trying
        }
      }, 2000);
    });
  };

  return {
    isProcessing,
    loadingText,
    loadingSub,
    confirmPaymentAndBooking,
    cleanup
  };
};
