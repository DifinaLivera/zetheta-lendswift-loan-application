import * as React from 'react';
import { LoanType, ApplicationState } from '../types';
import { encryptData } from '../utils/encryption';

interface UseAutoSaveProps {
  formState: Partial<ApplicationState>;
  loanType: LoanType;
  currentStep: number;
  intervalMs?: number;
}

export function useAutoSave({ formState, loanType, currentStep, intervalMs = 30000 }: UseAutoSaveProps) {
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Function to perform the actual encrypted save
  const saveDraft = React.useCallback(async () => {
    if (!loanType) return;

    try {
      const serializedData = JSON.stringify(formState);
      const encryptedData = await encryptData(serializedData);

      // Store encrypted content in localStorage
      const draftKey = `lendswift_draft_${loanType}`;
      localStorage.setItem(draftKey, encryptedData);

      // Store unencrypted metadata alongside
      const metaKey = `lendswift_meta_${loanType}`;
      const metadata = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        step: currentStep,
        loanType: loanType
      };
      localStorage.setItem(metaKey, JSON.stringify(metadata));

      // Show toast
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setToastMessage(`Draft saved at ${currentTime}`);

      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        setToastMessage(null);
      }, 2000);

    } catch (err) {
      console.error("Auto-save failed", err);
    }
  }, [formState, loanType, currentStep]);

  // Set up debounced auto-save timer on state changes
  React.useEffect(() => {
    // If state is empty or we don't have a loan type yet, don't trigger auto-save
    if (!loanType || Object.keys(formState).length === 0) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveDraft();
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [formState, loanType, currentStep, intervalMs, saveDraft]);

  return { saveDraft, toastMessage };
}
