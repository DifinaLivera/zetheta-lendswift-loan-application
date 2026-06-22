/**
 * Validation utilities for LendSwift Application
 */

// Verhoeff Algorithm Tables
const dTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const pTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const invTable = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/**
 * Validates check digit for Aadhaar number using Verhoeff algorithm.
 */
export function validateAadhaar(aadhaar: string): { isValid: boolean; error?: string } {
  const cleanAadhaar = aadhaar.replace(/\s+/g, '');
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    return { isValid: false, error: 'Aadhaar must be exactly 12 digits' };
  }

  let c = 0;
  const numArr = cleanAadhaar.split('').map(Number);
  
  // Verhoeff checksum calculation
  for (let i = 0; i < 12; i++) {
    const reverseIndex = 11 - i;
    const digit = numArr[reverseIndex];
    const pVal = pTable[i % 8][digit];
    c = dTable[c][pVal];
  }

  if (c !== 0) {
    return { isValid: false, error: 'Invalid Aadhaar checksum (failed Verhoeff verification)' };
  }

  return { isValid: true };
}

/**
 * Validates PAN number and entity character.
 * Formats: AAAAA9999A
 * 4th character indicates entity type:
 * P = Individual, C = Company, H = HUF, A = AOP, B = BOI, G = Government, J = Artificial Juridical Person, L = Local Authority, F = Firm, T = Trust
 * Personal / Home Loans require P
 * Business Loans allow P, C, or F
 */
export function validatePAN(pan: string, loanType: 'Personal' | 'Home' | 'Business'): { isValid: boolean; error?: string } {
  const cleanPAN = pan.trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPAN)) {
    return { isValid: false, error: 'PAN must be 10 characters in the format AAAAA9999A' };
  }

  const entityChar = cleanPAN.charAt(3);
  const validEntities = ['P', 'C', 'H', 'A', 'B', 'G', 'J', 'L', 'F', 'T'];
  
  if (!validEntities.includes(entityChar)) {
    return { isValid: false, error: 'PAN 4th character must indicate a valid entity type (P, C, F, H, etc.)' };
  }

  if (loanType === 'Personal' || loanType === 'Home') {
    if (entityChar !== 'P') {
      return { isValid: false, error: `For ${loanType} Loans, PAN must belong to an Individual (4th character must be 'P')` };
    }
  } else if (loanType === 'Business') {
    const allowedBusinessEntities = ['P', 'C', 'F'];
    if (!allowedBusinessEntities.includes(entityChar)) {
      return { isValid: false, error: "Business Loans require a Business Owner, Company, or Firm PAN (4th character must be P, C, or F)" };
    }
  }

  return { isValid: true };
}

/**
 * Validates GSTIN (Goods and Services Tax Identification Number)
 * Format: 15 characters
 * First 2: State Code (numeric)
 * Next 10: PAN
 * 13th: Entity number of holder (1-9, A-Z)
 * 14th: Z (by default)
 * 15th: Checksum (alphanumeric)
 */
export function validateGST(gst: string, pan: string): { isValid: boolean; error?: string } {
  const cleanGST = gst.trim().toUpperCase();
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(cleanGST)) {
    return { isValid: false, error: 'GSTIN must be 15 characters in the format: 2-digit state code + 10-char PAN + 1-char entity + Z + 1-char checksum' };
  }

  // Cross validate with PAN
  const panInGST = cleanGST.substring(2, 12);
  const cleanPAN = pan.trim().toUpperCase();
  if (cleanPAN && panInGST !== cleanPAN) {
    return { isValid: false, error: `GSTIN must contain the applicant's PAN (${cleanPAN}) as characters 3 to 12` };
  }

  return { isValid: true };
}

/**
 * Formats a number in the Indian Number System (e.g., 50,000 | 1,50,000 | 10,50,000 | 1,00,00,000).
 */
export function formatIndianCurrency(amount: number | string): string {
  if (amount === undefined || amount === null || amount === '') return '';
  const valStr = String(amount).replace(/[^0-9.]/g, '');
  if (!valStr) return '';
  
  const parts = valStr.split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherParts = parts[0].substring(0, parts[0].length - 3);
  if (otherParts !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return parts.length > 1 ? formattedInt + '.' + parts[1] : formattedInt;
}

/**
 * Helper to parse Indian currency back to number
 */
export function parseIndianCurrency(formatted: string): number {
  if (!formatted) return 0;
  return Number(String(formatted).replace(/[^0-9.]/g, '')) || 0;
}
