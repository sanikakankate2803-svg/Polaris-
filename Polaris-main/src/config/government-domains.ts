/**
 * Polaris - Government Domain Allowlist Configuration
 * 
 * Official roles (Department Official, Validator, Admin) must register
 * with an email address matching one of these verified domains or domain patterns.
 * Anyone with any email may register as a Startup.
 */

export const ALLOWED_GOVERNMENT_DOMAINS: string[] = [
  // National & State Government domains
  'gov.in',
  'nic.in',
  'digitalindia.gov.in',
  'meity.gov.in',
  'dst.gov.in',
  'drdo.gov.in',
  'isro.gov.in',
  'railnet.gov.in',
  'mha.gov.in',
  'mohua.gov.in',
  'niti.gov.in',
  'mygov.in',
  'pib.gov.in',
  
  // State specific
  'karnataka.gov.in',
  'maharashtra.gov.in',
  'delhi.gov.in',
  'tn.gov.in',
  'up.gov.in',
  'telangana.gov.in',

  // Federal / Counterparts for testing & global standards
  'gov',
  'gov.us',
  'mil',
  'gov.uk',
  'polaris.gov', // internal test domain
];

/**
 * Validates whether an email address belongs to an authorized government domain.
 * Supports exact domain match and subdomains (e.g. user@dept.nic.in or user@karnataka.gov.in).
 */
export function isGovernmentEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;

  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];

  return ALLOWED_GOVERNMENT_DOMAINS.some(allowedDomain => {
    // Exact match or subdomain match (e.g., meity.gov.in matches gov.in)
    return domain === allowedDomain || domain.endsWith('.' + allowedDomain);
  });
}

/**
 * Returns a user-friendly error message if domain is invalid.
 */
export function validateGovernmentEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email address is required.' };
  }
  
  if (!isGovernmentEmail(email)) {
    return {
      isValid: false,
      error: `Registration for official government roles requires an authorized government email domain (e.g., @gov.in, @nic.in, @meity.gov.in). Public email providers (Gmail, Outlook, Yahoo) are not permitted.`,
    };
  }

  return { isValid: true };
}
