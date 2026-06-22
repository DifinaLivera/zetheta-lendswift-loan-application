import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationState } from '../types';
import { getSchemaForStep } from '../utils/schemaFactory';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { Checkbox } from './common/Checkbox';
import { CurrencyInput } from './common/CurrencyInput';
import { usePinCodeLookup } from '../hooks/usePinCodeLookup';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';

interface StepProps {
  globalState: Partial<ApplicationState>;
  onNext: (data: Partial<ApplicationState>) => void;
  onPrev: () => void;
}

export function Step4Address({ globalState, onNext, onPrev }: StepProps) {
  const currentSchema = getSchemaForStep(4, globalState);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      currentAddressLine1: globalState.currentAddressLine1 || '',
      currentAddressLine2: globalState.currentAddressLine2 || '',
      pinCode: globalState.pinCode || '',
      city: globalState.city || '',
      state: globalState.state || '',
      residenceType: globalState.residenceType || '',
      rentAmount: globalState.rentAmount || 0,
      yearsAtAddress: globalState.yearsAtAddress || 0,
      sameAsPermanent: globalState.sameAsPermanent !== undefined ? globalState.sameAsPermanent : true,
      
      prevAddressLine1: globalState.prevAddressLine1 || '',
      prevAddressLine2: globalState.prevAddressLine2 || '',
      prevPinCode: globalState.prevPinCode || '',
      prevCity: globalState.prevCity || '',
      prevState: globalState.prevState || '',

      permAddressLine1: globalState.permAddressLine1 || '',
      permAddressLine2: globalState.permAddressLine2 || '',
      permPinCode: globalState.permPinCode || '',
      permCity: globalState.permCity || '',
      permState: globalState.permState || ''
    }
  });

  const pinVal = watch('pinCode');
  const rentVal = watch('rentAmount');
  const resType = watch('residenceType');
  const yearsVal = watch('yearsAtAddress');
  const sameAsPermanentVal = watch('sameAsPermanent');

  const { lookup, isLoading: isPinLoading } = usePinCodeLookup();
  const [pinWarning, setPinWarning] = React.useState<string | null>(null);

  // Auto-lookup current PIN
  React.useEffect(() => {
    if (pinVal && pinVal.length === 6 && /^\d{6}$/.test(pinVal)) {
      lookup(pinVal).then((data) => {
        if (data) {
          setValue('city', data.city, { shouldValidate: true });
          setValue('state', data.state, { shouldValidate: true });
          setPinWarning(null);
        } else {
          setPinWarning('PIN code not recognized. You may input City and State manually.');
        }
      });
    }
  }, [pinVal, lookup, setValue]);

  // Previous PIN auto-lookup
  const prevPinVal = watch('prevPinCode');
  React.useEffect(() => {
    if (prevPinVal && prevPinVal.length === 6 && /^\d{6}$/.test(prevPinVal)) {
      lookup(prevPinVal).then((data) => {
        if (data) {
          setValue('prevCity', data.city, { shouldValidate: true });
          setValue('prevState', data.state, { shouldValidate: true });
        }
      });
    }
  }, [prevPinVal, lookup, setValue]);

  // Permanent PIN auto-lookup
  const permPinVal = watch('permPinCode');
  React.useEffect(() => {
    if (permPinVal && permPinVal.length === 6 && /^\d{6}$/.test(permPinVal)) {
      lookup(permPinVal).then((data) => {
        if (data) {
          setValue('permCity', data.city, { shouldValidate: true });
          setValue('permState', data.state, { shouldValidate: true });
        }
      });
    }
  }, [permPinVal, lookup, setValue]);

  const handleFormSubmit = (data: any) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-white font-serif tracking-wide">Address Details</h2>
        <p className="text-[#8E9299] text-xs mt-1 font-medium leading-relaxed font-sans">
          Provide your current work or residential address. PIN code queries will automatically fill the City and State options.
        </p>
      </div>

      {/* Current Address Block */}
      <div className="p-4.5 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
          <MapPin className="w-4 h-4 text-[#D4AF37]" />
          Current Residential Address
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* PIN Code Lookup */}
          <div className="flex flex-col justify-end">
            <Input>
              <Input.Label required>PIN Code (6 digits)</Input.Label>
              <div className="relative">
                <Input.Field
                  placeholder="e.g. 560001"
                  maxLength={6}
                  hasError={!!errors.pinCode}
                  {...register('pinCode')}
                />
                {isPinLoading && (
                  <div className="absolute right-3.5 top-3 pointer-events-none">
                    <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              <Input.Error>{errors.pinCode?.message}</Input.Error>
            </Input>
          </div>

          <Input>
            <Input.Label required>City</Input.Label>
            <Input.Field
              placeholder="Auto-filled"
              hasError={!!errors.city}
              {...register('city')}
            />
            <Input.Error>{errors.city?.message}</Input.Error>
          </Input>

          <Input>
            <Input.Label required>State / UT</Input.Label>
            <Input.Field
              placeholder="Auto-filled"
              hasError={!!errors.state}
              {...register('state')}
            />
            <Input.Error>{errors.state?.message}</Input.Error>
          </Input>
        </div>

        {pinWarning && (
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold bg-amber-950/20 px-3 py-2.5 rounded-sm border border-amber-900/40">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            {pinWarning}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input>
            <Input.Label required>Address Line 1 (Flat, House, Building)</Input.Label>
            <Input.Field
              placeholder="e.g. Flat 302, Royal Gardens"
              hasError={!!errors.currentAddressLine1}
              {...register('currentAddressLine1')}
            />
            <Input.Error>{errors.currentAddressLine1?.message}</Input.Error>
          </Input>

          <Input>
            <Input.Label>Address Line 2 (Street, Area, Landmark)</Input.Label>
            <Input.Field
              placeholder="e.g. Hosur Road, Opp Forum Mall"
              hasError={!!errors.currentAddressLine2}
              {...register('currentAddressLine2')}
            />
            <Input.Error>{errors.currentAddressLine2?.message}</Input.Error>
          </Input>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Select>
            <Select.Label required>Residence Status</Select.Label>
            <Select.Field
              hasError={!!errors.residenceType}
              {...register('residenceType')}
            >
              <option value="">-- Choose status --</option>
              <option value="Owned">Owned by Self/Spouse</option>
              <option value="Rented">Rented / Leased</option>
              <option value="Company-provided">Company Provided</option>
              <option value="Family-owned">Family-owned (Parents)</option>
            </Select.Field>
            <Select.Error>{errors.residenceType?.message}</Select.Error>
          </Select>

          {/* Conditional Rent Amount */}
          {resType === 'Rented' ? (
            <CurrencyInput
              label="Monthly Rent Amount"
              required
              value={rentVal}
              onChange={(val) => setValue('rentAmount', val, { shouldValidate: true })}
              error={errors.rentAmount?.message}
            />
          ) : (
            <div className="hidden" />
          )}

          <Select>
            <Select.Label required>Years at Current Residence</Select.Label>
            <Select.Field
              hasError={!!errors.yearsAtAddress}
              {...register('yearsAtAddress', { valueAsNumber: true })}
            >
              <option value="0">Less than 1 Year</option>
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
            </Select.Field>
            <Select.Error>{errors.yearsAtAddress?.message}</Select.Error>
          </Select>
        </div>
      </div>

      {/* Conditional previous Address block if years at address is < 1 */}
      {yearsVal === 0 ? (
        <div className="p-4.5 bg-amber-950/10 border border-[#2D3036] rounded-sm flex flex-col gap-4.5 animate-fade-in text-sm">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 font-serif">
            <MapPin className="w-4 h-4 text-amber-500" />
            Previous Residential Address (Required if current is &lt; 1 year)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            <Input>
              <Input.Label required>PIN Code</Input.Label>
              <Input.Field
                placeholder="PIN"
                maxLength={6}
                hasError={!!errors.prevPinCode}
                {...register('prevPinCode')}
              />
              <Input.Error>{errors.prevPinCode?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label required>City</Input.Label>
              <Input.Field
                placeholder="City"
                hasError={!!errors.prevCity}
                {...register('prevCity')}
              />
              <Input.Error>{errors.prevCity?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label required>State</Input.Label>
              <Input.Field
                placeholder="State"
                hasError={!!errors.prevState}
                {...register('prevState')}
              />
              <Input.Error>{errors.prevState?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <Input>
              <Input.Label required>Address Line 1</Input.Label>
              <Input.Field
                placeholder="Flat / Building"
                hasError={!!errors.prevAddressLine1}
                {...register('prevAddressLine1')}
              />
              <Input.Error>{errors.prevAddressLine1?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label>Address Line 2 (Optional)</Input.Label>
              <Input.Field
                placeholder="Street / Area"
                hasError={!!errors.prevAddressLine2}
                {...register('prevAddressLine2')}
              />
              <Input.Error>{errors.prevAddressLine2?.message}</Input.Error>
            </Input>
          </div>
        </div>
      ) : null}

      {/* Same as Permanent Address Checkbox */}
      <div className="p-1 px-2.5">
        <Checkbox
          label={<strong>My permanent address is the same as my current residential address.</strong>}
          checked={sameAsPermanentVal}
          onChange={(e) => setValue('sameAsPermanent', e.target.checked, { shouldValidate: true })}
        />
      </div>

      {/* Conditional Permanent Address Section */}
      {!sameAsPermanentVal ? (
        <div className="p-4.5 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-4.5 animate-fade-in text-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            Permanent Address details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            <Input>
              <Input.Label required>PIN Code</Input.Label>
              <Input.Field
                placeholder="PIN"
                maxLength={6}
                hasError={!!errors.permPinCode}
                {...register('permPinCode')}
              />
              <Input.Error>{errors.permPinCode?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label required>City</Input.Label>
              <Input.Field
                placeholder="City"
                hasError={!!errors.permCity}
                {...register('permCity')}
              />
              <Input.Error>{errors.permCity?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label required>State</Input.Label>
              <Input.Field
                placeholder="State"
                hasError={!!errors.permState}
                {...register('permState')}
              />
              <Input.Error>{errors.permState?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <Input>
              <Input.Label required>Address Line 1</Input.Label>
              <Input.Field
                placeholder="Flat / Building"
                hasError={!!errors.permAddressLine1}
                {...register('permAddressLine1')}
              />
              <Input.Error>{errors.permAddressLine1?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label>Address Line 2 (Optional)</Input.Label>
              <Input.Field
                placeholder="Street / Area"
                hasError={!!errors.permAddressLine2}
                {...register('permAddressLine2')}
              />
              <Input.Error>{errors.permAddressLine2?.message}</Input.Error>
            </Input>
          </div>
        </div>
      ) : null}

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
