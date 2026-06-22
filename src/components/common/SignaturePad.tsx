import * as React from 'react';

interface SignaturePadProps {
  value?: string; // base64 string
  onChange?: (val: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function SignaturePad({ value, onChange, error, label, required }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(true);
  const [isFocused, setIsFocused] = React.useState(false);

  // Initialize canvas stroke style
  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#D4AF37'; // Aurum gold pen stroke!
    return ctx;
  };

  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange?.(''); // trigger RHF update
  };

  // Start Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCanvasContext();
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Draw
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    // Support mobile scrolling while drawing on signature pad
    if (e.cancelable) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  // End Drawing
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save image to state
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    
    const base64Str = canvas.toDataURL('image/png');
    onChange?.(base64Str);
  };

  // Automatically resize and handle resolution on load or component mount
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set pixel density ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 150 * dpr; // fixed height standard
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // If pre-populated, load it
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, rect.width, 150);
        setIsEmpty(false);
      };
      img.src = value;
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8E9299] flex items-center gap-1.5 leading-tight">
          {label}
          {required && <span className="text-rose-500 font-bold" aria-hidden="true">*</span>}
        </span>
      )}

      {/* Signature container card */}
      <div 
        className={`relative border rounded-sm overflow-hidden bg-[#131418] border-[#2D3036] transition-all duration-200
          ${isFocused ? 'ring-1 ring-[#D4AF37]/50 border-[#D4AF37]' : 'hover:border-[#D4AF37]/40'}
        `}
      >
        {/* Anti Screen-Capture Secure Overlay (on blur) */}
        {!isFocused && !isEmpty && (
          <div className="absolute inset-0 bg-[#0A0B0D]/60 backdrop-blur-[1.5px] flex items-center justify-center select-none pointer-events-none z-10">
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#1A1D23] shadow-md px-2.5 py-1 rounded-sm uppercase tracking-wider flex items-center gap-1.5 border border-[#D4AF37]/20">
              <svg className="w-3.5 h-3.5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Click card to unlock signature
            </span>
          </div>
        )}

        {/* Canvas area */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          tabIndex={0}
          aria-label="Signature Drawing Pad canvas. Use touch or mouse pointers to draw signature inside the card boundaries."
          className="w-full h-[150px] block cursor-crosshair bg-[#131418] relative z-0 touch-none outline-none"
        />

        {/* Clear control block */}
        <div className="absolute bottom-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 text-[#E0E2E5] bg-[#2D3036]/95 hover:bg-[#2D3036] text-[10px] uppercase font-bold border border-[#2D3036] shadow-sm rounded-sm transition active:scale-95 cursor-pointer max-w-fit"
          >
            Clear Drawing
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" aria-live="polite" className="text-xs font-semibold text-rose-500 flex items-center gap-1 mt-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {error}
        </p>
      ) : (
        <p className="text-[10px] text-[#8E9299] font-medium uppercase tracking-wider">Draw signature securely with mouse or touch. Click canvas to unlock.</p>
      )}
    </div>
  );
}
