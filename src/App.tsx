import * as React from 'react';
import { ApplicationState, LoanType } from './types';
import { Step1LoanType } from './components/Step1LoanType';
import { Step2PersonalInfo } from './components/Step2PersonalInfo';
import { Step3KYC } from './components/Step3KYC';
import { Step4Address } from './components/Step4Address';
import { Step5Employment } from './components/Step5Employment';
import { Step6CoApplicant } from './components/Step6CoApplicant';
import { Step7Documents } from './components/Step7Documents';
import { Step8Review } from './components/Step8Review';
import { useAutoSave } from './hooks/useAutoSave';
import { decryptData } from './utils/encryption';
import { isCoApplicantRequired } from './utils/schemaFactory';
import { formatIndianCurrency } from './utils/validators';
import { calculateEMI } from './utils/emiCalculator';
import { 
  ShieldCheck, 
  User, 
  MapPin, 
  Briefcase, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Printer, 
  RefreshCw,
  Lock,
  Download,
  Info
} from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [formState, setFormState] = React.useState<Partial<ApplicationState>>({
    loanType: 'Personal',
    loanAmount: 150000,
    loanTenure: 24,
    loanPurpose: 'Other',
    uploadedDocuments: {},
    sameAsPermanent: true
  });

  // Unique reference generated on app load / restore
  const [referenceNumber, setReferenceNumber] = React.useState<string>('');

  // Draft recovery states
  const [showRestoreModal, setShowRestoreModal] = React.useState(false);
  const [availableDraftMeta, setAvailableDraftDraftMeta] = React.useState<{
    timestamp: string;
    step: number;
    loanType: LoanType;
  } | null>(null);

  // Success modal layout
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  // Focus ref on step transition for WCAG accessibility (Page 24: "Focus must move to the first input of each step")
  const stepContainerRef = React.useRef<HTMLDivElement>(null);

  // Check for saved drafts on Mount
  React.useEffect(() => {
    // Check all possible draft metadata keys in localStorage
    const products: LoanType[] = ['Personal', 'Home', 'Business'];
    let foundMeta: any = null;
    let foundProduct: LoanType = 'Personal';

    for (const p of products) {
      const meta = localStorage.getItem(`lendswift_meta_${p}`);
      if (meta) {
        try {
          const parsed = JSON.parse(meta);
          // Only offer drafts younger than 72 hours (TTL check, Page 5)
          const draftAge = Date.now() - new Date(parsed.timestamp).getTime();
          if (draftAge < 72 * 60 * 60 * 1000) {
            foundMeta = parsed;
            foundProduct = p;
            break;
          }
        } catch (e) {
          console.error("Failed to parse metadata", e);
        }
      }
    }

    if (foundMeta) {
      setAvailableDraftDraftMeta(foundMeta);
      setShowRestoreModal(true);
    }

    // Generate client-side UUID reference number
    setReferenceNumber(window.crypto.randomUUID());
  }, []);

  // Set up encrypted auto-save hook
  const { toastMessage } = useAutoSave({
    formState,
    loanType: formState.loanType || 'Personal',
    currentStep,
    intervalMs: 20000 // every 20 seconds
  });

  const handleRestoreDraft = async () => {
    if (!availableDraftMeta) return;
    try {
      const draftKey = `lendswift_draft_${availableDraftMeta.loanType}`;
      const encryptedData = localStorage.getItem(draftKey);
      if (encryptedData) {
        const decryptedData = await decryptData(encryptedData);
        const parsedState = JSON.parse(decryptedData);
        
        setFormState(parsedState);
        setCurrentStep(availableDraftMeta.step);
        setShowRestoreModal(false);
      }
    } catch (e) {
      alert("Restore failed. Stored draft might be corrupted. Starting fresh.");
      handleDiscardDraft();
    }
  };

  const handleDiscardDraft = () => {
    if (availableDraftMeta) {
      localStorage.removeItem(`lendswift_draft_${availableDraftMeta.loanType}`);
      localStorage.removeItem(`lendswift_meta_${availableDraftMeta.loanType}`);
    }
    setShowRestoreModal(false);
  };

  // Navigations (includes Step 6 conditional skipping!)
  const handleNextStep = (data: Partial<ApplicationState>) => {
    // Merge new step inputs with existing central state
    const updatedState = { ...formState, ...data };
    setFormState(updatedState);

    // Focus on first input elements inside step container after state settles
    setTimeout(() => {
      if (stepContainerRef.current) {
        const firstInput = stepContainerRef.current.querySelector('input, select, textarea') as HTMLElement;
        firstInput?.focus();
      }
    }, 100);

    if (currentStep === 8) {
      // Final submission trigger
      setShowSuccessModal(true);
      // Clear persistence database on final completion
      localStorage.removeItem(`lendswift_draft_${formState.loanType}`);
      localStorage.removeItem(`lendswift_meta_${formState.loanType}`);
      return;
    }

    // Standard increment
    let next = currentStep + 1;

    // Skipping logic for Co-Applicant (Step 6)
    if (next === 6) {
      const coReq = isCoApplicantRequired(updatedState.loanType || 'Personal', updatedState.loanAmount || 0);
      if (!coReq) {
        // Skip co-applicant page and proceed to documents uploading (Step 7)
        next = 7;
      }
    }

    setCurrentStep(next);
  };

  const handlePrevStep = () => {
    let prev = currentStep - 1;

    // Skipping logic for Co-Applicant when traveling backwards
    if (prev === 6) {
      const coReq = isCoApplicantRequired(formState.loanType || 'Personal', formState.loanAmount || 0);
      if (!coReq) {
        prev = 5; // skip co-applicant and go to employment
      }
    }

    setCurrentStep(prev);

    // Focus top of step coordinate
    setTimeout(() => {
      if (stepContainerRef.current) {
        const firstInput = stepContainerRef.current.querySelector('input, select, textarea') as HTMLElement;
        firstInput?.focus();
      }
    }, 100);
  };

  const handleGoToStep = (stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > 8) return;
    setCurrentStep(stepNumber);
  };

  // Step information metadata
  const stepsMetadata = [
    { num: 1, label: 'Loan & Repayment', icon: <Sparkles className="w-4 h-4" /> },
    { num: 2, label: 'Personal profile', icon: <User className="w-4 h-4" /> },
    { num: 3, label: 'e-KYC verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { num: 4, label: 'Address logs', icon: <MapPin className="w-4 h-4" /> },
    { num: 5, label: 'Corporate & Income', icon: <Briefcase className="w-4 h-4" /> },
    { num: 6, label: 'Co-applicant co-sign', icon: <Users className="w-4 h-4" /> },
    { num: 7, label: 'Documents review', icon: <FileText className="w-4 h-4" /> },
    { num: 8, label: 'Check & Sign', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  // Visual status of co-applicant step
  const isCoRequired = isCoApplicantRequired(formState.loanType || 'Personal', formState.loanAmount || 0);

  // Print summary calculations for success PDF print layouts
  const successFinance = React.useMemo(() => {
    return calculateEMI(formState.loanAmount || 50000, formState.loanTenure || 12, formState.loanType || 'Personal');
  }, [formState]);

  const handlePrintReceipt = () => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.error("Standard print failed", err);
    }
  };

  const handleDownloadReceipt = () => {
    const isCoReqActive = isCoRequired;
    const documentHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LendSwift Loan Application Receipt - ${referenceNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1A1D23;
      background-color: #FFFFFF;
      margin: 0;
      padding: 40px;
      line-height: 1.5;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      padding: 40px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #D4AF37;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-family: Georgia, serif;
      font-size: 28px;
      font-weight: bold;
      color: #0A0B0D;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #D4AF37;
    }
    .subtitle {
      font-size: 11px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .reference-box {
      text-align: right;
    }
    .reference-id {
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
      color: #D4AF37;
      background: #F7FAFC;
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px dashed #E2E8F0;
    }
    .section-title {
      font-family: Georgia, serif;
      font-size: 16px;
      font-weight: bold;
      color: #0A0B0D;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .full-width {
      grid-column: span 2;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #EDF2F7;
      padding-bottom: 8px;
      font-size: 13px;
    }
    .label {
      color: #718096;
      font-weight: 500;
    }
    .value {
      font-weight: 600;
      color: #1A1D23;
    }
    .value.highlight {
      color: #27AE60;
    }
    .disclosure-box {
      background: #F7FAFC;
      border-left: 3px solid #D4AF37;
      padding: 15px;
      margin-top: 30px;
      border-radius: 0 4px 4px 0;
      font-size: 11px;
      color: #4A5568;
    }
    .disclosure-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 6px;
      font-size: 12px;
      color: #D4AF37;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #A0AEC0;
      margin-top: 40px;
      border-top: 1px solid #E2E8F0;
      padding-top: 20px;
    }
    .print-btn {
      display: inline-block;
      background-color: #D4AF37;
      color: #0A0B0D;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
      text-decoration: none;
    }
    .print-btn:hover {
      background-color: #E5C158;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
      }
      .receipt-container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div>
        <div class="logo">Lend<span>Swift</span></div>
        <div class="subtitle">Aurum Capital Lending Platform</div>
      </div>
      <div class="reference-box">
        <div class="label" style="font-size: 10px; margin-bottom: 4px; text-transform: uppercase; font-weight: bold;">Application Reference ID</div>
        <div class="reference-id">${referenceNumber}</div>
        <div class="label" style="font-size: 10px; margin-top: 6px;">Submitted: ${new Date().toLocaleString()}</div>
      </div>
    </div>

    <center class="no-print">
      <button onclick="window.print()" class="print-btn">Print / Save as PDF</button>
      <p style="font-size: 12px; color: #718096; margin-top: 8px; margin-bottom: 24px;">Note: A print dialog should automatically appear. If not, click the button above.</p>
    </center>

    <div class="section-title">Approved Loan Term Sheet</div>
    <div class="grid">
      <div class="data-row">
        <span class="label">Loan Product Type:</span>
        <span class="value">${formState.loanType || 'Personal'} Loan</span>
      </div>
      <div class="data-row">
        <span class="label">Loan Purpose:</span>
        <span class="value">${formState.loanPurpose || 'General Use'}</span>
      </div>
      <div class="data-row">
        <span class="label">Pre-Approved Principal:</span>
        <span class="value highlight">₹ ${formatIndianCurrency(successFinance.loanAmount)}</span>
      </div>
      <div class="data-row">
        <span class="label">Interest rate (OCR):</span>
        <span class="value">${successFinance.interestRate.toFixed(1)}% p.a.</span>
      </div>
      <div class="data-row">
        <span class="label">Repayment Tenure:</span>
        <span class="value">${successFinance.tenure} Months</span>
      </div>
      <div class="data-row">
        <span class="label">Monthly Installment (EMI):</span>
        <span class="value highlight">₹ ${formatIndianCurrency(successFinance.emi)} / month</span>
      </div>
      <div class="data-row">
        <span class="label">Application Status:</span>
        <span class="value" style="color: #27AE60;">PRE-APPROVED</span>
      </div>
      <div class="data-row">
        <span class="label">Standard Processing Fees:</span>
        <span class="value">₹ ${formatIndianCurrency(successFinance.processingFee)} (incl. GST)</span>
      </div>
    </div>

    <div class="section-title">Primary Applicant Demographic Details</div>
    <div class="grid">
      <div class="data-row">
        <span class="label">Full Legal Name:</span>
        <span class="value">${formState.fullName || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="label">Primary contact number:</span>
        <span class="value">${formState.mobileNumber || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="label">Verified Email Address:</span>
        <span class="value">${formState.emailAddress || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="label">Date of Birth (DOB):</span>
        <span class="value">${formState.dob || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="label">Income Stream style:</span>
        <span class="value">${formState.employmentType || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="label">Permanent Account Number (PAN):</span>
        <span class="value" style="text-transform: uppercase;">${formState.panNumber || 'N/A'}</span>
      </div>
      <div class="data-row full-width">
        <span class="label">Verified Residential Address:</span>
        <span class="value">${formState.currentAddressLine1 || 'N/A'}${formState.currentAddressLine2 ? ', ' + formState.currentAddressLine2 : ''}, ${formState.city || 'N/A'}, ${formState.state || 'N/A'} - ${formState.pinCode || 'N/A'}</span>
      </div>
    </div>

    ${formState.employmentType ? `
    <div class="section-title">Work & Professional Income Statement</div>
    <div class="grid">
      <div class="data-row">
        <span class="label">Occupation category:</span>
        <span class="value">${formState.employmentType}</span>
      </div>
      ${formState.employmentType === 'Salaried' ? `
        <div class="data-row">
          <span class="label">Employer corporate entity:</span>
          <span class="value">${formState.companyName || 'N/A'}</span>
        </div>
        <div class="data-row">
          <span class="label">Current designation title:</span>
          <span class="value">${formState.designation || 'N/A'}</span>
        </div>
        <div class="data-row">
          <span class="label">Reported monthly net wage:</span>
          <span class="value">₹ ${formatIndianCurrency(formState.monthlyNetSalary || 0)}</span>
        </div>
      ` : formState.employmentType === 'Self-Employed' ? `
        <div class="data-row">
          <span class="label">Profession:</span>
          <span class="value">${formState.profession || 'N/A'}</span>
        </div>
        <div class="data-row">
          <span class="label">Experienced Practice length (Years):</span>
          <span class="value">${formState.yearsInPractice || 0} Years</span>
        </div>
        <div class="data-row">
          <span class="label">Addeclared monthly earnings:</span>
          <span class="value">₹ ${formatIndianCurrency(formState.selfMonthlyIncome || 0)}</span>
        </div>
        <div class="data-row">
          <span class="label">Declared Gross Annual Turnover:</span>
          <span class="value">₹ ${formatIndianCurrency(formState.annualTurnoverSelf || 0)}</span>
        </div>
      ` : `
        <div class="data-row">
          <span class="label">Business Corporate title:</span>
          <span class="value">${formState.businessName || 'N/A'}</span>
        </div>
        <div class="data-row">
          <span class="label">Business legal formation style:</span>
          <span class="value">${formState.businessType || 'N/A'}</span>
        </div>
        <div class="data-row">
          <span class="label">GST details reference number:</span>
          <span class="value">${formState.gstNumber || 'N/A'}</span>
        </div>
        <div class="data-row">
          <span class="label">Annual sales turnover statement:</span>
          <span class="value">₹ ${formatIndianCurrency(formState.annualTurnoverBusiness || 0)}</span>
        </div>
      `}
    </div>
    ` : ''}

    ${isCoReqActive ? `
    <div class="section-title">Co-Applicant / Guarantor Endorsement Details</div>
    <div class="grid">
      <div class="data-row">
        <span class="label">Co-Applicant Legal Name:</span>
        <span class="value">${formState.coApplicantName || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="label">Relationship with Applicant:</span>
        <span class="value">${formState.coApplicantRelationship || 'N/A'}</span>
      </div>
      <div class="data-row">
        <span class="label">Guarantor Monthly Income:</span>
        <span class="value">₹ ${formatIndianCurrency(formState.coApplicantIncome || 0)}</span>
      </div>
      <div class="data-row">
        <span class="label">Government PAN Reference ID:</span>
        <span class="value" style="text-transform: uppercase;">${formState.coApplicantPan || 'N/A'}</span>
      </div>
    </div>
    ` : ''}

    <div class="disclosure-box">
      <div class="disclosure-title">Statutory Cool-off Guidelines & Disclosures</div>
      Under LendSwift banking standard guidelines, applicants are entitled to a <strong>3-Day statutory cooling-off period</strong> starting from contract signing, permitting cancellation of the loan agreement without any early closure or administrative penalties.
      <br/><br/>
      <strong>Grievance Redressal Officer Contact:</strong> Ms. Shalini Shah (grievance@lendswift.com)
      <br/>
      <strong>Escalation Link:</strong> Reserve Bank of India Nodal Complaints Portal - <a href="https://cms.rbi.org.in" target="_blank" style="color: #D4AF37; font-weight: bold; text-decoration: none;">cms.rbi.org.in</a>
    </div>

    <div class="footer">
      This pre-approval advice is electronically generated on behalf of LendSwift, a corporate financing brand managed by Aurum Capital Solutions Private Limited. Pre-approval status is subject to finalized KYC audit and verification of uploaded attachments.
    </div>
  </div>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([documentHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LendSwift_Receipt_${referenceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex flex-col font-sans select-none antialiased relative text-[#E0E2E5]">
      
      {/* Aurum Capital / LendSwift Visual Header */}
      <header className="bg-[#0A0B0D] border-b border-[#2D3036] py-4 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] leading-none flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3 select-none">
          <div className="w-9 h-9 rounded-sm bg-[#D4AF37] flex items-center justify-center text-[#0A0B0D] font-extrabold shadow-sm">
            <span className="font-serif tracking-wide font-black text-lg">A</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-serif text-base font-bold text-white tracking-wide flex items-center gap-2.5 leading-none">
              Aurum Capital <span className="text-xs font-light text-[#8E9299] font-sans">| LendSwift</span>
              <span className="text-[10px] font-bold py-0.5 px-2 bg-[#1A1D23] text-[#D4AF37] border border-[#D4AF37]/20 flex items-center gap-1 font-sans rounded-sm">
                <Lock className="w-3 h-3 text-[#D4AF37]" />
                RBI Registered
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1 bg-emerald-950/20 text-emerald-400 px-2 py-1 rounded-sm border border-emerald-950/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            256-bit AES Persisted
          </span>
          <span className="hidden sm:inline text-[#8E9299]">Reference ID: <code className="font-mono text-[#D4AF37] bg-[#1A1D23] px-1.5 py-0.5 rounded-sm border border-[#2D3036]">{referenceNumber.slice(0, 8)}</code></span>
        </div>
      </header>

      {/* Main Orchestrator layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-6 px-4 sm:px-8 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side: Steps Progress Indicator Rail (desktop) / Drawer */}
        <nav className="w-full lg:w-72 bg-[#0F1115] rounded-sm p-5 border border-[#2D3036] shadow-sm flex flex-col gap-3 flex-shrink-0" aria-label="Application Progress navigation">
          <div className="pb-3 border-b border-[#2D3036] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#8E9299] tracking-wider font-sans">Application Stages</span>
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-sm uppercase border border-[#D4AF37]/20">
              Step {currentStep} of {isCoRequired ? 8 : 7}
            </span>
          </div>

          <div className="space-y-1.5 flex flex-col">
            {stepsMetadata.map((st) => {
              // Skip rendering co-applicant step in the rail if not required
              if (st.num === 6 && !isCoRequired) return null;

              const isPassed = st.num < currentStep;
              const isCurrent = st.num === currentStep;

              return (
                <button
                  key={st.num}
                  type="button"
                  disabled={st.num > currentStep}
                  onClick={() => handleGoToStep(st.num)}
                  className={`
                    w-full flex items-center gap-3.5 p-3 rounded-sm text-left transition select-none outline-none font-semibold text-xs border border-transparent
                    ${isCurrent ? 'bg-[#D4AF37] text-[#0A0B0D] font-bold shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:bg-[#E5C158]' : ''}
                    ${isPassed ? 'text-emerald-400 bg-emerald-950/5 border border-emerald-900/20 hover:bg-[#1A1D23]/50' : ''}
                    ${st.num > currentStep ? 'text-[#8E9299]/40 cursor-not-allowed' : ''}
                    ${!isCurrent && !isPassed && st.num <= currentStep ? 'text-[#E0E2E5] hover:bg-[#1A1D23] cursor-pointer' : ''}
                  `}
                >
                  <span className={`
                    w-6.5 h-6.5 rounded-sm flex items-center justify-center text-xs font-black
                    ${isCurrent ? 'bg-[#0A0B0D] text-[#D4AF37] border border-[#0A0B0D]/10' : ''}
                    ${isPassed ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : ''}
                    ${!isCurrent && !isPassed ? 'bg-[#1A1D23] text-[#8E9299] border border-[#2D3036]' : ''}
                  `}>
                    {isPassed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : st.num}
                  </span>

                  <div className="flex-1 leading-snug">
                    <span className="block truncate">{st.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Overall percentage completed progress bar */}
          <div className="pt-4 border-t border-[#2D3036] flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] text-[#8E9299] font-bold uppercase tracking-wider">
              <span>Overall Progress</span>
              <span className="text-[#D4AF37]">{Math.round(((currentStep - 1) / (isCoRequired ? 8 : 7)) * 100)}%</span>
            </div>
            <div className="w-full bg-[#1A1D23] rounded-none h-1.5 overflow-hidden border border-[#2D3036]">
              <div 
                className="bg-[#D4AF37] h-full rounded-none transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (isCoRequired ? 8 : 7)) * 100}%` }}
              />
            </div>
          </div>
        </nav>

        {/* Right Side: Active Step Form card wrapper */}
        <section 
          ref={stepContainerRef}
          aria-live="polite"
          className="flex-1 w-full bg-[#0F1115] rounded-sm p-6 sm:p-8 border border-[#2D3036] shadow-md min-h-[500px]"
        >
          {currentStep === 1 && (
            <Step1LoanType
              globalState={formState}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <Step2PersonalInfo
              globalState={formState}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 3 && (
            <Step3KYC
              globalState={formState}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 4 && (
            <Step4Address
              globalState={formState}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 5 && (
            <Step5Employment
              globalState={formState}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 6 && (
            <Step6CoApplicant
              globalState={formState}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 7 && (
            <Step7Documents
              globalState={formState}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 8 && (
            <Step8Review
              globalState={formState}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              goToStep={handleGoToStep}
            />
          )}
        </section>

      </main>

      {/* Auto-Save Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#1A1D23] text-[#E0E2E5] rounded-sm py-3 px-4.5 flex items-center gap-2.5 shadow-lg border border-[#2D3036] z-50 animate-fade-in font-semibold text-xs leading-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Draft Recovery Dialog / Modal */}
      {showRestoreModal && availableDraftMeta && (
        <div className="fixed inset-0 bg-[#0A0B0D]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#0F1115] rounded-sm w-full max-w-md p-6 border border-[#2D3036] shadow-2xl flex flex-col gap-4 text-center items-center">
            <div className="w-12 h-12 rounded-sm bg-[#1A1D23] text-[#D4AF37] border border-[#2D3036] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-white tracking-wider font-serif">Saved Application Detected</h3>
              <p className="text-[#8E9299] text-xs font-medium leading-relaxed mt-1">
                You have an incomplete 8-step application for a <span className="font-bold text-[#D4AF37]">{availableDraftMeta.loanType} Loan</span> started on {new Date(availableDraftMeta.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-3">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="py-2.5 px-4 font-semibold text-xs text-rose-400 bg-rose-950/20 border border-rose-950/40 rounded-sm hover:bg-rose-950/40 transition cursor-pointer active:scale-95"
              >
                Discard & Fresh Start
              </button>
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="py-2.5 px-4 font-semibold text-xs text-[#0A0B0D] bg-[#D4AF37] hover:bg-[#E5C158] rounded-sm transition cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.15)] active:scale-95"
              >
                Resume Saved Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Submission Success Modal (Printable/Downloadable PDF layout) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#0A0B0D]/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="printable-receipt-modal-backdrop">
          <div className="bg-[#0F1115] rounded-sm w-full max-w-2xl p-6 sm:p-8 border border-[#2D3036] shadow-2xl flex flex-col gap-5 text-sm" id="printable-receipt-modal">
            
            {/* Header Success info */}
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-sm bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 flex items-center justify-center shadow-inner">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-serif tracking-wide mt-1">Application Submitted Successfully</h3>
              <p className="text-[#8E9299] text-xs font-medium">Your LendSwift application is complete and pre-approved under standard banking checks.</p>
            </div>

            {/* Application Data Sheet */}
            <div className="p-4.5 bg-[#1A1D23] border border-[#2D3036] rounded-sm flex flex-col gap-4 font-semibold text-xs text-[#E0E2E5]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-[#2D3036] gap-1.5">
                <div>
                  <span className="text-[10px] text-[#8E9299] font-bold uppercase tracking-wider block font-sans">Reference Reference ID</span>
                  <code className="font-mono text-sm font-bold text-[#D4AF37]">{referenceNumber}</code>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="px-3.5 py-2 bg-[#2D3036] text-[#E0E2E5] hover:bg-[#2D3036]/80 border border-[#2D3036] rounded-sm shadow-sm text-xs font-bold leading-none flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Print Receipt
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className="px-3.5 py-2 bg-[#D4AF37] text-[#0A0B0D] hover:bg-[#E5C158] border border-[#D4AF37] rounded-sm shadow-sm text-xs font-bold leading-none flex items-center justify-center gap-1.5 cursor-pointer transition shadow-[0_0_12px_rgba(212,175,55,0.1)] active:scale-95"
                    title="Download fully-formatted offline receipt copy"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0A0B0D]" />
                    Download Copy
                  </button>
                </div>
              </div>

              {/* Terms, Exit options, and Grievance columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 leading-normal">
                {/* Financial review */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block font-sans">Approved Financing Terms</span>
                  <div className="flex justify-between border-b border-[#2D3036] pb-1.5 mt-1">
                    <span className="text-[#8E9299]">Approved Principal:</span>
                    <strong className="text-white font-bold">₹ {formatIndianCurrency(successFinance.loanAmount)}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#2D3036] pb-1.5">
                    <span className="text-[#8E9299]">Repayment Term:</span>
                    <strong className="text-white font-bold">{successFinance.tenure} Months</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#2D3036] pb-1.5">
                    <span className="text-[#8E9299]">Approved EMI:</span>
                    <strong className="text-emerald-400 font-bold">₹ {formatIndianCurrency(successFinance.emi)} / mo</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E9299]">Indicative OCR Rate:</span>
                    <strong className="text-white font-bold">{successFinance.interestRate.toFixed(1)}% p.a.</strong>
                  </div>
                </div>

                {/* Statutory Disclosures */}
                <div className="flex flex-col gap-2 border-t sm:border-t-0 sm:border-l sm:pl-5 border-[#2D3036] pt-3 sm:pt-0">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block font-sans">Statutory Disclosures</span>
                  
                  {/* Cooling-off period */}
                  <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-[10px] font-extrabold text-[#8E9299] uppercase tracking-wider font-sans">Cooling-Off Period (DL Guidelines)</span>
                    <p className="text-[10px] text-[#8E9299] leading-normal font-medium normal-case font-sans">
                      You are afforded a statutory <strong className="font-bold text-white">3-Day cooling-off period</strong> starting from agreement signing to exit the loan commitment without any prepayment penalties.
                    </p>
                  </div>

                  {/* Grievance redressal */}
                  <div className="flex flex-col gap-0.5 mt-1.5">
                    <span className="text-[10px] font-extrabold text-[#8E9299] uppercase tracking-wider font-sans">Nodal Grievance Redressal</span>
                    <p className="text-[10px] text-[#8E9299] leading-normal font-medium normal-case font-sans">
                      Nodal Grievance Officer: Ms. Shalini Shah (grievance@lendswift.com). RBI Escalation Portal: <a href="https://cms.rbi.org.in" target="_blank" className="underline text-[#D4AF37] font-bold">cms.rbi.org.in</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reload application state to pristine startup
                  window.location.reload();
                }}
                className="py-2.5 px-6 font-semibold text-xs text-[#0A0B0D] bg-[#D4AF37] hover:bg-[#E5C158] rounded-sm transition cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.15)] active:scale-95"
              >
                Close & Return Home
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
