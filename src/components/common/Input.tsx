import * as React from 'react';

interface InputProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function InputRoot({ children, className = '', ...props }: InputProps & { className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`} {...props}>
      {children}
    </div>
  );
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function InputLabel({ children, required, className = '', ...props }: LabelProps) {
  return (
    <label 
      className={`text-[11px] font-medium uppercase tracking-[0.15em] text-[#8E9299] flex items-center gap-1.5 leading-tight ${className}`} 
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 font-bold" aria-hidden="true">*</span>}
    </label>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const InputField = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ className = '', hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3.5 rounded-sm border bg-[#1A1D23] text-[#E0E2E5] text-sm font-medium
          transition-all duration-200 outline-none
          placeholder:text-[#8E9299]/40
          focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:bg-[#1E2128]
          disabled:bg-[#0F1115] disabled:text-[#8E9299]/50 disabled:cursor-not-allowed
          ${hasError 
            ? 'border-rose-500/80 ring-rose-500/20 ring-1 focus:border-rose-400 focus:ring-rose-400/30' 
            : 'border-[#2D3036] focus:border-[#D4AF37]'
          } 
          ${className}
        `}
        {...props}
      />
    );
  }
);
InputField.displayName = 'Input.Field';

interface ErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  className?: string;
}

export function InputError({ children, className = '', ...props }: ErrorProps) {
  if (!children) return null;
  return (
    <p 
      role="alert" 
      aria-live="polite" 
      className={`text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1 ${className}`}
      {...props}
    >
      <span className="inline-block w-1 h-1 rounded-full bg-rose-600 mr-0.5"></span>
      {children}
    </p>
  );
}

interface HelpTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function InputHelpText({ children, className = '', ...props }: HelpTextProps) {
  return (
    <p className={`text-xs text-[#8E9299] leading-normal mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
}

// Map sub-components to root
export const Input = Object.assign(InputRoot, {
  Label: InputLabel,
  Field: InputField,
  Error: InputError,
  HelpText: InputHelpText,
});
