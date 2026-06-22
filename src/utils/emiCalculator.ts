import { LoanType } from '../types';

export interface EMICalculationResult {
  loanAmount: number;
  tenure: number;
  interestRate: number; // annual percentage
  monthlyRate: number; // monthly decimal
  emi: number;
  processingFee: number;
  totalInterest: number;
  totalPayable: number;
}

/**
 * Get annual indicative interest rate for a loan type
 */
export function getIndicativeInterestRate(loanType: LoanType): number {
  switch (loanType) {
    case 'Personal':
      return 10.5; // 10.5% p.a.
    case 'Home':
      return 8.5; // 8.5% p.a.
    case 'Business':
      return 14.0; // 14% p.a.
    default:
      return 10.0;
  }
}

/**
 * Calculatred EMI details using standard reducing balance formula:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(amount: number, tenureMonths: number, loanType: LoanType): EMICalculationResult {
  const P = amount;
  const n = tenureMonths;
  const annualRate = getIndicativeInterestRate(loanType);
  const r = annualRate / 12 / 100; // monthly rate as decimal

  let emi = 0;
  if (r > 0) {
    const pow = Math.pow(1 + r, n);
    emi = P * r * pow / (pow - 1);
  } else {
    emi = P / n;
  }

  // Round EMI to nearest integer
  const emiRounded = Math.round(emi);

  // Processing Fee: 1% of loan amount, min 2000, max 25000
  let processingFee = Math.round(P * 0.01);
  if (processingFee < 2000) processingFee = 2000;
  if (processingFee > 25000) processingFee = 25000;

  // Let's use the exact specification: Total Cost of Borrowing = (EMI * n) - P
  const totalInterest = Math.round((emiRounded * n) - P);
  const totalPayable = Math.round(emiRounded * n);

  return {
    loanAmount: P,
    tenure: n,
    interestRate: annualRate,
    monthlyRate: r,
    emi: emiRounded,
    processingFee,
    totalInterest,
    totalPayable
  };
}
