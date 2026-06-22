import * as React from 'react';
import { formatIndianCurrency, parseIndianCurrency } from '../../utils/validators';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  value?: number;
  onChange?: (num: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, required, error, helpText, value, onChange, className = '', disabled, ...props }, ref) => {
    
    // Manage visual formatted state
    const [displayVal, setDisplayVal] = React.useState('');

    // Update display when value from parent changes
    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        const parsedValue = typeof value === 'number' ? value : parseIndianCurrency(String(value));
        if (parsedValue === 0) {
          setDisplayVal('');
        } else {
          setDisplayVal('₹ ' + formatIndianCurrency(parsedValue));
        }
      } else {
        setDisplayVal('');
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawInput = e.target.value;
      const numericVal = parseIndianCurrency(rawInput);
      
      if (rawInput === '') {
        setDisplayVal('');
        onChange?.(0);
        return;
      }

      setDisplayVal('₹ ' + formatIndianCurrency(numericVal));
      onChange?.(numericVal);
    };

    const handleBlur = () => {
      if (value) {
        setDisplayVal('₹ ' + formatIndianCurrency(value));
      } else {
        setDisplayVal('');
      }
    };

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8E9299] flex items-center gap-1.5 leading-tight">
            {label}
            {required && <span className="text-rose-500 font-bold" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative w-full rounded-sm shadow-sm">
          <input
            ref={ref}
            type="text"
            value={displayVal}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="₹ Enter amount"
            className={`w-full px-4 py-3.5 rounded-sm border bg-[#1A1D23] text-[#E0E2E5] text-sm font-semibold
              transition-all duration-200 outline-none
              placeholder:text-[#8E9299]/40
              focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:bg-[#1E2128]
              disabled:bg-[#0F1115] disabled:text-[#8E9299]/50 disabled:cursor-not-allowed
              ${error 
                ? 'border-rose-500/80 ring-rose-500/20 ring-1 focus:border-rose-400 focus:ring-rose-400/30' 
                : 'border-[#2D3036] focus:border-[#D4AF37]'
              }
            `}
            {...props}
          />
        </div>

        {helpText && !error && (
          <p className="text-xs text-[#8E9299] leading-normal mt-0.5">
            {helpText}
          </p>
        )}

        {error && (
          <p role="alert" aria-live="polite" className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';
