import * as React from 'react';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  value?: string;
  onChange?: (val: string) => void;
  maskType: 'PAN' | 'Aadhaar';
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ label, required, error, helpText, value = '', onChange, maskType, className = '', onBlur, ...props }, ref) => {
    
    const [isFocused, setIsFocused] = React.useState(false);
    const [localVal, setLocalVal] = React.useState('');

    React.useEffect(() => {
      setLocalVal(value || '');
    }, [value]);

    const getMaskedValue = (val: string) => {
      if (!val) return '';
      const clean = val.replace(/\s+/g, '');
      if (maskType === 'Aadhaar') {
        const lastFour = clean.slice(-4);
        if (clean.length <= 4) return clean;
        return '••••  ••••  ' + lastFour;
      } else {
        // PAN
        if (clean.length <= 4) return clean;
        const maskedPart = '•'.repeat(clean.length - 4);
        const lastFour = clean.slice(-4);
        return maskedPart + lastFour;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value;
      if (maskType === 'PAN') {
        raw = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
      } else if (maskType === 'Aadhaar') {
        raw = raw.replace(/[^0-9]/g, '');
        // Keep to 12 digits max
        raw = raw.slice(0, 12);
      }
      setLocalVal(raw);
      onChange?.(raw);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8E9299] flex items-center gap-1.5 leading-tight">
            {label}
            {required && <span className="text-rose-500 font-bold" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type="text"
            value={isFocused ? localVal : getMaskedValue(localVal)}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={maskType === 'PAN' ? 'ABCDE1234F' : '••••  ••••  ••••'}
            className={`w-full px-4 py-3.5 rounded-sm border bg-[#1A1D23] text-[#E0E2E5] text-sm font-semibold tracking-wide
              transition-all duration-200 outline-none
              placeholder:text-[#8E9299]/40 placeholder:tracking-normal
              focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:bg-[#1E2128]
              disabled:bg-[#0F1115] disabled:text-[#8E9299]/50 disabled:cursor-not-allowed
              ${error 
                ? 'border-rose-500/80 ring-rose-500/20 ring-1 focus:border-rose-400 focus:ring-rose-400/30' 
                : 'border-[#2D3036] focus:border-[#D4AF37]'
              }
            `}
            {...props}
          />
          
          {/* Subtle indicator showing whether it's masked or raw editable */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-slate-400 font-medium">
            {!isFocused && localVal ? (
              <span className="flex items-center gap-1 bg-[#2D3036]/80 text-[#D4AF37] px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider border border-[#D4AF37]/25">
                <svg className="w-3 h-3 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Masked
              </span>
            ) : null}
          </span>
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
MaskedInput.displayName = 'MaskedInput';
