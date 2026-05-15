import React from 'react';
import { Search, Armchair, User, CreditCard, CheckCircle } from 'lucide-react';

interface Step {
  label: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { label: 'Search',    icon: Search },
  { label: 'Seats',     icon: Armchair },
  { label: 'Passenger', icon: User },
  { label: 'Payment',   icon: CreditCard },
  { label: 'Confirm',   icon: CheckCircle },
];

interface BookingStepProgressProps {
  currentStep: number; // 1-indexed: 1=Search, 2=Seats, 3=Passenger, 4=Payment, 5=Confirm
}

const BookingStepProgress: React.FC<BookingStepProgressProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.label}>
            {/* Step bubble */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : ''}
                  ${isActive ? 'bg-slate-900 text-white ring-4 ring-slate-900/10' : ''}
                  ${!isCompleted && !isActive ? 'bg-slate-100 text-slate-400' : ''}
                `}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-widest hidden sm:block
                  ${isActive ? 'text-slate-900' : isCompleted ? 'text-blue-600' : 'text-slate-400'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < STEPS.length - 1 && (
              <div
                className={`h-[2px] w-10 md:w-16 mx-1 rounded-full transition-all duration-500 mb-5
                  ${isCompleted ? 'bg-blue-600' : 'bg-slate-100'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BookingStepProgress;
