import { MEAL_PRICES, BAGGAGE_PRICING, TAX_RATES, FareSummary } from '../constants/pricing';

export const calculateFare = (
  flightBasePrice: number,
  passengerCount: number,
  selectedSeats: { seatNumber: string; seatClass: string; isWindow?: boolean; isExitRow?: boolean; isExtraLegroom?: boolean }[] = [],
  selectedMeals: (keyof typeof MEAL_PRICES | string)[] = [],
  baggageWeights: number[] = []
): FareSummary => {
  // 1. Base Fare
  const baseFare = flightBasePrice * passengerCount;

  // 2. Seat Charges
  let seatCharges = 0;
  selectedSeats.forEach(seat => {
    // Basic class multiplier is usually handled in the seat.priceMultiplier which comes from backend
    // but the user wants additional specific charges:
    if (seat.isWindow) seatCharges += 350;
    if (seat.isExitRow) seatCharges += 1200;
    if (seat.isExtraLegroom) seatCharges += 900;
  });

  // 3. Meal Charges
  let mealCharges = 0;
  selectedMeals.forEach(meal => {
    const price = MEAL_PRICES[meal as keyof typeof MEAL_PRICES] || 0;
    mealCharges += price;
  });

  // 4. Baggage Charges
  let baggageCharges = 0;
  baggageWeights.forEach(weight => {
    if (weight > 15) {
      const slab = BAGGAGE_PRICING.find(p => weight <= p.upto);
      if (slab) baggageCharges += slab.price;
      else baggageCharges += 3500; // Max slab
    }
  });

  // 5. Taxes & Fees
  const subtotalForTax = baseFare + seatCharges + mealCharges + baggageCharges;
  const gst = Math.round(subtotalForTax * TAX_RATES.GST);
  const airportFees = TAX_RATES.AIRPORT_FEE * passengerCount;
  const convenienceFee = TAX_RATES.CONVENIENCE_FEE;
  const taxesAndFees = gst + airportFees + convenienceFee;

  const totalAmount = subtotalForTax + taxesAndFees;

  return {
    baseFare,
    seatCharges,
    mealCharges,
    baggageCharges,
    gst,
    airportFees,
    convenienceFee,
    taxesAndFees,
    totalAmount
  };
};
