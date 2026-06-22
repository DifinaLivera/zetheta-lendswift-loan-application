import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationState } from '../types';
import { getSchemaForStep } from '../utils/schemaFactory';
import { RadioGroup } from './common/RadioGroup';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { CurrencyInput } from './common/CurrencyInput';
import { usePinCodeLookup } from '../hooks/usePinCodeLookup';
import { Briefcase, Activity, Landmark, Loader2, MapPin } from 'lucide-react';

interface StepProps {
  globalState: Partial<ApplicationState>;
  onNext: (data: Partial<ApplicationState>) => void;
  onPrev: () => void;
}

export function Step5Employment({ globalState, onNext, onPrev }: StepProps) {
  const currentSchema = getSchemaForStep(5, globalState);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      employmentType: globalState.employmentType || (globalState.loanType === 'Business' ? 'Business Owner' : 'Salaried'),
      
      companyName: globalState.companyName || '',
      designation: globalState.designation || '',
      monthlyNetSalary: globalState.monthlyNetSalary || 0,
      yearsOfExperience: globalState.yearsOfExperience || 0,

      profession: globalState.profession || '',
      selfMonthlyIncome: globalState.selfMonthlyIncome || 0,
      yearsInPractice: globalState.yearsInPractice || 0,
      annualTurnoverSelf: globalState.annualTurnoverSelf || 0,

      businessName: globalState.businessName || '',
      businessType: globalState.businessType || '',
      annualTurnoverBusiness: globalState.annualTurnoverBusiness || 0,
      yearsInBusiness: globalState.yearsInBusiness || 0,
      gstNumber: globalState.gstNumber || '',
      officeAddressLine1: globalState.officeAddressLine1 || '',
      officeAddressLine2: globalState.officeAddressLine2 || '',
      officePinCode: globalState.officePinCode || '',
      officeCity: globalState.officeCity || '',
      officeState: globalState.officeState || ''
    }
  });

  const empType = watch('employmentType');
  const businessPin = watch('officePinCode');

  // Autocomplete mocks for Company Name if Salaried
  const [companySearch, setCompanySearch] = React.useState(globalState.companyName || '');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const companySuggestions = [
    'Tata Consultancy Services (TCS)',
    'Infosys Limited',
    'Wipro Technologies',
    'Reliance Industries Limited',
    'HDFC Bank Limited',
    'ICICI Bank Limited',
    'State Bank of India (SBI)',
    'Cognizant Technology Solutions',
    'Accenture Private Limited',
    'HCL Technologies'
  ];

  const filteredCompanies = React.useMemo(() => {
    if (!companySearch) return [];
    return companySuggestions.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()));
  }, [companySearch]);

  const selectCompany = (name: string) => {
    setCompanySearch(name);
    setValue('companyName', name, { shouldValidate: true });
    setShowSuggestions(false);
  };

  const { lookup: pinLookup, isLoading: isOfficePinLoading } = usePinCodeLookup();

  // Look up office pin code
  React.useEffect(() => {
    if (businessPin && businessPin.length === 6 && /^\d{6}$/.test(businessPin)) {
      pinLookup(businessPin).then((data) => {
        if (data) {
          setValue('officeCity', data.city, { shouldValidate: true });
          setValue('officeState', data.state, { shouldValidate: true });
        }
      });
    }
  }, [businessPin, pinLookup, setValue]);

  const handleFormSubmit = (data: any) => {
    // Inject the selected company name if salaried
    const finalData = empType === 'Salaried' ? { ...data, companyName: companySearch } : data;
    onNext(finalData);
  };

  const isBusinessLoan = globalState.loanType === 'Business';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-white font-serif tracking-wide">Employment & Income Details</h2>
        <p className="text-[#8E9299] text-xs mt-1 font-medium leading-relaxed font-sans">
          Provide your primary stream of income. Compliance rules forbid Salaried applicants from procuring Business Loans.
        </p>
      </div>

      {/* Employment Type Radios */}
      <RadioGroup
        name="employmentType"
        label="Select Employment Type"
        required
        layout="grid"
        value={empType}
        onChange={(val) => {
          setValue('employmentType', val as any, { shouldValidate: true });
        }}
        error={errors.employmentType?.message}
        options={[
          {
            value: 'Salaried',
            label: 'Salaried Employee',
            description: 'Employed at a private/public firm. Required min ₹15,000 net income.',
            icon: <Briefcase className="w-5 h-5 text-blue-600" />
          },
          ...(!isBusinessLoan ? [
            {
              value: 'Self-Employed',
              label: 'Self-Employed Professional',
              description: 'Independent Doctor, CA, Consultant, Lawyer, etc. Min 2 yrs practice.',
              icon: <Activity className="w-5 h-5 text-emerald-600" />
            }
          ] : [
            {
              value: 'Self-Employed',
              label: 'Self-Employed Professional',
              description: 'Independent Doctor, CA, Consultant, Lawyer, etc. Min 2 yrs practice.',
              icon: <Activity className="w-5 h-5 text-emerald-600" />
            }
          ]),
          {
            value: 'Business Owner',
            label: 'Business Owner / Entrepreneur',
            description: 'Sole proprietor, Director or Partner in an registered business.',
            icon: <Landmark className="w-5 h-5 text-purple-600" />
          }
        ]}
      />

      {/* Dynamic Sub-forms based on Employment Type */}

      {/* 1. Salaried Sub-form */}
      {empType === 'Salaried' && (
        <div className="p-4.5 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-5 animate-fade-in text-sm">
          <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#D4AF37]" />
            Salaried Corporate Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pointer-events-auto">
            {/* Corporate Employer with suggestions list */}
            <div className="relative flex flex-col gap-1.5 w-full">
              <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8E9299] leading-tight">
                Company Name / Legal Corporate Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={companySearch}
                onChange={(e) => {
                  setCompanySearch(e.target.value);
                  setValue('companyName', e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Type employer name (e.g. Infosys, TCS)"
                className={`w-full px-4 py-3.5 rounded-sm border bg-[#1A1D23] text-[#E0E2E5] text-sm font-semibold transition-all duration-200 outline-none
                  placeholder:text-[#8E9299]/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50
                  ${errors.companyName ? 'border-rose-500/80' : 'border-[#2D3036]'}
                `}
              />
              {showSuggestions && filteredCompanies.length > 0 && (
                <div className="absolute top-[100%] left-0 right-0 max-h-48 overflow-y-auto bg-[#1A1D23] border border-[#2D3036] rounded-sm shadow-xl z-50 py-1 font-semibold text-xs text-[#E0E2E5]">
                  {filteredCompanies.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onMouseDown={() => selectCompany(c)}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#2D3036] text-[#E0E2E5] hover:text-white cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {errors.companyName && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.companyName.message}</p>}
            </div>

            <Input>
              <Input.Label required>Designation</Input.Label>
              <Input.Field
                placeholder="e.g. Software Engineer, Sales Lead"
                hasError={!!errors.designation}
                {...register('designation')}
              />
              <Input.Error>{errors.designation?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CurrencyInput
              label="Monthly Net Take-Home Salary"
              required
              value={watch('monthlyNetSalary')}
              onChange={(val) => setValue('monthlyNetSalary', val, { shouldValidate: true })}
              error={errors.monthlyNetSalary?.message}
              helpText="Your in-hand bank credit salary after tax and PF deductions (Min ₹15,000)."
            />

            <Input>
              <Input.Label required>Total Corporate Work Experience (Years)</Input.Label>
              <Input.Field
                type="number"
                placeholder="e.g. 5"
                hasError={!!errors.yearsOfExperience}
                {...register('yearsOfExperience', { valueAsNumber: true })}
              />
              <Input.Error>{errors.yearsOfExperience?.message}</Input.Error>
            </Input>
          </div>
        </div>
      )}

      {/* 2. Self-Employed Sub-form */}
      {empType === 'Self-Employed' && (
        <div className="p-4.5 bg-emerald-950/10 border border-[#2D3036] rounded-sm flex flex-col gap-5 animate-fade-in text-sm border-emerald-950/30">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 font-serif">
            <Activity className="w-4 h-4 text-emerald-400" />
            Independent Professional Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select>
              <Select.Label required>Profession / Line of Practice</Select.Label>
              <Select.Field
                hasError={!!errors.profession}
                {...register('profession')}
              >
                <option value="">-- Choose profession --</option>
                <option value="Medical Doctor">Medical Practitioner / Doctor</option>
                <option value="Chartered Accountant">Chartered Accountant (CA)</option>
                <option value="Advocate / Lawyer">Advocate / Corporate Lawyer</option>
                <option value="IT Consultant">Independent IT / Business Consultant</option>
                <option value="Architect">Architect / Contractor</option>
                <option value="Other">Other Self-Employed Professional</option>
              </Select.Field>
              <Select.Error>{errors.profession?.message}</Select.Error>
            </Select>

            <CurrencyInput
              label="Estimated Monthly Net Income"
              required
              value={watch('selfMonthlyIncome')}
              onChange={(val) => setValue('selfMonthlyIncome', val, { shouldValidate: true })}
              error={errors.selfMonthlyIncome?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CurrencyInput
              label="Annual Turnorver / Receipts"
              required
              value={watch('annualTurnoverSelf')}
              onChange={(val) => setValue('annualTurnoverSelf', val, { shouldValidate: true })}
              error={errors.annualTurnoverSelf?.message}
              helpText="Minimum required gross annual turnover is ₹3 Lakhs (₹3,00,000)."
            />

            <Input>
              <Input.Label required>Years in Active Professional Practice</Input.Label>
              <Input.Field
                type="number"
                placeholder="e.g. 3"
                hasError={!!errors.yearsInPractice}
                {...register('yearsInPractice', { valueAsNumber: true })}
              />
              <Input.HelpText>Minimum required duration of continuous practice is 2 years.</Input.HelpText>
              <Input.Error>{errors.yearsInPractice?.message}</Input.Error>
            </Input>
          </div>
        </div>
      )}

      {/* 3. Business Owner Sub-form */}
      {empType === 'Business Owner' && (
        <div className="p-4.5 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-5 animate-fade-in text-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
            <Landmark className="w-4 h-4 text-[#D4AF37]" />
            Registered Business Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input>
              <Input.Label required>Registered Enterprise Name</Input.Label>
              <Input.Field
                placeholder="e.g. Acme Retailers Private Limited"
                hasError={!!errors.businessName}
                {...register('businessName')}
              />
              <Input.Error>{errors.businessName?.message}</Input.Error>
            </Input>

            <Select>
              <Select.Label required>Business Constitution Style</Select.Label>
              <Select.Field
                hasError={!!errors.businessType}
                {...register('businessType')}
              >
                <option value="">-- Choose structure --</option>
                <option value="Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership Company / LLP</option>
                <option value="Pvt Ltd">Private Limited Company (Pvt Ltd)</option>
                <option value="Public Ltd">Public Limited Enterprise</option>
              </Select.Field>
              <Select.Error>{errors.businessType?.message}</Select.Error>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CurrencyInput
              label="Annual Audited Gross Turnover"
              required
              value={watch('annualTurnoverBusiness')}
              onChange={(val) => setValue('annualTurnoverBusiness', val, { shouldValidate: true })}
              error={errors.annualTurnoverBusiness?.message}
              helpText="Minimum requirements: ₹3,00,000 turnover."
            />

            <Input>
              <Input.Label required>Years in Active Business Operation</Input.Label>
              <Input.Field
                type="number"
                placeholder="e.g. 4"
                hasError={!!errors.yearsInBusiness}
                {...register('yearsInBusiness', { valueAsNumber: true })}
              />
              <Input.HelpText>Min 2 years active.</Input.HelpText>
              <Input.Error>{errors.yearsInBusiness?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label required>Enterprise GSTIN Number</Input.Label>
              <Input.Field
                placeholder="e.g. 29AAAAA1111A1Z1"
                maxLength={15}
                hasError={!!errors.gstNumber}
                {...register('gstNumber')}
              />
              <Input.HelpText>15-char format. State code + PAN + entity + Z + check.</Input.HelpText>
              <Input.Error>{errors.gstNumber?.message}</Input.Error>
            </Input>
          </div>

          {/* Business Office Address Sub-Block */}
          <div className="pt-3 border-t border-purple-100 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-purple-700" />
              Office / Registered Business Address details
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              <Input>
                <Input.Label required>Office PIN Code</Input.Label>
                <div className="relative">
                  <Input.Field
                    placeholder="e.g. 560001"
                    maxLength={6}
                    hasError={!!errors.officePinCode}
                    {...register('officePinCode')}
                  />
                  {isOfficePinLoading && (
                    <div className="absolute right-3.5 top-3 pointer-events-none">
                      <Loader2 className="w-4 h-3.5 animate-spin text-[#D4AF37]" />
                    </div>
                  )}
                </div>
                <Input.Error>{errors.officePinCode?.message}</Input.Error>
              </Input>

              <Input>
                <Input.Label required>Office City</Input.Label>
                <Input.Field
                  placeholder="Auto-filled"
                  hasError={!!errors.officeCity}
                  {...register('officeCity')}
                />
                <Input.Error>{errors.officeCity?.message}</Input.Error>
              </Input>

              <Input>
                <Input.Label required>Office State</Input.Label>
                <Input.Field
                  placeholder="Auto-filled"
                  hasError={!!errors.officeState}
                  {...register('officeState')}
                />
                <Input.Error>{errors.officeState?.message}</Input.Error>
              </Input>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <Input>
                <Input.Label required>Office Line 1 (Building, Room, Floor)</Input.Label>
                <Input.Field
                  placeholder="e.g. Office 10A, Tech Plaza"
                  hasError={!!errors.officeAddressLine1}
                  {...register('officeAddressLine1')}
                />
                <Input.Error>{errors.officeAddressLine1?.message}</Input.Error>
              </Input>

              <Input>
                <Input.Label>Office Line 2 (Optional)</Input.Label>
                <Input.Field
                  placeholder="e.g. Industrial Layout Phase II"
                  hasError={!!errors.officeAddressLine2}
                  {...register('officeAddressLine2')}
                />
                <Input.Error>{errors.officeAddressLine2?.message}</Input.Error>
              </Input>
            </div>
          </div>
        </div>
      )}

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
          className="px-6 py-2.5 bg-[#D4AF37] text-[#0A0B0D] rounded-sm font-bold hover:bg-[#E5C158] transition cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.15)] text-xs uppercase tracking-wider"
        >
          Save & Proceed
        </button>
      </div>
    </form>
  );
}
