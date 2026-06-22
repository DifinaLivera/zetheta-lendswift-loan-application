import * as React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  label?: string;
  required?: boolean;
  error?: string;
}

export const RadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ name, options, value, onChange, className = '', layout = 'horizontal', label, required, error }, ref) => {
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, val: string) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange?.(val);
      }
    };

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8E9299] flex items-center gap-1.5 leading-tight">
            {label}
            {required && <span className="text-rose-500 font-bold" aria-hidden="true">*</span>}
          </span>
        )}
        
        <div 
          className={`
            ${layout === 'vertical' ? 'flex flex-col gap-2.5' : ''}
            ${layout === 'horizontal' ? 'flex flex-row flex-wrap gap-3' : ''}
            ${layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-3 gap-3.5' : ''}
          `}
          role="radiogroup"
          aria-label={label}
        >
          {options.map((opt, i) => {
            const isChecked = value === opt.value;
            return (
              <label
                key={opt.value}
                className={`
                  relative flex items-start gap-3.5 p-4 rounded-sm border cursor-pointer transition-all duration-200 select-none
                  focus-within:ring-1 focus-within:ring-[#D4AF37]/50 outline-none
                  ${isChecked 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_12px_rgba(212,175,55,0.1)]' 
                    : 'border-[#2D3036] bg-[#1A1D23] hover:border-[#D4AF37]/55 hover:bg-[#1E2128]'
                  }
                `}
                onKeyDown={(e) => handleKeyDown(e, opt.value)}
              >
                {/* Real input visually hidden but accessible */}
                <input
                  type="radio"
                  name={name}
                  ref={i === 0 ? ref : undefined}
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => onChange?.(opt.value)}
                  className="sr-only"
                />
                
                {/* Custom circle indicator */}
                <span className={`
                  flex items-center justify-center w-5.5 h-5.5 rounded-full border mt-0.5 transition-all
                  ${isChecked 
                    ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0A0B0D]' 
                    : 'border-[#2D3036] bg-[#0A0B0D]'
                  }
                `}>
                  {isChecked && <span className="w-2 h-2 rounded-full bg-[#0A0B0D] block" />}
                </span>

                <div className="flex-1 flex flex-col leading-tight">
                  <div className="flex items-center gap-2">
                    {opt.icon && <span className={`w-5 h-5 ${isChecked ? 'text-[#D4AF37]' : 'text-[#8E9299]'}`}>{opt.icon}</span>}
                    <span className={`text-sm font-semibold ${isChecked ? 'text-white' : 'text-[#E0E2E5]'}`}>
                      {opt.label}
                    </span>
                  </div>
                  {opt.description && (
                    <span className="text-xs text-[#8E9299] font-medium mt-1 leading-normal">
                      {opt.description}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>

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
RadioGroup.displayName = 'RadioGroup';
