import * as React from 'react';
import { PIN_CODE_DATA, PinCodeInfo } from '../utils/pinCodeData';

export function usePinCodeLookup() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const lookup = React.useCallback(async (pinCode: string): Promise<PinCodeInfo | null> => {
    const cleanPin = pinCode.trim();
    if (!cleanPin) return null;
    
    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setError('PIN Code must be exactly 6 digits');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        const data = PIN_CODE_DATA[cleanPin];
        if (data) {
          resolve(data);
        } else {
          setError('PIN Code not found in our database');
          resolve(null);
        }
      }, 700); // realistic network delay
    });
  }, []);

  return { lookup, isLoading, error };
}
