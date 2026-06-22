import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationState } from '../types';
import { getSchemaForStep } from '../utils/schemaFactory';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { RadioGroup } from './common/RadioGroup';
import { Mail, Phone, Calendar, CheckCircle, Smartphone } from 'lucide-react';

interface StepProps {
  globalState: Partial<ApplicationState>;
  onNext: (data: Partial<ApplicationState>) => void;
  onPrev: () => void;
}

export function Step2PersonalInfo({ globalState, onNext, onPrev }: StepProps) {
  const currentSchema = getSchemaForStep(2, globalState);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      fullName: globalState.fullName || '',
      dob: globalState.dob || '',
      gender: globalState.gender || '',
      maritalStatus: globalState.maritalStatus || '',
      fathersName: globalState.fathersName || '',
      mothersName: globalState.mothersName || '',
      email: globalState.email || '',
      mobileNumber: globalState.mobileNumber || '',
      alternateMobile: globalState.alternateMobile || ''
    }
  });

  const emailVal = watch('email');
  const mobileVal = watch('mobileNumber');

  // Verify simulations state
  const [emailVerifying, setEmailVerifying] = React.useState(false);
  const [emailVerified, setEmailVerified] = React.useState(!!globalState.isMobileVerified); // reuse verified state
  const [showEmailOtp, setShowEmailOtp] = React.useState(false);
  const [emailOtp, setEmailOtp] = React.useState('');

  const [mobileVerifying, setMobileVerifying] = React.useState(false);
  const [mobileVerified, setMobileVerified] = React.useState(!!globalState.isMobileVerified);
  const [showMobileOtp, setShowMobileOtp] = React.useState(false);
  const [mobileOtp, setMobileOtp] = React.useState('');

  const handleSendEmailOtp = () => {
    if (!emailVal || errors.email) return;
    setEmailVerifying(true);
    setTimeout(() => {
      setEmailVerifying(false);
      setShowEmailOtp(true);
    }, 1000);
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtp === '1234') {
      setEmailVerified(true);
      setShowEmailOtp(false);
    } else {
      alert("Please enter the demo OTP: 1234");
    }
  };

  const handleSendMobileOtp = () => {
    if (!mobileVal || errors.mobileNumber) return;
    setMobileVerifying(true);
    setTimeout(() => {
      setMobileVerifying(false);
      setShowMobileOtp(true);
    }, 1000);
  };

  const handleVerifyMobileOtp = () => {
    if (mobileOtp === '1234') {
      setMobileVerified(true);
      setShowMobileOtp(false);
      setValue('isMobileVerified', true as any);
    } else {
      alert("Please enter the demo OTP: 1234");
    }
  };

  const handleFormSubmit = (data: any) => {
    onNext({
      ...data,
      isMobileVerified: mobileVerified
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-white font-serif tracking-wide">Personal Information</h2>
        <p className="text-[#8E9299] text-xs mt-1 font-medium leading-relaxed font-sans">
          Provide your individual details. These will be verified against your credit and identity records dynamically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <Input>
          <Input.Label required>Full Name (as per PAN)</Input.Label>
          <Input.Field
            placeholder="e.g. ARJUN KUMAR"
            hasError={!!errors.fullName}
            {...register('fullName')}
          />
          <Input.HelpText>Must exactly match spelling on your PAN card. Letters & periods only.</Input.HelpText>
          <Input.Error>{errors.fullName?.message}</Input.Error>
        </Input>

        {/* Date of Birth */}
        <Input>
          <Input.Label required>Date of Birth</Input.Label>
          <div className="relative">
            <Input.Field
              type="date"
              hasError={!!errors.dob}
              {...register('dob')}
            />
          </div>
          <Input.HelpText>Min age 21 to Max 65 years at time of application.</Input.HelpText>
          <Input.Error>{errors.dob?.message}</Input.Error>
        </Input>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gender */}
        <RadioGroup
          name="gender"
          label="Gender"
          required
          value={watch('gender')}
          onChange={(val) => setValue('gender', val, { shouldValidate: true })}
          error={errors.gender?.message}
          options={[
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other/Diverse' }
          ]}
        />

        {/* Marital Status */}
        <Select>
          <Select.Label required>Marital Status</Select.Label>
          <Select.Field
            hasError={!!errors.maritalStatus}
            {...register('maritalStatus')}
          >
            <option value="">-- Choose marital status --</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </Select.Field>
          <Select.Error>{errors.maritalStatus?.message}</Select.Error>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Father's Name */}
        <Input>
          <Input.Label required>Father's Name (Full)</Input.Label>
          <Input.Field
            placeholder="e.g. RAJESH KUMAR"
            hasError={!!errors.fathersName}
            {...register('fathersName')}
          />
          <Input.Error>{errors.fathersName?.message}</Input.Error>
        </Input>

        {/* Mother's Name */}
        <Input>
          <Input.Label required>Mother's Name (Full Name)</Input.Label>
          <Input.Field
            placeholder="e.g. SUNITA KUMARI"
            hasError={!!errors.mothersName}
            {...register('mothersName')}
          />
          <Input.Error>{errors.mothersName?.message}</Input.Error>
        </Input>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Email Address */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8E9299] flex items-center gap-1.5 leading-tight">
            Email Address <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="e.g. name@example.com"
              className={`w-full px-4 py-3.5 rounded-sm border bg-[#1A1D23] text-[#E0E2E5] text-sm font-semibold pr-24 transition-all duration-200 outline-none
                placeholder:text-[#8E9299]/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50
                ${errors.email ? 'border-rose-500/80' : 'border-[#2D3036]'}
              `}
              {...register('email')}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              {emailVerified ? (
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mr-1 bg-emerald-950/20 px-2 py-1 rounded-sm border border-emerald-900/30">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  disabled={!emailVal || !!errors.email || emailVerifying}
                  onClick={handleSendEmailOtp}
                  className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0B0D] font-bold text-xs rounded-sm disabled:bg-[#1A1D23] disabled:text-[#8E9299]/40 transition duration-150 cursor-pointer"
                >
                  {emailVerifying ? 'Sending...' : 'Verify'}
                </button>
              )}
            </div>
          </div>
          {showEmailOtp && (
            <div className="mt-2 p-3 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex items-center justify-between gap-3 animate-fade-in text-[#E0E2E5]">
              <span className="text-xs text-[#8E9299] font-semibold">Demo code is <strong className="font-bold underline text-[#D4AF37]">1234</strong></span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="w-16 px-2 py-1 text-xs border border-[#2D3036] rounded-sm text-center bg-[#0F1115] text-[#E0E2E5] font-bold outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={handleVerifyEmailOtp}
                  className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0B0D] rounded-sm text-xs font-bold cursor-pointer"
                >
                  Check
                </button>
              </div>
            </div>
          )}
          {errors.email && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Primary Mobile Number */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8E9299] flex items-center gap-1.5 leading-tight">
            Mobile Number (10 digit) <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              maxLength={10}
              className={`w-full px-4 py-3.5 rounded-sm border bg-[#1A1D23] text-[#E0E2E5] text-sm font-semibold pr-24 transition-all duration-200 outline-none
                placeholder:text-[#8E9299]/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50
                ${errors.mobileNumber ? 'border-rose-500/80' : 'border-[#2D3036]'}
              `}
              {...register('mobileNumber')}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              {mobileVerified ? (
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mr-1 bg-emerald-950/20 px-2 py-1 rounded-sm border border-emerald-900/30">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  disabled={!mobileVal || !!errors.mobileNumber || mobileVerifying}
                  onClick={handleSendMobileOtp}
                  className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0B0D] font-bold text-xs rounded-sm disabled:bg-[#1A1D23] disabled:text-[#8E9299]/40 transition duration-150 cursor-pointer"
                >
                  {mobileVerifying ? 'Sending...' : 'Get OTP'}
                </button>
              )}
            </div>
          </div>
          {showMobileOtp && (
            <div className="mt-2 p-3 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex items-center justify-between gap-3 animate-fade-in text-[#E0E2E5]">
              <span className="text-xs text-[#8E9299] font-semibold">Demo code sent! Enter <strong className="font-bold underline text-[#D4AF37]">1234</strong></span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="OTP"
                  value={mobileOtp}
                  onChange={(e) => setMobileOtp(e.target.value)}
                  className="w-16 px-2 py-1 text-xs border border-[#2D3036] rounded-sm text-center bg-[#0F1115] text-[#E0E2E5] font-bold outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={handleVerifyMobileOtp}
                  className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0B0D] rounded-sm text-xs font-bold cursor-pointer"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}
          {errors.mobileNumber && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.mobileNumber.message}</p>}
        </div>
      </div>

      {/* Alternate Mobile */}
      <Input>
        <Input.Label>Alternate Mobile Number (Optional)</Input.Label>
        <Input.Field
          placeholder="e.g. 9876543211"
          maxLength={10}
          hasError={!!errors.alternateMobile}
          {...register('alternateMobile')}
        />
        <Input.HelpText>Must be a separate 10 digit number starting with 6-9, if available.</Input.HelpText>
        <Input.Error>{errors.alternateMobile?.message}</Input.Error>
      </Input>

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
          Save & Continue
        </button>
      </div>
    </form>
  );
}
