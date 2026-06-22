export type LoanType = 'Personal' | 'Home' | 'Business';

export interface DocumentUpload {
  name: string;
  size: number; // in bytes
  type: string; // mime-type
  base64?: string; // base64 representation of file for preview/autosave
  originalSize?: number; // pre-compression size
  compressedSize?: number; // compressed size
  status: 'pending' | 'uploaded' | 'verified';
}

export interface ApplicationState {
  // Step 1: Loan Type & Basics
  loanType: LoanType;
  loanAmount: number;
  loanTenure: number; // in months
  loanPurpose: string;
  referralCode?: string;

  // Step 2: Personal Information
  fullName: string;
  dob: string; // YYYY-MM-DD
  gender: string;
  maritalStatus: string;
  fathersName: string;
  mothersName: string;
  email: string;
  mobileNumber: string;
  alternateMobile?: string;
  isMobileVerified?: boolean;

  // Step 3: Identity Verification (KYC)
  panNumber: string;
  isPanVerified?: boolean;
  aadhaarNumber: string;
  isAadhaarVerified?: boolean;
  aadhaarConsent: boolean;
  voterId?: string;
  passport?: string;

  // Step 4: Address Details
  currentAddressLine1: string;
  currentAddressLine2?: string;
  pinCode: string;
  city: string;
  state: string;
  residenceType: string;
  rentAmount?: number;
  yearsAtAddress: number;
  
  // Previous Address details structure
  prevAddressLine1?: string;
  prevAddressLine2?: string;
  prevPinCode?: string;
  prevCity?: string;
  prevState?: string;

  sameAsPermanent: boolean;
  
  // Permanent Address details structure
  permAddressLine1?: string;
  permAddressLine2?: string;
  permPinCode?: string;
  permCity?: string;
  permState?: string;

  // Step 5: Employment & Income Details
  employmentType: 'Salaried' | 'Self-Employed' | 'Business Owner';
  
  // Salaried fields
  companyName?: string;
  designation?: string;
  monthlyNetSalary?: number;
  yearsOfExperience?: number;

  // Self-Employed fields
  profession?: string;
  selfMonthlyIncome?: number;
  yearsInPractice?: number;
  annualTurnoverSelf?: number;

  // Business Owner fields
  businessName?: string;
  businessType?: string;
  annualTurnoverBusiness?: number;
  yearsInBusiness?: number;
  gstNumber?: string;
  officeAddressLine1?: string;
  officeAddressLine2?: string;
  officePinCode?: string;
  officeCity?: string;
  officeState?: string;

  // Step 6: Co-Applicant
  hasCoApplicant: boolean;
  coApplicantName?: string;
  coApplicantRelationship?: string;
  coApplicantPan?: string;
  isCoApplicantPanVerified?: boolean;
  coApplicantIncome?: number;
  coApplicantConsent?: boolean;
  coApplicantSignature?: string; // base64

  // Step 7: Documents & Canvas e-Signature
  uploadedDocuments: Record<string, DocumentUpload>;
  applicantSignature?: string; // base64

  // Step 8: Consents
  consentAccuracy: boolean;
  consentBureauCheck: boolean;
  consentTermsConditions: boolean;
  consentMarketing: boolean;
}

export interface ApplicationDraft {
  version: string;
  timestamp: string; // ISO String
  currentStep: number;
  loanType: LoanType;
  formState: Partial<ApplicationState>;
}
