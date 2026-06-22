import { z } from 'zod';
import { validatePAN, validateAadhaar, validateGST } from './validators';
import { LoanType, ApplicationState } from '../types';

/**
 * Calculates current age based on birth date string (YYYY-MM-DD)
 */
export function calculateAge(dobStr: string): number {
  if (!dobStr) return 0;
  const birthDate = new Date(dobStr);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Checks if a co-applicant section is required based on loanType and loanAmount
 * Personal > 5L or Business > 20L or Home is ALWAYS required
 */
export function isCoApplicantRequired(loanType: LoanType, loanAmount: number): boolean {
  if (loanType === 'Home') return true;
  if (loanType === 'Personal' && loanAmount > 500000) return true;
  if (loanType === 'Business' && loanAmount > 2000000) return true;
  return false;
}

/**
 * Generates the validation schema for a specific step based on global form state
 */
export function getSchemaForStep(step: number, globalState: Partial<ApplicationState>) {
  switch (step) {
    case 1:
      return z.object({
        loanType: z.enum(['Personal', 'Home', 'Business']),
        loanAmount: z.number()
          .min(50000, 'Minimum loan amount is ₹50,000')
          .superRefine((val, ctx) => {
            const type = globalState.loanType || 'Personal';
            if (type === 'Personal' && val > 1000000) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Maximum loan amount for Personal Loan is ₹10 Lakhs (₹1,000,000)'
              });
            } else if (type === 'Home' && val > 10000000) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Maximum loan amount for Home Loan is ₹1 Crore (₹10,000,000)'
              });
            } else if (type === 'Business' && val > 5000000) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Maximum loan amount for Business Loan is ₹50 Lakhs (₹5,000,000)'
              });
            }
          }),
        loanTenure: z.number()
          .superRefine((val, ctx) => {
            const type = globalState.loanType || 'Personal';
            if (type === 'Personal' && (val < 12 || val > 60)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Personal Loan tenure must be between 12 and 60 months'
              });
            } else if (type === 'Home' && (val < 60 || val > 360)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Home Loan tenure must be between 60 and 360 months'
              });
            } else if (type === 'Business' && (val < 12 || val > 120)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Business Loan tenure must be between 12 and 120 months'
              });
            }

            // Cross-step validation with Date of Birth (Age + Tenure <= 65 years)
            if (globalState.dob) {
              const age = calculateAge(globalState.dob);
              const totalAgeAtEnd = age + (val / 12);
              if (totalAgeAtEnd > 65) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Based on your age (${age}), the maximum tenure cannot exceed ${Math.floor((65 - age) * 12)} months (so that your age at load end is ≤ 65 years)`
                });
              }
            }
          }),
        loanPurpose: z.string().min(1, 'Please select a loan purpose'),
        referralCode: z.string().optional().refine(val => {
          if (!val) return true;
          return /^[a-zA-Z0-9]{6,10}$/.test(val);
        }, { message: 'Referral code must be 6-10 alphanumeric characters' })
      });

    case 2:
      return z.object({
        fullName: z.string().min(1, 'Full Name is required')
          .min(2, 'Name must be at least 2 characters')
          .max(100, 'Name cannot exceed 100 characters')
          .regex(/^[a-zA-Z\s.]+$/, 'Name cannot contain special characters except space/period'),
        dob: z.string().min(1, 'Date of Birth is required')
          .refine(val => {
            const age = calculateAge(val);
            return age >= 21 && age <= 65;
          }, { message: 'Applicant must be between 21 and 65 years old to apply' }),
        gender: z.string().min(1, 'Please select gender'),
        maritalStatus: z.string().min(1, 'Please select marital status'),
        fathersName: z.string().min(1, "Father's Name is required")
          .min(2, 'Name must be at least 2 characters')
          .max(100, 'Name cannot exceed 100 characters')
          .regex(/^[a-zA-Z\s.]+$/, 'Name cannot contain special characters except space/period'),
        mothersName: z.string().min(1, "Mother's Name is required")
          .min(2, 'Name must be at least 2 characters')
          .max(100, 'Name cannot exceed 100 characters')
          .regex(/^[a-zA-Z\s.]+$/, 'Name cannot contain special characters except space/period'),
        email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
        mobileNumber: z.string().min(1, 'Mobile Number is required')
          .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit mobile number starting with 6-9'),
        alternateMobile: z.string().optional().superRefine((val, ctx) => {
          if (!val) return;
          if (!/^[6-9]\d{9}$/.test(val)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Must be a valid 10-digit mobile number starting with 6-9'
            });
          }
          if (val === globalState.mobileNumber) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Alternate mobile number must be different from primary mobile number'
            });
          }
        })
      });

    case 3:
      return z.object({
        panNumber: z.string().min(1, 'PAN Number is required')
          .superRefine((val, ctx) => {
            const result = validatePAN(val, globalState.loanType || 'Personal');
            if (!result.isValid) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error || 'Invalid PAN format'
              });
            }
          }),
        aadhaarNumber: z.string().min(1, 'Aadhaar Number is required')
          .superRefine((val, ctx) => {
            const result = validateAadhaar(val);
            if (!result.isValid) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: result.error || 'Invalid Aadhaar checksum'
              });
            }
          }),
        aadhaarConsent: z.boolean().refine(val => val === true, {
          message: 'Explicit Aadhaar e-KYC consent is required'
        }),
        voterId: z.string().optional().refine(val => {
          if (!val) return true;
          return /^[A-Z]{3}\d{7}$/.test(val.toUpperCase());
        }, { message: 'Voter ID must be in format AAA1234567 (3 letters + 7 digits)' }),
        passport: z.any().superRefine((val, ctx) => {
          const isHomeOver50 = (globalState.loanType === 'Home' && (globalState.loanAmount || 0) > 5000000);
          if (isHomeOver50) {
            if (!val || val.trim() === '') {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Passport details are mandatory for Home Loans exceeding ₹50 Lakhs'
              });
            } else if (!/^[A-Z]\d{7}$/.test(String(val).toUpperCase().trim())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Passport must be 1 letter + 7 digits (e.g. Z1234567)'
              });
            }
          } else if (val && val.trim() !== '') {
            if (!/^[A-Z]\d{7}$/.test(String(val).toUpperCase().trim())) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Passport must be 1 letter + 7 digits (e.g. Z1234567)'
              });
            }
          }
        })
      });

    case 4:
      return z.object({
        currentAddressLine1: z.string().min(1, 'Address Line 1 is required')
          .min(5, 'Address must be at least 5 characters')
          .max(200, 'Address cannot exceed 200 characters'),
        currentAddressLine2: z.string().optional(),
        pinCode: z.string().min(1, 'PIN Code is required')
          .regex(/^\d{6}$/, 'PIN Code must be exactly 6 digits'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        residenceType: z.string().min(1, 'Residence Type is required'),
        rentAmount: z.number().optional(),
        yearsAtAddress: z.number().min(0).max(50),
        
        prevAddressLine1: z.string().optional(),
        prevAddressLine2: z.string().optional(),
        prevPinCode: z.string().optional(),
        prevCity: z.string().optional(),
        prevState: z.string().optional(),

        sameAsPermanent: z.boolean(),

        permAddressLine1: z.string().optional(),
        permAddressLine2: z.string().optional(),
        permPinCode: z.string().optional(),
        permCity: z.string().optional(),
        permState: z.string().optional()
      }).superRefine((data, ctx) => {
        // Validate rentAmount if residenceType is 'Rented'
        if (data.residenceType === 'Rented') {
          if (data.rentAmount === undefined || data.rentAmount === null || data.rentAmount <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['rentAmount'],
              message: 'Monthly rent amount is required as residence type is Rented'
            });
          }
        }

        // Validate previous address if yearsAtAddress is less than 1 (represented by 0)
        if (data.yearsAtAddress < 1) {
          if (!data.prevAddressLine1 || data.prevAddressLine1.trim().length < 5) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['prevAddressLine1'],
              message: 'Previous Address details are required because years at current address is < 1 year'
            });
          }
          if (!data.prevPinCode || !/^\d{6}$/.test(data.prevPinCode)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['prevPinCode'],
              message: 'Valid 6-digit Previous PIN is required'
            });
          }
          if (!data.prevCity || data.prevCity.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['prevCity'],
              message: 'Previous City is required'
            });
          }
          if (!data.prevState || data.prevState.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['prevState'],
              message: 'Previous State is required'
            });
          }
        }

        // Validate permanent address if sameAsPermanent is false
        if (!data.sameAsPermanent) {
          if (!data.permAddressLine1 || data.permAddressLine1.trim().length < 5) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['permAddressLine1'],
              message: 'Permanent Address Line 1 is required'
            });
          }
          if (!data.permPinCode || !/^\d{6}$/.test(data.permPinCode)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['permPinCode'],
              message: 'Valid 6-digit permanent PIN is required'
            });
          }
          if (!data.permCity || data.permCity.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['permCity'],
              message: 'Permanent City is required'
            });
          }
          if (!data.permState || data.permState.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['permState'],
              message: 'Permanent State is required'
            });
          }
        }
      });

    case 5:
      return z.object({
        employmentType: z.enum(['Salaried', 'Self-Employed', 'Business Owner']).superRefine((val, ctx) => {
          if (globalState.loanType === 'Business' && val === 'Salaried') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Business Loans require applicant to be Self-Employed or Business Owner (not Salaried)'
            });
          }
        }),
        
        // Salaried Sub-form fields
        companyName: z.string().optional(),
        designation: z.string().optional(),
        monthlyNetSalary: z.number().optional(),
        yearsOfExperience: z.number().optional(),

        // Self-Employed sub-form
        profession: z.string().optional(),
        selfMonthlyIncome: z.number().optional(),
        yearsInPractice: z.number().optional(),
        annualTurnoverSelf: z.number().optional(),

        // Business Owner sub-form
        businessName: z.string().optional(),
        businessType: z.string().optional(),
        annualTurnoverBusiness: z.number().optional(),
        yearsInBusiness: z.number().optional(),
        gstNumber: z.string().optional(),
        officeAddressLine1: z.string().optional(),
        officePinCode: z.string().optional(),
        officeCity: z.string().optional(),
        officeState: z.string().optional()
      }).superRefine((data, ctx) => {
        const empType = data.employmentType;

        if (empType === 'Salaried') {
          if (!data.companyName || data.companyName.trim().length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['companyName'], message: 'Employer Company Name is required' });
          }
          if (!data.designation || data.designation.trim().length < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['designation'], message: 'Designation is required' });
          }
          if (data.monthlyNetSalary === undefined || data.monthlyNetSalary === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyNetSalary'], message: 'Monthly net salary is required' });
          } else if (data.monthlyNetSalary < 15000) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyNetSalary'], message: 'Minimum Net Salary requirement is ₹15,000' });
          }
          if (data.yearsOfExperience === undefined || data.yearsOfExperience === null || data.yearsOfExperience < 0 || data.yearsOfExperience > 50) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['yearsOfExperience'], message: 'Years of Experience must be between 0 and 50' });
          }
        } else if (empType === 'Self-Employed') {
          if (!data.profession || data.profession.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['profession'], message: 'Profession selection is required' });
          }
          if (data.selfMonthlyIncome === undefined || data.selfMonthlyIncome === null || data.selfMonthlyIncome <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selfMonthlyIncome'], message: 'Monthly net income is required' });
          }
          if (data.yearsInPractice === undefined || data.yearsInPractice === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['yearsInPractice'], message: 'Years in Practice is required' });
          } else if (data.yearsInPractice < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['yearsInPractice'], message: 'Minimum 2 years of professional practice is required' });
          }
          if (data.annualTurnoverSelf === undefined || data.annualTurnoverSelf === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['annualTurnoverSelf'], message: 'Annual Gross Turnover is required' });
          } else if (data.annualTurnoverSelf < 300000) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['annualTurnoverSelf'], message: 'Minimum annual turnover is ₹3 Lakhs (₹3,00,000)' });
          }
        } else if (empType === 'Business Owner') {
          if (!data.businessName || data.businessName.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['businessName'], message: 'Business Name is required' });
          }
          if (!data.businessType || data.businessType.trim().length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['businessType'], message: 'Business entity style is required' });
          }
          if (data.annualTurnoverBusiness === undefined || data.annualTurnoverBusiness === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['annualTurnoverBusiness'], message: 'Annual Business Turnover is required' });
          } else if (data.annualTurnoverBusiness < 300000) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['annualTurnoverBusiness'], message: 'Minimum annual business turnover is ₹3 Lakhs (₹3,00,000)' });
          }
          if (data.yearsInBusiness === undefined || data.yearsInBusiness === null) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['yearsInBusiness'], message: 'Years in Business is required' });
          } else if (data.yearsInBusiness < 2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['yearsInBusiness'], message: 'Minimum 2 years of active business is required' });
          }
          
          const pan = globalState.panNumber || '';
          const gstinRes = validateGST(data.gstNumber || '', pan);
          if (!gstinRes.isValid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['gstNumber'],
              message: gstinRes.error || 'Invalid GST number format'
            });
          }

          if (!data.officeAddressLine1 || data.officeAddressLine1.trim().length < 5) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['officeAddressLine1'], message: 'Office address line 1 is required' });
          }
          if (!data.officePinCode || !/^\d{6}$/.test(data.officePinCode)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['officePinCode'], message: 'Valid 6-digit office PIN code is required' });
          }
          if (!data.officeCity || data.officeCity.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['officeCity'], message: 'Office City is required' });
          }
          if (!data.officeState || data.officeState.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['officeState'], message: 'Office State is required' });
          }
        }
      });

    case 6:
      const active = isCoApplicantRequired(globalState.loanType || 'Personal', globalState.loanAmount || 0);
      if (!active) {
        return z.object({});
      }
      return z.object({
        coApplicantName: z.string().min(1, 'Co-applicant full name is required').min(2, 'Name must be at least 2 characters'),
        coApplicantRelationship: z.string().min(1, 'Relationship is required'),
        coApplicantPan: z.string().min(1, 'Co-applicant PAN is required').superRefine((val, ctx) => {
          const result = validatePAN(val, 'Personal'); // Co-applicant PAN must be individual ('P')
          if (!result.isValid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: result.error || 'Invalid PAN format'
            });
          }
        }),
        coApplicantIncome: z.number().min(1, 'Monthly net income must exceed ₹0'),
        coApplicantConsent: z.boolean().refine(val => val === true, {
          message: 'Co-applicant explicit consent is mandatory'
        }),
        coApplicantSignature: z.string().min(1, 'Co-applicant e-signature is required')
      });

    case 7:
      return z.object({
        applicantSignature: z.string().min(1, 'E-signature drawing on canvas is required')
      });

    case 8:
      return z.object({
        consentAccuracy: z.boolean().refine(val => val === true, {
          message: 'Confirming info accuracy is required'
        }),
        consentBureauCheck: z.boolean().refine(val => val === true, {
          message: 'CIBIL/Equifax credit assessment authorization is required'
        }),
        consentTermsConditions: z.boolean().refine(val => val === true, {
          message: 'Acceptance of Terms and Conditions is required'
        }),
        consentMarketing: z.boolean().refine(val => val === true, {
          message: 'Marketing and communications preference is required'
        })
      });

    default:
      return z.object({});
  }
}
