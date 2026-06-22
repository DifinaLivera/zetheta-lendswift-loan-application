import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationState } from '../types';
import { getSchemaForStep } from '../utils/schemaFactory';
import { MaskedInput } from './common/MaskedInput';
import { Checkbox } from './common/Checkbox';
import { Input } from './common/Input';
import { ErrorMessage } from './common/ErrorMessage';
import { useVerification } from '../hooks/useVerification';
import { CheckCircle, ShieldAlert, Loader2, Info } from 'lucide-react';

interface StepProps {
  globalState: Partial<ApplicationState>;
  onNext: (data: Partial<ApplicationState>) => void;
  onPrev: () => void;
}

export function Step3KYC({ globalState, onNext, onPrev }: StepProps) {
  const currentSchema = getSchemaForStep(3, globalState);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      panNumber: globalState.panNumber || '',
      aadhaarNumber: globalState.aadhaarNumber || '',
      aadhaarConsent: globalState.aadhaarConsent || false,
      voterId: globalState.voterId || '',
      passport: globalState.passport || ''
    }
  });

  const panVal = watch('panNumber');
  const aadhaarVal = watch('aadhaarNumber');
  const consentVal = watch('aadhaarConsent');

  // Load custom verification hooks
  const panVerification = useVerification('PAN');
  const aadhaarVerification = useVerification('Aadhaar');

  const [panState, setPanState] = React.useState({
    verified: !!globalState.isPanVerified,
    failedMsg: null as string | null
  });

  const [aadhaarState, setAadhaarState] = React.useState({
    verified: !!globalState.isAadhaarVerified,
    failedMsg: null as string | null
  });

  const handlePanBlur = async () => {
    if (!panVal) return;
    setPanState({ verified: false, failedMsg: null });
    const success = await panVerification.verify(panVal, globalState.loanType || 'Personal');
    if (success) {
      setPanState({ verified: true, failedMsg: null });
    } else {
      setPanState({ verified: false, failedMsg: panVerification.error || 'PAN verification failed.' });
    }
  };

  const handleAadhaarBlur = async () => {
    if (!aadhaarVal) return;
    setAadhaarState({ verified: false, failedMsg: null });
    const success = await aadhaarVerification.verify(aadhaarVal, globalState.loanType || 'Personal');
    if (success) {
      setAadhaarState({ verified: true, failedMsg: null });
    } else {
      setAadhaarState({ verified: false, failedMsg: aadhaarVerification.error || 'Aadhaar verification failed.' });
    }
  };

  // Cross-step requirement: Passport is required if Home Loan and amount exceeds 50 Lakhs
  const showPassportField = globalState.loanType === 'Home' && (globalState.loanAmount || 0) > 5000000;

  const handleFormSubmit = (data: any) => {
    if (!panState.verified) {
      setPanState(prev => ({ ...prev, failedMsg: 'Please perform PAN verification before proceeding.' }));
      return;
    }
    if (!aadhaarState.verified) {
      setAadhaarState(prev => ({ ...prev, failedMsg: 'Please perform Aadhaar verification before proceeding.' }));
      return;
    }

    onNext({
      ...data,
      isPanVerified: true,
      isAadhaarVerified: true
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-white font-serif tracking-wide">Identity Verification (KYC)</h2>
        <p className="text-[#8E9299] text-xs mt-1 font-medium leading-relaxed font-sans">
          National guidelines require digital KYC. Provide your PAN and Aadhaar details to run real-time matches securely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* PAN Number Input */}
        <div className="flex flex-col gap-1.5 w-full">
          <MaskedInput
            maskType="PAN"
            label="Permanent Account Number (PAN)"
            required
            value={panVal}
            onChange={(val) => {
              setValue('panNumber', val);
              if (panState.verified) setPanState({ verified: false, failedMsg: null });
            }}
            onBlur={handlePanBlur}
            error={errors.panNumber?.message}
            helpText="Standard 10-char PAN. Individual 'P' entity code for Personal/Home; P, C, or F for Business."
          />

          {/* PAN Verification Status Area */}
          <div className="mt-1">
            {panVerification.isVerifying && (
              <span className="flex items-center gap-2 text-[#E0E2E5] text-xs font-semibold bg-[#1A1D23] px-3 py-2 rounded-sm border border-[#2D3036]">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                Validating with NSDL Registry...
              </span>
            )}
            {panState.verified && (
              <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/20 px-3 py-2 rounded-sm border border-emerald-900/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                PAN Successfully Verified (Matched Name)
              </span>
            )}
            {panState.failedMsg && (
              <span className="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-950/20 px-3 py-2 rounded-sm border border-rose-950/40">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
                {panState.failedMsg}
              </span>
            )}
          </div>
        </div>

        {/* Aadhaar Number Input */}
        <div className="flex flex-col gap-1.5 w-full">
          <MaskedInput
            maskType="Aadhaar"
            label="Aadhaar Number (12 Digits)"
            required
            maxLength={14}
            value={aadhaarVal}
            onChange={(val) => {
              setValue('aadhaarNumber', val);
              if (aadhaarState.verified) setAadhaarState({ verified: false, failedMsg: null });
            }}
            onBlur={handleAadhaarBlur}
            error={errors.aadhaarNumber?.message}
            helpText="Must pass standard Verhoeff mathematical parity checksum."
          />

          {/* Aadhaar Verification Status Area */}
          <div className="mt-1">
            {aadhaarVerification.isVerifying && (
              <span className="flex items-center gap-2 text-[#E0E2E5] text-xs font-semibold bg-[#1A1D23] px-3 py-2 rounded-sm border border-[#2D3036]">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                Querying UIDAI Biometric Vault...
              </span>
            )}
            {aadhaarState.verified && (
              <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/20 px-3 py-2 rounded-sm border border-emerald-900/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Aadhaar Checksum Validated & Verified
              </span>
            )}
            {aadhaarState.failedMsg && (
              <span className="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-950/20 px-3 py-2 rounded-sm border border-rose-950/40">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
                {aadhaarState.failedMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Aadhaar Consent Checkbox */}
      <div className="p-4 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-[#8E9299] mt-0.5 flex-shrink-0" />
          <p className="text-[11px] font-semibold text-[#8E9299] leading-normal font-sans">
            By checking the box below, you consent to allow LendSwift to query UIDAI for e-KYC purposes. This data will be handled securely and encrypted in compliance with Aadhaar Regulations and Data Minimisation guidelines.
          </p>
        </div>
        
        <Checkbox
          label={<strong className="font-sans font-bold">I agree and authorize LendSwift to fetch my Aadhaar identity details for verification purposes.</strong>}
          error={errors.aadhaarConsent?.message}
          checked={consentVal}
          onChange={(e) => setValue('aadhaarConsent', e.target.checked, { shouldValidate: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Voter ID */}
        <Input>
          <Input.Label>Voter ID (Optional)</Input.Label>
          <Input.Field
            placeholder="e.g. ABC1234567"
            maxLength={10}
            hasError={!!errors.voterId}
            {...register('voterId')}
          />
          <Input.HelpText>Format: 3 letters + 7 numbers (e.g. MHD0958611)</Input.HelpText>
          <Input.Error>{errors.voterId?.message}</Input.Error>
        </Input>

        {/* Passport details (Mandatory if Home > 50L, otherwise optional) */}
        <Input>
          <Input.Label required={showPassportField}>
            Passport Number {showPassportField ? '(Mandatory)' : '(Optional)'}
          </Input.Label>
          <Input.Field
            placeholder="e.g. Z1234567"
            maxLength={8}
            hasError={!!errors.passport}
            {...register('passport')}
          />
          <Input.HelpText>
            {showPassportField 
              ? 'Required for Home Loans > ₹50 Lakhs. 1 Letter + 7 numbers.' 
              : '1 Letter + 7 numbers (e.g. J9876543) if you wish to use as additional proof.'
            }
          </Input.HelpText>
          <Input.Error>{errors.passport?.message}</Input.Error>
        </Input>
      </div>

      <div className="flex justify-between pt-4 border-t border-[#2D3036] gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 border border-[#2D3036] text-[#E0E2E5] bg-[#1A1D23] hover:bg-[#2D3036] hover:text-white rounded-sm font-semibold transition cursor-pointer text-xs uppercase tracking-wider"
        >
          Previous Step
        </button>
        <button
          type="submit"
          disabled={!panState.verified || !aadhaarState.verified || !consentVal}
          className={`px-6 py-2.5 rounded-sm font-bold transition cursor-pointer text-xs uppercase tracking-wider ${
            (panState.verified && aadhaarState.verified && consentVal)
              ? 'bg-[#D4AF37] text-[#0A0B0D] hover:bg-[#E5C158] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
              : 'bg-[#1A1D23] text-[#8E9299]/30 border border-[#2D3036] cursor-not-allowed'
          }`}
        >
          Save & Proceed
        </button>
      </div>
    </form>
  );
}
