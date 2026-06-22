import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoanType, ApplicationState } from '../types';
import { getSchemaForStep } from '../utils/schemaFactory';
import { RadioGroup } from './common/RadioGroup';
import { CurrencyInput } from './common/CurrencyInput';
import { Select } from './common/Select';
import { Input } from './common/Input';
import { Shield, Home, Briefcase } from 'lucide-react';

interface StepProps {
  globalState: Partial<ApplicationState>;
  onNext: (data: Partial<ApplicationState>) => void;
  onPrev?: () => void;
}

export function Step1LoanType({ globalState, onNext }: StepProps) {
  const currentSchema = getSchemaForStep(1, globalState);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      loanType: globalState.loanType || 'Personal',
      loanAmount: globalState.loanAmount || 0,
      loanTenure: globalState.loanTenure || 0,
      loanPurpose: globalState.loanPurpose || '',
      referralCode: globalState.referralCode || ''
    }
  });

  const selectedType = watch('loanType') as LoanType;
  const currentAmount = watch('loanAmount');

  // Purpose options based on loan type
  const purposeOptions: Record<LoanType, { value: string; label: string }[]> = {
    Personal: [
      { value: 'Medical', label: 'Medical Emergency' },
      { value: 'Education', label: 'Higher Education' },
      { value: 'Wedding', label: 'Wedding / Marriage Expenses' },
      { value: 'Travel', label: 'Holiday & Vacation Travel' },
      { value: 'Other', label: 'Consolidation / Other Personal Expenses' }
    ],
    Home: [
      { value: 'Purchase of Flat', label: 'Purchase of Flat / Apartment' },
      { value: 'Construction', label: 'Construction of Residential House' },
      { value: 'Plot Purchase', label: 'Plot Purchase & Construction' },
      { value: 'Renovation', label: 'Home Renovation / Improvement' }
    ],
    Business: [
      { value: 'Working Capital', label: 'Working Capital / Daily Operations' },
      { value: 'Expansion', label: 'Business Expansion / Branch Setup' },
      { value: 'Equipment Purchase', label: 'Machinery or Equipment Financing' },
      { value: 'Marketing', label: 'Marketing & Digital Branding Campaigns' }
    ]
  };

  const tenureOptions = React.useMemo(() => {
    if (selectedType === 'Personal') {
      return Array.from({ length: 5 }, (_, i) => ({
        value: String((i + 1) * 12),
        label: `${i + 1} Yr (${(i + 1) * 12} Months)`
      }));
    } else if (selectedType === 'Home') {
      return Array.from({ length: 6 }, (_, i) => {
        const years = (i + 1) * 5;
        return {
          value: String(years * 12),
          label: `${years} Yrs (${years * 12} Months)`
        };
      });
    } else {
      // Business: 12 to 120 (1 to 10 years)
      return Array.from({ length: 10 }, (_, i) => ({
        value: String((i + 1) * 12),
        label: `${i + 1} Yr (${(i + 1) * 12} Months)`
      }));
    }
  }, [selectedType]);

  // Adjust tenure and purpose choices when loan type alters
  React.useEffect(() => {
    // Reset tenure and purpose to avoid validation overflows
    setValue('loanTenure', 0);
    setValue('loanPurpose', '');
  }, [selectedType, setValue]);

  const handleFormSubmit = (data: any) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-white font-serif tracking-wide">Select Loan Type & Amount</h2>
        <p className="text-[#8E9299] text-xs mt-1 font-medium leading-relaxed font-sans">
          Begin your application by choosing the financial product suited to your requirements. Keep in mind that loan limits are RBI-compliant.
        </p>
      </div>

      {/* Loan Type Selector */}
      <RadioGroup
        name="loanType"
        label="What kind of financing are you looking for?"
        required
        layout="grid"
        value={selectedType}
        onChange={(val) => setValue('loanType', val as LoanType, { shouldValidate: true })}
        error={errors.loanType?.message}
        options={[
          {
            value: 'Personal',
            label: 'Personal Loan',
            description: 'Unsecured financing up to ₹10 Lakhs. Tenure 12-60m.',
            icon: <Shield className="w-5 h-5 text-blue-600" />
          },
          {
            value: 'Home',
            label: 'Home Loan',
            description: 'Build or purchase your dream property up to ₹1 Crore. Tenure 5-30 years.',
            icon: <Home className="w-5 h-5 text-emerald-600" />
          },
          {
            value: 'Business',
            label: 'Business Loan',
            description: 'Grow your enterprise with up to ₹50 Lakhs. Tenure 12-120m.',
            icon: <Briefcase className="w-5 h-5 text-orange-600" />
          }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Loan Amount Input */}
        <CurrencyInput
          label="Loan Amount Required"
          required
          value={currentAmount}
          onChange={(val) => setValue('loanAmount', val, { shouldValidate: true })}
          error={errors.loanAmount?.message}
          helpText={`Limit for ${selectedType} Loans: Min ₹50,000 to Max ${
            selectedType === 'Personal' ? '₹10 Lakhs' : selectedType === 'Home' ? '₹1 Crore' : '₹50 Lakhs'
          }`}
        />

        {/* Loan Tenure Dropdown */}
        <Select>
          <Select.Label required>Loan Repayment Tenure</Select.Label>
          <Select.Field
            hasError={!!errors.loanTenure}
            {...register('loanTenure', { valueAsNumber: true })}
          >
            <option value="0">-- Select Tenure --</option>
            {tenureOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select.Field>
          <Select.Error>{errors.loanTenure?.message}</Select.Error>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Loan Purpose */}
        <Select>
          <Select.Label required>Purpose of Loan</Select.Label>
          <Select.Field
            hasError={!!errors.loanPurpose}
            {...register('loanPurpose')}
          >
            <option value="">-- Choose Purpose --</option>
            {purposeOptions[selectedType]?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select.Field>
          <Select.Error>{errors.loanPurpose?.message}</Select.Error>
        </Select>

        {/* Referral Code (Optional) */}
        <Input>
          <Input.Label>Referral Code (Optional)</Input.Label>
          <Input.Field
            placeholder="e.g. LEND100X"
            hasError={!!errors.referralCode}
            {...register('referralCode')}
          />
          <Input.HelpText>6-10 alphanumeric characters, if you were referred by an agent or friend.</Input.HelpText>
          <Input.Error>{errors.referralCode?.message}</Input.Error>
        </Input>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#2D3036]">
        <button
          type="submit"
          className="px-6 py-3 bg-[#D4AF37] text-[#0A0B0D] rounded-sm font-bold hover:bg-[#E5C158] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] text-xs uppercase tracking-wider"
        >
          Save & Proceed
        </button>
      </div>
    </form>
  );
}
