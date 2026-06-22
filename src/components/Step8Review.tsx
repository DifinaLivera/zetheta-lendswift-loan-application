import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationState } from '../types';
import { getSchemaForStep } from '../utils/schemaFactory';
import { calculateEMI, getIndicativeInterestRate } from '../utils/emiCalculator';
import { formatIndianCurrency } from '../utils/validators';
import { Checkbox } from './common/Checkbox';
import { ErrorMessage } from './common/ErrorMessage';
import { FileCheck, CreditCard, PenTool, CheckCircle, AlertTriangle, ShieldCheck, Mail, Printer, Power } from 'lucide-react';

interface StepProps {
  globalState: Partial<ApplicationState>;
  onNext: (data: Partial<ApplicationState>) => void; // Final submit trigger
  onPrev: () => void;
  goToStep: (stepNum: number) => void;
}

export function Step8Review({ globalState, onNext, onPrev, goToStep }: StepProps) {
  const currentSchema = getSchemaForStep(8, globalState);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      consentAccuracy: globalState.consentAccuracy || false,
      consentBureauCheck: globalState.consentBureauCheck || false,
      consentTermsConditions: globalState.consentTermsConditions || false,
      consentMarketing: globalState.consentMarketing || false
    }
  });

  const accuracy = watch('consentAccuracy');
  const bureau = watch('consentBureauCheck');
  const tnc = watch('consentTermsConditions');
  const marketing = watch('consentMarketing');

  // Perform EMI math
  const P = globalState.loanAmount || 50000;
  const n = globalState.loanTenure || 12;
  const loanType = globalState.loanType || 'Personal';

  const emiResult = React.useMemo(() => {
    return calculateEMI(P, n, loanType);
  }, [P, n, loanType]);

  // Income affordability audit: EMI must not exceed 50% of net income
  // Grab applicant income
  const applicantIncome = React.useMemo(() => {
    if (globalState.employmentType === 'Salaried') {
      return globalState.monthlyNetSalary || 0;
    } else if (globalState.employmentType === 'Self-Employed') {
      return globalState.selfMonthlyIncome || 0;
    } else {
      // Business Owner
      // Estimate monthly income as annual turnover / 12
      const turnoverVal = globalState.annualTurnoverBusiness || 0;
      return Math.round(turnoverVal / 12);
    }
  }, [globalState]);

  // Combine income if co-applicant is active
  const coApplicantActive = globalState.hasCoApplicant;
  const coApplicantIncome = globalState.coApplicantIncome || 0;
  const combinedIncome = applicantIncome + (coApplicantActive ? coApplicantIncome : 0);

  const emiRatio = React.useMemo(() => {
    if (combinedIncome === 0) return 0;
    return (emiResult.emi / combinedIncome) * 100;
  }, [emiResult.emi, combinedIncome]);

  const showIncomeAffordabilityWarning = emiRatio > 50;

  const handleFormSubmit = (data: any) => {
    onNext(data);
  };

  const isConsentsAccepted = accuracy && bureau && tnc && marketing;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-white font-serif tracking-wide px-1">Review & Sign Agreement</h2>
        <p className="text-[#8E9299] text-xs mt-1 font-medium leading-relaxed font-sans px-1">
          Verify all provided details, review LendSwift's pre-approved loan summary, accept consent options, and submit your application.
        </p>
      </div>

      {/* Pre-Approval Summary Card */}
      <div className="bg-[#131418] text-white rounded-sm p-5 shadow-md flex flex-col gap-5 border border-[#2D3036]">
        <h3 className="text-sm font-bold tracking-wide text-white border-b border-[#2D3036] pb-3 flex items-center gap-2 font-serif">
          <CreditCard className="w-4 h-4 text-[#D4AF37]" />
          Pre-Approved LendSwift Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Loan Principal</span>
            <span className="text-base font-extrabold text-white">₹ {formatIndianCurrency(emiResult.loanAmount)}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Annual Interest Rate</span>
            <span className="text-base font-extrabold text-[#D4AF37]">{emiResult.interestRate.toFixed(1)}% p.a.</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Tenure Term</span>
            <span className="text-base font-extrabold text-white">{emiResult.tenure} Months</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-[#8E9299] font-bold uppercase tracking-wider">Calculated EMI</span>
            <span className="text-lg font-extrabold text-emerald-400">₹ {formatIndianCurrency(emiResult.emi)} / mo</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-[#2D3036] pt-4 text-xs font-semibold text-[#8E9299]">
          <div className="flex justify-between">
            <span>Processing fee (1%):</span>
            <strong className="text-white font-bold">₹ {formatIndianCurrency(emiResult.processingFee)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Total Interest Cost:</span>
            <strong className="text-white font-bold">₹ {formatIndianCurrency(emiResult.totalInterest)}</strong>
          </div>
        </div>

        {/* Affordability Index warnings */}
        {showIncomeAffordabilityWarning && (
          <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in font-medium">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-200 leading-tight">Affordability Index Warning (EMI exceeds 50% of Income)</p>
              <p className="mt-1 leading-normal">
                Your monthly EMI (₹ {formatIndianCurrency(emiResult.emi)}) makes up <strong className="font-bold underline">{emiRatio.toFixed(1)}%</strong> of your combined monthly household net income. Higher debt ratios carries rejection risks. Proceeding will trigger extended risk reviews.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section-by-section summaries with Edit hooks */}
      <div className="space-y-4 font-semibold text-xs text-[#E0E2E5]">
        {/* Step 1 Review */}
        <div className="p-4 border border-[#2D3036] rounded-sm flex items-center justify-between gap-3 bg-[#1A1D23]">
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase text-white font-serif tracking-wider">1. Loan & Repayment Option</h4>
            <p className="text-[11px] text-[#8E9299] font-medium font-sans mt-0.5">
              {globalState.loanType} Loan of <strong className="font-bold text-white">₹ {formatIndianCurrency(globalState.loanAmount)}</strong> for {globalState.loanTenure} Months. Purposed for {globalState.loanPurpose}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="text-xs text-[#D4AF37] hover:text-[#E5C158] hover:underline font-bold px-3 py-1.5 border border-[#2D3036] bg-[#0A0B0D] hover:bg-[#131418] rounded-sm cursor-pointer transition uppercase tracking-wider text-[10px]"
          >
            Edit Fields
          </button>
        </div>

        {/* Step 2 Review */}
        <div className="p-4 border border-[#2D3036] rounded-sm flex items-center justify-between gap-3 bg-[#1A1D23]">
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase text-white font-serif tracking-wider">2. Profile Information</h4>
            <p className="text-[11px] text-[#8E9299] font-medium font-sans mt-0.5">
              Name: {globalState.fullName} | DOB: {globalState.dob} | Gender: {globalState.gender} | Contact: {globalState.mobileNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(2)}
            className="text-xs text-[#D4AF37] hover:text-[#E5C158] hover:underline font-bold px-3 py-1.5 border border-[#2D3036] bg-[#0A0B0D] hover:bg-[#131418] rounded-sm cursor-pointer transition uppercase tracking-wider text-[10px]"
          >
            Edit Fields
          </button>
        </div>

        {/* Step 3 KYC Review */}
        <div className="p-4 border border-[#2D3036] rounded-sm flex items-center justify-between gap-3 bg-[#1A1D23]">
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase text-white font-serif tracking-wide">3. Verified KYC Records</h4>
            <p className="text-[11px] text-[#8E9299] font-medium font-sans mt-0.5">
              PAN Card: {globalState.panNumber?.slice(0, 4)}•••••• | Aadhaar Card: •••• •••• {globalState.aadhaarNumber?.slice(-4)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="text-xs text-[#D4AF37] hover:text-[#E5C158] hover:underline font-bold px-3 py-1.5 border border-[#2D3036] bg-[#0A0B0D] hover:bg-[#131418] rounded-sm cursor-pointer transition uppercase tracking-wider text-[10px]"
          >
            Edit Fields
          </button>
        </div>

        {/* Step 4 Addresses */}
        <div className="p-4 border border-[#2D3036] rounded-sm flex items-center justify-between gap-3 bg-[#1A1D23]">
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase text-white font-serif tracking-wide">4. Residential Address</h4>
            <p className="text-[11px] text-[#8E9299] font-medium font-sans mt-0.5">
              Address: {globalState.currentAddressLine1}, PIN {globalState.pinCode}, {globalState.city}, {globalState.state} ({globalState.residenceType})
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="text-xs text-[#D4AF37] hover:text-[#E5C158] hover:underline font-bold px-3 py-1.5 border border-[#2D3036] bg-[#0A0B0D] hover:bg-[#131418] rounded-sm cursor-pointer transition uppercase tracking-wider text-[10px]"
          >
            Edit Fields
          </button>
        </div>

        {/* Step 5 Income Profiles */}
        <div className="p-4 border border-[#2D3036] rounded-sm flex items-center justify-between gap-3 bg-[#1A1D23]">
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase text-white font-serif tracking-wide">5. Primary Wealth & Occupation</h4>
            <p className="text-[11px] text-[#8E9299] font-medium font-sans mt-0.5">
              Stream: {globalState.employmentType} | {globalState.employmentType === 'Salaried' 
                ? `Firm: ${globalState.companyName} | Salary: ₹ ${formatIndianCurrency(globalState.monthlyNetSalary || 0)}/mo` 
                : globalState.employmentType === 'Self-Employed'
                ? `Profession: ${globalState.profession} | Income: ₹ ${formatIndianCurrency(globalState.selfMonthlyIncome || 0)}/mo`
                : `Business: ${globalState.businessName} (GST: ${globalState.gstNumber})`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(5)}
            className="text-xs text-[#D4AF37] hover:text-[#E5C158] hover:underline font-bold px-3 py-1.5 border border-[#2D3036] bg-[#0A0B0D] hover:bg-[#131418] rounded-sm cursor-pointer transition uppercase tracking-wider text-[10px]"
          >
            Edit Fields
          </button>
        </div>

        {/* Step 6 Co-Applicant Co-Signer Section (conditional review) */}
        {coApplicantActive && (
          <div className="p-4 border border-[#2D3036] rounded-sm flex items-center justify-between gap-3 bg-emerald-950/10">
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase text-emerald-400 font-serif tracking-wide">6. Co-Applicant / Guarantor</h4>
              <p className="text-[11px] text-[#8E9299] font-medium font-sans mt-0.5">
                Name: {globalState.coApplicantName} ({globalState.coApplicantRelationship}) | Net Income: ₹ {formatIndianCurrency(globalState.coApplicantIncome)} | PAN: {globalState.coApplicantPan}
              </p>
            </div>
            <button
              type="button"
              onClick={() => goToStep(6)}
              className="text-xs text-[#D4AF37] hover:text-[#E5C158] hover:underline font-bold px-3 py-1.5 border border-[#2D3036] bg-[#0A0B0D] hover:bg-[#131418] rounded-sm cursor-pointer transition uppercase tracking-wider text-[10px]"
            >
              Edit Fields
            </button>
          </div>
        )}
      </div>

      {/* Dual e-Signature review pane */}
      <div className="p-4 bg-[#1A1D23] border border-[#2D3036] rounded-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 items-center justify-center p-3 bg-[#0A0B0D] border border-[#2D3036] rounded-sm">
          <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-wider">Primary Applicant Signature</span>
          {globalState.applicantSignature ? (
            <img 
              src={globalState.applicantSignature} 
              alt="Applicant Signature" 
              referrerPolicy="no-referrer"
              className="max-h-20 w-fit object-contain border border-dashed border-[#2D3036] rounded mt-1 bg-white opacity-85" 
            />
          ) : (
            <p className="text-rose-500 text-xs font-semibold">Missing Signature</p>
          )}
        </div>

        {coApplicantActive && (
          <div className="flex flex-col gap-1 items-center justify-center p-3 bg-[#0A0B0D] border border-[#2D3036] rounded-sm">
            <span className="text-[9px] font-bold text-[#8E9299] uppercase tracking-wider">Co-Applicant Signature</span>
            {globalState.coApplicantSignature ? (
              <img 
                src={globalState.coApplicantSignature} 
                alt="Co-Applicant Signature" 
                referrerPolicy="no-referrer"
                className="max-h-20 w-fit object-contain border border-dashed border-[#2D3036] rounded mt-1 bg-white opacity-85" 
              />
            ) : (
              <p className="text-rose-500 text-xs font-semibold">Missing Signature</p>
            )}
          </div>
        )}
      </div>

      {/* Consent checkpoints */}
      <div className="p-4 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-3.5">
        <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-serif">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          Mandatory Legal Consent Checklist
        </span>

        <Checkbox
          label={<strong>I confirm all information provided in this 8-step application is accurate and true to my knowledge.</strong>}
          error={errors.consentAccuracy?.message}
          checked={accuracy}
          onChange={(e) => setValue('consentAccuracy', e.target.checked, { shouldValidate: true })}
        />

        <Checkbox
          label={<strong>I authorise LendSwift to fetch my credit bureau reports (via CIBIL / Equifax) to run risk credit underwriting assessments.</strong>}
          error={errors.consentBureauCheck?.message}
          checked={bureau}
          onChange={(e) => setValue('consentBureauCheck', e.target.checked, { shouldValidate: true })}
        />

        <Checkbox
          label={<span>I agree to the LendSwift <a href="#" onClick={(e) => { e.preventDefault(); alert("Opening LendSwift Terms and Conditions documentation..."); }} className="text-[#D4AF37] hover:text-[#E5C158] underline font-bold">Terms and Conditions</a>, Privacy Policy guidelines and agree to lock my digital draft under 72h TTL policies.</span>}
          error={errors.consentTermsConditions?.message}
          checked={tnc}
          onChange={(e) => setValue('consentTermsConditions', e.target.checked, { shouldValidate: true })}
        />

        <Checkbox
          label={<strong>I consent to receive communication updates regarding my application status via SMS, WhatsApp, and Email.</strong>}
          error={errors.consentMarketing?.message}
          checked={marketing}
          onChange={(e) => setValue('consentMarketing', e.target.checked, { shouldValidate: true })}
        />
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
          disabled={!isConsentsAccepted}
          className={`px-6 py-2.5 rounded-sm font-bold transition cursor-pointer text-xs uppercase tracking-wider ${
            isConsentsAccepted 
              ? 'bg-[#D4AF37] text-[#0A0B0D] hover:bg-[#E5C158] shadow-[0_0_12px_rgba(212,175,55,0.15)]' 
              : 'bg-[#1A1D23] text-[#8E9299]/30 border border-[#2D3036] cursor-not-allowed'
          }`}
        >
          Submit Loan Application
        </button>
      </div>
    </form>
  );
}
