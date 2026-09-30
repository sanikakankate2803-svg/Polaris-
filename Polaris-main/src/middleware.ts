import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static assets and internal next routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const otpVerifiedCookie = request.cookies.get('polaris_otp_verified')?.value;
  const isOtpVerified = otpVerifiedCookie === 'true';
  const pendingEmailCookie = request.cookies.get('polaris_pending_email')?.value;

  // 2. Route: /verify-otp
  if (pathname === '/verify-otp') {
    // If user is already OTP verified, forward to dashboard
    if (isOtpVerified) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 3. Public Landing and Auth Routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/solutions' ||
    pathname.startsWith('/problem-statements/') && !pathname.includes('/new') && !pathname.includes('/matches')
  ) {
    return NextResponse.next();
  }

  // 4. Check Supabase session first (if configured)
  const { supabaseResponse, profile, user } = await updateSession(request);

  // 5. Protected Route Enforcement: Check if session has passed OTP 2FA
  // It should NOT be possible to reach any dashboard or protected route with an unverified session.
  if (!isOtpVerified) {
    // If there is an active/pending session attempting to access a protected route without OTP 2FA
    if (pendingEmailCookie || profile || user) {
      const verifyUrl = new URL('/verify-otp', request.url);
      if (pendingEmailCookie) {
        verifyUrl.searchParams.set('email', pendingEmailCookie);
      }
      return NextResponse.redirect(verifyUrl);
    }

    // Unauthenticated visitors trying to access protected routes go to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 6. Role & Status specific guards for OTP-verified users
  if (profile) {
    // If official is pending verification by admin
    if (
      profile.verification_status === 'pending' &&
      pathname !== '/verification-pending'
    ) {
      return NextResponse.redirect(new URL('/verification-pending', request.url));
    }

    // Admin role guard
    if (pathname.startsWith('/admin') && profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Validator role guard
    if (pathname.startsWith('/validation') && !['validator', 'admin'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
