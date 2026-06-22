import * as React from 'react';
import { validatePAN, validateAadhaar } from '../utils/validators';
import { LoanType } from '../types';

interface VerificationResult {
  isVerifying: boolean;
  isVerified: boolean;
  error: string | null;
  verify: (val: string, loanType: LoanType) => Promise<boolean>;
  reset: () => void;
}

export function useVerification(type: 'PAN' | 'Aadhaar'): VerificationResult {
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isVerified, setIsVerified] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reset = React.useCallback(() => {
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
  }, []);

  const verify = React.useCallback(async (val: string, loanType: LoanType): Promise<boolean> => {
    const cleanVal = val.trim();
    if (!cleanVal) {
      setError(`${type === 'PAN' ? 'PAN Number' : 'Aadhaar Number'} is required`);
      setIsVerified(false);
      return false;
    }

    // Initial mechanical checks
    if (type === 'PAN') {
      const panRes = validatePAN(cleanVal, loanType);
      if (!panRes.isValid) {
        setError(panRes.error || 'Invalid PAN format');
        setIsVerified(false);
        return false;
      }
    } else {
      const aadhaarRes = validateAadhaar(cleanVal);
      if (!aadhaarRes.isValid) {
        setError(aadhaarRes.error || 'Invalid Aadhaar format');
        setIsVerified(false);
        return false;
      }
    }

    // Format is valid, start the 1.5 second verification simulation
    setIsVerifying(true);
    setError(null);
    setIsVerified(false);

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
        resolve(true);
      }, 1500); // 1.5s delay simulation as per Day 4/Page 35 rules
    });
  }, [type]);

  return { isVerifying, isVerified, error, verify, reset };
}
