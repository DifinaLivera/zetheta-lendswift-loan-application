import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationState } from '../types';
import { getSchemaForStep } from '../utils/schemaFactory';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { MaskedInput } from './common/MaskedInput';
import { Checkbox } from './common/Checkbox';
import { CurrencyInput } from './common/CurrencyInput';
import { SignaturePad } from './common/SignaturePad';
import { useVerification } from '../hooks/useVerification';
import { Loader2, CheckCircle, ShieldAlert, Users, Info } from 'lucide-react';

interface StepProps {
  globalState: Partial<ApplicationState>;
  onNext: (data: Partial<ApplicationState>) => void;
  onPrev: () => void;
}

export function Step6CoApplicant({ globalState, onNext, onPrev }: StepProps) {
  const currentSchema = getSchemaForStep(6, globalState);

  // Setup spouse default logic
  const defaultRelationship = React.useMemo(() => {
    if (globalState.maritalStatus === 'Married') {
      return 'Spouse';
    }
    return '';
  }, [globalState.maritalStatus]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      coApplicantName: globalState.coApplicantName || '',
      coApplicantRelationship: globalState.coApplicantRelationship || defaultRelationship,
      coApplicantPan: globalState.coApplicantPan || '',
      coApplicantIncome: globalState.coApplicantIncome || 0,
      coApplicantConsent: globalState.coApplicantConsent || false,
      coApplicantSignature: globalState.coApplicantSignature || ''
    }
  });

  const coPanVal = watch('coApplicantPan');
  const coConsentVal = watch('coApplicantConsent');
  const coSigVal = watch('coApplicantSignature');

  const coPanVerification = useVerification('PAN');
  const [coPanVerified, setCoPanVerified] = React.useState(!!globalState.isCoApplicantPanVerified);
  const [coPanFailedMsg, setCoPanFailedMsg] = React.useState<string | null>(null);

  const handleCoPanBlur = async () => {
    if (!coPanVal) return;
    setCoPanVerified(false);
    setCoPanFailedMsg(null);
    const success = await coPanVerification.verify(coPanVal, 'Personal'); // Co-applicant PAN must be Individual ('P')
    if (success) {
      setCoPanVerified(true);
    } else {
      setCoPanFailedMsg(coPanVerification.error || 'Co-applicant PAN verification failed.');
    }
  };

  const handleFormSubmit = (data: any) => {
    if (!coPanVerified) {
      setCoPanFailedMsg('Please verify the co-applicant PAN before proceeding.');
      return;
    }
    onNext({
      ...data,
      isCoApplicantPanVerified: true,
      hasCoApplicant: true
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-white font-serif tracking-wide">Co-Applicant & Guarantor Details</h2>
        <p className="text-[#8E9299] text-xs mt-1 font-medium leading-relaxed font-sans">
          Due to your loan amount or loan type, adding a co-applicant is required. Provide secondary personal, PAN, and income details.
        </p>
      </div>

      <div className="p-4.5 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-5">
        <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
          <Users className="w-4 h-4 text-[#D4AF37]" />
          Co-Applicant Personal Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input>
            <Input.Label required>Co-Applicant Full Name (As per PAN)</Input.Label>
            <Input.Field
              placeholder="e.g. ADITI SHARMA"
              hasError={!!errors.coApplicantName}
              {...register('coApplicantName')}
            />
            <Input.Error>{errors.coApplicantName?.message}</Input.Error>
          </Input>

          <Select>
            <Select.Label required>Relationship with Primary Applicant</Select.Label>
            <Select.Field
              hasError={!!errors.coApplicantRelationship}
              {...register('coApplicantRelationship')}
            >
              <option value="">-- Choose relationship --</option>
              <option value="Spouse">Spouse (Husband / Wife)</option>
              <option value="Parent">Parent (Father / Mother)</option>
              <option value="Sibling">Sibling (Brother / Sister)</option>
              <option value="Business Partner">Business Partner</option>
            </Select.Field>
            {globalState.maritalStatus === 'Married' && (
              <span className="text-[10px] font-semibold text-emerald-700 mt-1">Defaulted relationship to Spouse as you are married.</span>
            )}
            <Select.Error>{errors.coApplicantRelationship?.message}</Select.Error>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Co-applicant PAN and verification */}
          <div className="flex flex-col gap-1.5 w-full">
            <MaskedInput
              maskType="PAN"
              label="Co-Applicant PAN Number"
              required
              value={coPanVal}
              onChange={(val) => {
                setValue('coApplicantPan', val);
                if (coPanVerified) setCoPanVerified(false);
              }}
              onBlur={handleCoPanBlur}
              error={errors.coApplicantPan?.message}
            />

            <div className="mt-1">
              {coPanVerification.isVerifying && (
                <span className="flex items-center gap-2 text-[#E0E2E5] text-xs font-semibold bg-[#1A1D23] px-3 py-2 rounded-sm border border-[#2D3036]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  Verifying Co-Applicant PAN...
                </span>
              )}
              {coPanVerified && (
                <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/20 px-3 py-2 rounded-sm border border-emerald-900/30">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Co-Applicant PAN Verified (Individual Match)
                </span>
              )}
              {coPanFailedMsg && (
                <span className="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-950/20 px-3 py-2 rounded-sm border border-rose-950/40">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
                  {coPanFailedMsg}
                </span>
              )}
            </div>
          </div>

          <CurrencyInput
            label="Co-Applicant Monthly Net Income"
            required
            value={watch('coApplicantIncome')}
            onChange={(val) => setValue('coApplicantIncome', val, { shouldValidate: true })}
            error={errors.coApplicantIncome?.message}
          />
        </div>
      </div>

      {/* Co-applicant Consent and e-Signature */}
      <div className="p-4 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-4">
        <div className="flex items-start gap-2 text-[#8E9299]">
          <Info className="w-4 h-4 text-[#8E9299] mt-0.5 flex-shrink-0" />
          <p className="text-[11px] font-semibold leading-normal font-sans">
            Co-applicants must authorize credit score checks and back the loan application. Let your co-applicant check the consent and sign inside the panel.
          </p>
        </div>

        <Checkbox
          label={<strong>I, as the Co-Applicant, hereby consent to co-sign this loan application & authorize credit checks via CIBIL/Equifax.</strong>}
          error={errors.coApplicantConsent?.message}
          checked={coConsentVal}
          onChange={(e) => setValue('coApplicantConsent', e.target.checked, { shouldValidate: true })}
        />

        {coConsentVal && (
          <div className="mt-2 animate-fade-in pointer-events-auto">
            <SignaturePad
              label="Co-Applicant Electronic Signature Drawing Pad"
              required
              value={coSigVal}
              onChange={(val) => {
                setValue('coApplicantSignature', val, { shouldValidate: true });
              }}
              error={errors.coApplicantSignature?.message?.toString()}
            />
          </div>
        )}
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
          disabled={!coPanVerified || !coConsentVal || !coSigVal}
          className={`px-6 py-2.5 rounded-sm font-bold transition cursor-pointer text-xs uppercase tracking-wider ${
            (coPanVerified && coConsentVal && coSigVal)
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
