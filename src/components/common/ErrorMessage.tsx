import * as React from 'react';

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  className?: string;
}

export function ErrorMessage({ message, className = '', ...props }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div 
      role="alert" 
      aria-live="polite" 
      className={`bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-start gap-2.5 shadow-sm leading-normal ${className}`}
      {...props}
    >
      <svg className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        {message}
      </div>
    </div>
  );
}
