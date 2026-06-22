import * as React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        <label className="relative flex items-start gap-3 cursor-pointer select-none py-1.5 focus-within:ring-1 focus-within:ring-[#D4AF37]/50 rounded-sm pr-2">
          {/* Native Checkbox visually hidden with styling */}
          <input
            type="checkbox"
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          
          <div className={`
            flex-shrink-0 w-5.5 h-5.5 rounded-sm border-2 transition-all mt-0.5 flex items-center justify-center
            peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37] peer-checked:text-[#0A0B0D]
            peer-disabled:bg-[#0F1115] peer-disabled:border-[#2D3036] peer-disabled:cursor-not-allowed
            ${error 
              ? 'border-rose-500 bg-rose-950/20' 
              : 'border-[#2D3036] bg-[#1A1D23] hover:border-[#D4AF37]/60'
            }
          `}>
            {/* Custom checkmark icon */}
            <svg 
              className="w-3.5 h-3.5 stroke-current stroke-[3] fill-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150" 
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <span className="text-sm font-medium text-[#E0E2E5] leading-normal select-text">
            {label}
          </span>
        </label>
        
        {error && (
          <p role="alert" aria-live="polite" className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5 ml-8">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
