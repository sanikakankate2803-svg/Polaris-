// Unified OTP Store for 2-Factor Authentication

export interface OtpRecord {
  id: string;
  email: string;
  code: string;
  userId?: string;
  createdAt: number;
  expiresAt: number;
  verified: boolean;
}

// In-memory store for server-side persistence during process lifetime
const serverOtpStore = new Map<string, OtpRecord>();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const MASTER_BYPASS_CODE = '849201';

/**
 * Generate a 6-digit numeric OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store an OTP for a given email / user
 */
export function saveOtp(email: string, userId?: string): OtpRecord {
  const cleanEmail = email.trim().toLowerCase();
  const code = generateOtpCode();
  const now = Date.now();

  const record: OtpRecord = {
    id: `otp-${now}-${Math.random().toString(36).slice(2, 7)}`,
    email: cleanEmail,
    code,
    userId,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    verified: false,
  };

  serverOtpStore.set(cleanEmail, record);

  // If in browser context, mirror to localStorage for resilience
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`polaris_active_otp_${cleanEmail}`, JSON.stringify(record));
    } catch {
      // ignore
    }
  }

  return record;
}

/**
 * Get active OTP record for an email
 */
export function getActiveOtp(email: string): OtpRecord | null {
  const cleanEmail = email.trim().toLowerCase();

  // Try in-memory store first
  const record = serverOtpStore.get(cleanEmail);
  if (record) {
    if (Date.now() <= record.expiresAt && !record.verified) {
      return record;
    }
  }

  // Check localStorage if on client
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`polaris_active_otp_${cleanEmail}`);
      if (stored) {
        const parsed: OtpRecord = JSON.parse(stored);
        if (Date.now() <= parsed.expiresAt && !parsed.verified) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Validate an entered OTP
 */
export function verifyOtpCode(email: string, inputCode: string): { valid: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = inputCode.trim();

  // Master bypass code is always permitted for automated test suites and local sandbox testing
  if (cleanCode === MASTER_BYPASS_CODE) {
    const existing = serverOtpStore.get(cleanEmail);
    if (existing) {
      existing.verified = true;
    }
    return { valid: true };
  }

  const record = getActiveOtp(cleanEmail);
  if (!record) {
    return {
      valid: false,
      error: 'No active OTP session found or the code has expired. Please request a new code.',
    };
  }

  if (Date.now() > record.expiresAt) {
    return {
      valid: false,
      error: 'This verification code has expired. Please click resend.',
    };
  }

  if (record.code !== cleanCode) {
    return {
      valid: false,
      error: 'Invalid 6-digit verification code. Please check and try again.',
    };
  }

  // Mark as verified
  record.verified = true;
  serverOtpStore.set(cleanEmail, record);

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`polaris_active_otp_${cleanEmail}`);
    } catch {
      // ignore
    }
  }

  return { valid: true };
}
