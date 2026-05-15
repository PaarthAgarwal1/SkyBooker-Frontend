export const MEAL_PRICES = {
  VEG: 250,
  NON_VEG: 400,
  VEGAN: 450,
  JAIN: 300,
};

export const BAGGAGE_PRICING = [
  { upto: 15, price: 0 }, // Free
  { upto: 20, price: 1200 },
  { upto: 25, price: 2200 },
  { upto: 30, price: 3500 },
];

export const SEAT_UPGRADE_PRICES = {
  WINDOW: 350,
  EXIT_ROW: 1200,
  EXTRA_LEGROOM: 900,
};

export const TAX_RATES = {
  GST: 0.05, // 5%
  AIRPORT_FEE: 750, // Per passenger
  CONVENIENCE_FEE: 299, // Per booking
};

export interface FareSummary {
  baseFare: number;
  seatCharges: number;
  mealCharges: number;
  baggageCharges: number;
  taxesAndFees: number;
  gst: number;
  airportFees: number;
  convenienceFee: number;
  totalAmount: number;
}
