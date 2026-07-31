import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Passe les cases en rouge sans afficher de message (déjà affiché ailleurs). */
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  error,
  invalid = false,
  disabled = false,
  autoFocus = true,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasError = invalid || !!error;

  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, length);
      const paddedArray = [...otpArray, ...new Array(length - otpArray.length).fill('')];
      setOtp(paddedArray);
    }
  }, [value, length]);

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    onChange(otpValue);

    // Focus next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Navigation au clavier entre les cases.
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (pastedData) {
      const newOtp = pastedData.split('');
      const paddedArray = [...newOtp, ...new Array(length - newOtp.length).fill('')];
      setOtp(paddedArray);
      onChange(pastedData);

      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`Chiffre ${index + 1}`}
            aria-invalid={hasError}
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              h-14 w-11 rounded-xl border-2 bg-white text-center text-xl font-semibold text-slate-900
              transition-all duration-200 focus:outline-none focus:ring-4
              disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60
              sm:h-16 sm:w-14 sm:text-2xl
              ${
                hasError
                  ? 'border-red-300 bg-red-50/60 focus:border-red-500 focus:ring-red-500/10'
                  : digit
                    ? 'border-blue-500 focus:ring-blue-500/15'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/15'
              }
            `}
          />
        ))}
      </div>
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
};
