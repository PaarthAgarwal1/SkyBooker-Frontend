import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, ChevronRight,
  ShieldCheck, Briefcase, Utensils, Hash,
  Calendar, Globe, BookOpen, BadgeCheck, Armchair
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import BookingStepProgress from '../../components/user/BookingStepProgress';
import { useBookingStore } from '../../store/bookingStore';
import type { PassengerDTO } from '../../shared/api/passenger';
import { formatINR } from '../../shared/utils/currency';
import { calculateFare } from '../../shared/utils/fareCalculation';
import { MEAL_PRICES, BAGGAGE_PRICING } from '../../shared/constants/pricing';
import FareBreakdown from '../../components/user/FareBreakdown';

// ─── Local form state type (richer than DTO, includes display helpers) ─────
interface PassengerFormState {
  title: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  passportNumber: string;
  nationality: string;
  seatId: string;
  seatNumber: string;
  passengerType: string;
  passportExpiry: string;
}

const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const MEAL_OPTIONS = [
  { value: 'VEG', label: 'Vegetarian', emoji: '🥗', price: MEAL_PRICES.VEG },
  { value: 'NON_VEG', label: 'Non-Vegetarian', emoji: '🍗', price: MEAL_PRICES.NON_VEG },
  { value: 'VEGAN', label: 'Vegan', emoji: '🌱', price: MEAL_PRICES.VEGAN },
  { value: 'JAIN', label: 'Jain', emoji: '🫐', price: MEAL_PRICES.JAIN },
];
const LUGGAGE_OPTIONS = BAGGAGE_PRICING;

const inputCls =
  'w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400';

const labelCls = 'block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1';

const PassengerForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, selectedSeats, searchParams, totalAmount } = (location.state as any) || {};

  const passengersCount: number = searchParams?.passengers || 1;

  // Initialize passenger array from selected seats
  const [passengers, setPassengers] = useState<PassengerFormState[]>(
    Array.from({ length: passengersCount }, (_, i) => ({
      title: 'Mr.',
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '',
      passportNumber: '',
      nationality: 'INDIAN',
      seatId: selectedSeats?.[i]?.seatId || '',
      seatNumber: selectedSeats?.[i]?.seatNumber || '',
      passengerType: 'ADULT',
      passportExpiry: '',
    }))
  );

  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [mealPreference, setMealPreference] = useState('VEG');
  const [luggageKg, setLuggageKg] = useState(20);

  const { setContactInfo: storeContact, setPreferences } = useBookingStore();

  // ── Field updater ─────────────────────────────────────────────────────────
  const updatePassenger = (idx: number, field: keyof PassengerFormState, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName.trim()) { toast.error(`Passenger ${i + 1}: First name is required.`); return false; }
      if (!p.lastName.trim()) { toast.error(`Passenger ${i + 1}: Last name is required.`); return false; }
      if (!p.dateOfBirth) { toast.error(`Passenger ${i + 1}: Date of birth is required.`); return false; }
      if (!p.passportNumber.trim()) { toast.error(`Passenger ${i + 1}: Passport number is required.`); return false; }
      if (!p.passportExpiry) { toast.error(`Passenger ${i + 1}: Passport expiry is required.`); return false; }
      if (new Date(p.passportExpiry) <= new Date()) { toast.error(`Passenger ${i + 1}: Passport must not be expired.`); return false; }
      if (!p.nationality.trim()) { toast.error(`Passenger ${i + 1}: Nationality is required.`); return false; }
    }
    if (!contactInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      toast.error('Please enter a valid contact email address.');
      return false;
    }
    if (!contactInfo.phone.trim() || contactInfo.phone.replace(/\D/g, '').length < 7) {
      toast.error('Please enter a valid phone number.');
      return false;
    }
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Persist contact + preferences into global store
    storeContact(contactInfo.email, contactInfo.phone);
    setPreferences(mealPreference, luggageKg);

    // Map to DTO shape for the booking API
    const passengerDTOs: PassengerDTO[] = passengers.map((p) => ({
      title: p.title,
      firstName: p.firstName,
      lastName: p.lastName,
      gender: p.gender,
      dateOfBirth: p.dateOfBirth,
      passportNumber: p.passportNumber,
      nationality: p.nationality.toUpperCase(),
      seatId: p.seatId,
      seatNumber: p.seatNumber,
      passengerType: p.passengerType,
      passportExpiry: p.passportExpiry,
    }));

    navigate('/checkout', {
      state: {
        flight,
        selectedSeats,
        passengers: passengerDTOs,
        contactInfo,
        totalAmount,
        searchParams,
        mealPreference,
        luggageKg,
      },
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Passenger Details</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Step 3 of 5 · Enter traveler information
                </p>
              </div>
            </div>
            <BookingStepProgress currentStep={3} />
          </div>
        </div>
      </div>

      {/* Route Banner */}
      {flight && (
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-4 text-white">
            <span className="text-2xl font-black tracking-tight">{flight.originAirportCode}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{flight.flightNumber}</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>
            <span className="text-2xl font-black tracking-tight">{flight.destinationAirportCode}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: Passenger + Contact Forms ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Passenger Sections */}
            {passengers.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm"
              >
                {/* Passenger Header */}
                <div className="flex items-center gap-4 mb-7 pb-6 border-b border-slate-50">
                  <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Passenger {idx + 1}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Armchair className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-bold text-blue-600">
                        Seat {p.seatNumber || 'Not selected'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className={labelCls}>Title</label>
                    <select
                      className={inputCls + ' appearance-none cursor-pointer'}
                      value={p.title}
                      onChange={(e) => updatePassenger(idx, 'title', e.target.value)}
                    >
                      {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Passenger Type */}
                  <div>
                    <label className={labelCls}>Passenger Type</label>
                    <select
                      className={inputCls + ' appearance-none cursor-pointer'}
                      value={p.passengerType}
                      onChange={(e) => updatePassenger(idx, 'passengerType', e.target.value)}
                    >
                      <option value="ADULT">Adult (12+)</option>
                      <option value="CHILD">Child (2–11)</option>
                      <option value="INFANT">Infant (Under 2)</option>
                    </select>
                  </div>

                  {/* First Name */}
                  <div>
                    <label className={labelCls}><User className="inline w-3 h-3 mr-1" />First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John"
                      className={inputCls}
                      value={p.firstName}
                      onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className={labelCls}><User className="inline w-3 h-3 mr-1" />Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Doe"
                      className={inputCls}
                      value={p.lastName}
                      onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className={labelCls}>Gender</label>
                    <select
                      className={inputCls + ' appearance-none cursor-pointer'}
                      value={p.gender}
                      onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className={labelCls}><Calendar className="inline w-3 h-3 mr-1" />Date of Birth</label>
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className={inputCls}
                      value={p.dateOfBirth}
                      onChange={(e) => updatePassenger(idx, 'dateOfBirth', e.target.value)}
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className={labelCls}><Globe className="inline w-3 h-3 mr-1" />Nationality</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. INDIAN"
                      className={inputCls}
                      value={p.nationality}
                      onChange={(e) => updatePassenger(idx, 'nationality', e.target.value.toUpperCase())}
                    />
                  </div>

                  {/* Passport Number */}
                  <div>
                    <label className={labelCls}><BookOpen className="inline w-3 h-3 mr-1" />Passport Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. A1234567"
                      className={inputCls}
                      value={p.passportNumber}
                      onChange={(e) => updatePassenger(idx, 'passportNumber', e.target.value.toUpperCase())}
                    />
                  </div>

                  {/* Passport Expiry */}
                  <div className="md:col-span-2">
                    <label className={labelCls}><BadgeCheck className="inline w-3 h-3 mr-1" />Passport Expiry Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className={inputCls}
                      value={p.passportExpiry}
                      onChange={(e) => updatePassenger(idx, 'passportExpiry', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* ── Contact Info ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: passengers.length * 0.08 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-7 pb-6 border-b border-slate-50">
                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Contact Information</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">For e-tickets and booking updates</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}><Mail className="inline w-3 h-3 mr-1" />Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    className={inputCls}
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}><Phone className="inline w-3 h-3 mr-1" />Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    className={inputCls}
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>

            {/* ── Travel Preferences ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (passengers.length + 1) * 0.08 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-7 pb-6 border-b border-slate-50">
                <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Travel Preferences</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applies to all passengers</p>
                </div>
              </div>

              {/* Meal Preference */}
              <div className="mb-6">
                <label className={labelCls}><Utensils className="inline w-3 h-3 mr-1" />Meal Preference</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MEAL_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMealPreference(m.value)}
                      className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 font-bold text-xs transition-all
                        ${mealPreference === m.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span>{m.label}</span>
                      <span className="text-[9px] text-blue-600 font-black">{m.price > 0 ? `+${formatINR(m.price)}` : 'FREE'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Luggage */}
              <div>
                <label className={labelCls}><Briefcase className="inline w-3 h-3 mr-1" />Check-in Luggage (kg)</label>
                <div className="flex flex-wrap gap-3">
                  {LUGGAGE_OPTIONS.map((slab) => (
                    <button
                      key={slab.upto}
                      type="button"
                      onClick={() => setLuggageKg(slab.upto)}
                      className={`flex flex-col items-center px-6 py-3 rounded-2xl border-2 font-black text-sm transition-all
                        ${luggageKg === slab.upto
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-100 text-slate-500 hover:border-slate-200'
                        }`}
                    >
                      <span>{slab.upto} kg</span>
                      <span className="text-[9px] font-bold text-slate-400">{slab.price > 0 ? `+${formatINR(slab.price)}` : 'FREE'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Sidebar ──────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 sticky top-24">
              <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-600" />
                Trip Summary
              </h3>

              {/* Flight info */}
              {flight && (
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Route</p>
                  <p className="text-sm font-black text-slate-900">
                    {flight.originAirportCode} → {flight.destinationAirportCode}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{flight.flightNumber}</p>
                </div>
              )}

              {/* Seats list */}
              {selectedSeats?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((s: any) => (
                      <span key={s.seatId} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black">
                        {s.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Fare Breakdown */}
              <FareBreakdown 
                summary={calculateFare(
                  flight?.basePrice || 0,
                  passengersCount,
                  selectedSeats,
                  passengers.map(() => mealPreference),
                  passengers.map(() => luggageKg)
                )}
                showTitle={false}
                className="!shadow-none border-none p-0 mb-6"
              />

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                Proceed to Payment
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Secure 256-bit Checkout
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PassengerForm;
