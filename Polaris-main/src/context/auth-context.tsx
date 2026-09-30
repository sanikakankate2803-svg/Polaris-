'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Profile, UserRole, VerificationStatus } from '@/types/database';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { validateGovernmentEmail } from '@/config/government-domains';
import { saveOtp, verifyOtpCode } from '@/lib/otp-store';

export interface DemoUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  org_or_department: string;
  verification_status: VerificationStatus;
}

export const PRESET_USERS: Record<string, DemoUser> = {
  department: {
    id: 'dept-101-verified',
    email: 'rajesh.kumar@meity.gov.in',
    role: 'department_official',
    name: 'Rajesh Kumar, IAS',
    org_or_department: 'Ministry of Electronics & Information Technology',
    verification_status: 'verified',
  },
  startup: {
    id: 'startup-202-verified',
    email: 'priya@aerovision.io',
    role: 'startup',
    name: 'Priya Sharma',
    org_or_department: 'AeroVision Autonomous Systems Pvt Ltd',
    verification_status: 'verified',
  },
  validator: {
    id: 'validator-303-verified',
    email: 'dr.thorne@qci.org.in',
    role: 'validator',
    name: 'Dr. Aris Thorne',
    org_or_department: 'National Technical Validation Council',
    verification_status: 'verified',
  },
  admin: {
    id: 'admin-404-verified',
    email: 'admin.procure@polaris.gov.in',
    role: 'admin',
    name: 'Vikramaditya Rao',
    org_or_department: 'Public Innovation & Procurement Cell (PMO)',
    verification_status: 'verified',
  },
  pending_official: {
    id: 'pending-505-official',
    email: 'ananya.deshmukh@mohua.gov.in',
    role: 'department_official',
    name: 'Ananya Deshmukh',
    org_or_department: 'Ministry of Housing & Urban Affairs',
    verification_status: 'pending',
  },
};

export interface PendingOtpRegistration {
  email: string;
  role: UserRole;
  name: string;
  org_or_department: string;
  password?: string;
  otp: string;
  expiresAt: number;
}

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, role?: UserRole) => Promise<{ success: boolean; user?: Profile; error?: string }>;
  signup: (params: {
    email: string;
    role: UserRole;
    name: string;
    org_or_department: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string; status?: VerificationStatus; otp?: string }>;
  sendSignupOtp: (params: {
    email: string;
    role: UserRole;
    name: string;
    org_or_department: string;
    password?: string;
  }) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifySignupOtp: (
    email: string,
    enteredOtp: string
  ) => Promise<{ success: boolean; status?: VerificationStatus; role?: UserRole; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (presetKey: keyof typeof PRESET_USERS) => void;
  approvePendingUser: (userId: string) => void;
  rejectPendingUser: (userId: string) => void;
  allUsersList: Profile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'polaris_current_user';
const LOCAL_STORAGE_USERS_LIST_KEY = 'polaris_users_registry';

function getInitialUsersList(): Profile[] {
  if (typeof window === 'undefined') {
    return Object.values(PRESET_USERS).map(u => ({
      ...u,
      created_at: new Date().toISOString(),
    }));
  }
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_USERS_LIST_KEY);
    if (stored) return JSON.parse(stored);
    const initial = Object.values(PRESET_USERS).map(u => ({
      ...u,
      created_at: new Date().toISOString(),
    }));
    localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return Object.values(PRESET_USERS).map(u => ({
      ...u,
      created_at: new Date().toISOString(),
    }));
  }
}

function getInitialUser(): Profile | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const isOtpVerified = document.cookie.includes('polaris_otp_verified=true');
    if (!isOtpVerified) {
      return null;
    }
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) return JSON.parse(stored);
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usersList, setUsersList] = useState<Profile[]>(() => getInitialUsersList());
  const [user, setUser] = useState<Profile | null>(() => getInitialUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured] = useState(() => isSupabaseConfigured());

  // Synchronize when usersList changes
  const saveUsersList = (list: Profile[]) => {
    setUsersList(list);
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const switchDemoRole = (presetKey: keyof typeof PRESET_USERS) => {
    const preset = PRESET_USERS[presetKey];
    if (preset) {
      const fullProfile: Profile = {
        ...preset,
        email_verified: true,
        created_at: new Date().toISOString(),
      };
      setUser(fullProfile);
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fullProfile));
        document.cookie = 'polaris_otp_verified=true; path=/; max-age=86400; SameSite=Lax';
      } catch {
        // ignore
      }
    }
  };

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Check in memory / localStorage registry
      const existing = usersList.find(u => u.email.toLowerCase() === cleanEmail);
      if (!existing) {
        return {
          success: false,
          error: 'No account found with this email. Please register first or use one of the quick demo personas.',
        };
      }

      // Generate OTP code for login
      const otpRecord = saveOtp(cleanEmail, existing.id);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('polaris_pending_email', cleanEmail);
          localStorage.setItem(`polaris_active_otp_${cleanEmail}`, JSON.stringify(otpRecord));
          document.cookie = 'polaris_otp_verified=false; path=/; max-age=3600; SameSite=Lax';
          document.cookie = `polaris_pending_email=${encodeURIComponent(cleanEmail)}; path=/; max-age=3600; SameSite=Lax`;
        } catch {
          // ignore
        }
      }

      // Dispatch to API
      try {
        await fetch('/api/auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', email: cleanEmail, userId: existing.id }),
        });
      } catch {
        // ignore
      }

      return { success: true, user: existing };
    } finally {
      setIsLoading(false);
    }
  };

  const sendSignupOtp = async ({
    email,
    role,
    name,
    org_or_department,
    password = 'password123',
  }: {
    email: string;
    role: UserRole;
    name: string;
    org_or_department: string;
    password?: string;
  }): Promise<{ success: boolean; otp?: string; error?: string }> => {
    return signup({ email, role, name, org_or_department, password });
  };

  const verifySignupOtp = async (
    email: string,
    enteredOtp: string
  ): Promise<{ success: boolean; status?: VerificationStatus; role?: UserRole; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const verification = verifyOtpCode(cleanEmail, enteredOtp);

      if (!verification.valid) {
        return {
          success: false,
          error: verification.error || 'Invalid 6-digit verification code.',
        };
      }

      // OTP Validated! Set global cookie for middleware
      if (typeof window !== 'undefined') {
        document.cookie = 'polaris_otp_verified=true; path=/; max-age=86400; SameSite=Lax';
      }

      // Mark user profile as email_verified: true
      const targetUser = usersList.find(u => u.email.toLowerCase() === cleanEmail);
      if (targetUser) {
        const verifiedUser: Profile = {
          ...targetUser,
          email_verified: true,
        };
        setUser(verifiedUser);
        const updatedList = [verifiedUser, ...usersList.filter(u => u.email.toLowerCase() !== cleanEmail)];
        saveUsersList(updatedList);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(verifiedUser));
            localStorage.removeItem('polaris_pending_email');
          } catch {
            // ignore
          }
        }
        return { success: true, status: verifiedUser.verification_status, role: verifiedUser.role };
      }

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<{ success: boolean; otp?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const record = saveOtp(cleanEmail);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`polaris_active_otp_${cleanEmail}`, JSON.stringify(record));
      } catch {
        // ignore
      }
    }
    try {
      await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', email: cleanEmail }),
      });
    } catch {
      // ignore
    }
    return { success: true, otp: record.code };
  };

  const signup = async ({
    email,
    role,
    name,
    org_or_department,
    password = 'password123',
  }: {
    email: string;
    role: UserRole;
    name: string;
    org_or_department: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string; status?: VerificationStatus; otp?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Mandatory Form-Level Validation for Official Roles
      if (role !== 'startup') {
        const check = validateGovernmentEmail(cleanEmail);
        if (!check.isValid) {
          return {
            success: false,
            error: check.error || 'Official accounts require an authorized government email domain.',
          };
        }
      }

      // 2. Check if user already exists
      const existing = usersList.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return {
          success: false,
          error: 'An account with this email is already registered. Please sign in instead.',
        };
      }

      // 3. Create unverified profile
      const verification_status: VerificationStatus = role === 'startup' ? 'verified' : 'pending';
      const newProfile: Profile = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        role,
        name: name.trim(),
        org_or_department: org_or_department.trim(),
        verification_status,
        email_verified: false, // NOT verified until /verify-otp
        created_at: new Date().toISOString(),
      };

      // 4. Supabase integration if active
      if (isConfigured) {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                name: newProfile.name,
                role: newProfile.role,
                org_or_department: newProfile.org_or_department,
                email_verified: false,
              },
            },
          });
          if (data.user) {
            newProfile.id = data.user.id;
          }
        } catch (err) {
          console.warn('Supabase signUp notice:', err);
        }
      }

      // 5. Save into registry (as pending unverified user)
      const updatedList = [newProfile, ...usersList.filter(u => u.email.toLowerCase() !== cleanEmail)];
      saveUsersList(updatedList);

      // 6. Generate 6-digit OTP code & insert into OTP store
      const otpRecord = saveOtp(cleanEmail, newProfile.id);

      // 7. Set pending cookies (DO NOT authenticate session yet!)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('polaris_pending_email', cleanEmail);
          localStorage.setItem(`polaris_active_otp_${cleanEmail}`, JSON.stringify(otpRecord));
          document.cookie = 'polaris_otp_verified=false; path=/; max-age=3600; SameSite=Lax';
          document.cookie = `polaris_pending_email=${encodeURIComponent(cleanEmail)}; path=/; max-age=3600; SameSite=Lax`;
        } catch {
          // ignore
        }
      }

      try {
        await fetch('/api/auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', email: cleanEmail, userId: newProfile.id }),
        });
      } catch {
        // ignore
      }

      return { success: true, status: verification_status, otp: otpRecord.code };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem('polaris_pending_email');
      document.cookie = 'polaris_otp_verified=false; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'polaris_pending_email=; path=/; max-age=0; SameSite=Lax';
    } catch {
      // ignore
    }
  };

  const approvePendingUser = (userId: string) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, verification_status: 'verified' as VerificationStatus };
      }
      return u;
    });
    saveUsersList(updated);

    if (user?.id === userId) {
      const updatedUser = { ...user, verification_status: 'verified' as VerificationStatus };
      setUser(updatedUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const rejectPendingUser = (userId: string) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        return { ...u, verification_status: 'rejected' as VerificationStatus };
      }
      return u;
    });
    saveUsersList(updated);

    if (user?.id === userId) {
      const updatedUser = { ...user, verification_status: 'rejected' as VerificationStatus };
      setUser(updatedUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        login,
        signup,
        sendSignupOtp,
        verifySignupOtp,
        resendOtp,
        logout,
        switchDemoRole,
        approvePendingUser,
        rejectPendingUser,
        allUsersList: usersList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
