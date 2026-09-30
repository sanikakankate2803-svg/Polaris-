import { NextResponse, type NextRequest } from 'next/server';
import { saveOtp, verifyOtpCode, getActiveOtp } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, code, userId } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. ACTION: SEND OTP
    if (action === 'send') {
      const record = saveOtp(cleanEmail, userId);
      const response = NextResponse.json({
        success: true,
        message: `OTP sent to ${cleanEmail}`,
        // Return code for local test sandbox visibility
        code: record.code,
      });

      // Clear any prior verification and set pending email cookie
      response.cookies.set('polaris_otp_verified', 'false', {
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
      });
      response.cookies.set('polaris_pending_email', cleanEmail, {
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
      });

      return response;
    }

    // 2. ACTION: VERIFY OTP
    if (action === 'verify') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json(
          { success: false, error: '6-digit OTP code is required.' },
          { status: 400 }
        );
      }

      const result = verifyOtpCode(cleanEmail, code);
      if (!result.valid) {
        return NextResponse.json(
          { success: false, error: result.error || 'Invalid OTP code.' },
          { status: 400 }
        );
      }

      // Valid OTP! Set global polaris_otp_verified cookie
      const response = NextResponse.json({
        success: true,
        message: 'OTP verified successfully.',
      });

      response.cookies.set('polaris_otp_verified', 'true', {
        path: '/',
        maxAge: 86400, // 24 hours
        sameSite: 'lax',
      });
      response.cookies.delete('polaris_pending_email');

      return response;
    }

    // 3. ACTION: RESEND OTP
    if (action === 'resend') {
      const record = saveOtp(cleanEmail, userId);
      return NextResponse.json({
        success: true,
        message: `New verification code dispatched to ${cleanEmail}`,
        code: record.code,
      });
    }

    // 4. ACTION: CHECK STATUS (Inspect active code for sandbox helper)
    if (action === 'status') {
      const active = getActiveOtp(cleanEmail);
      return NextResponse.json({
        success: true,
        hasActiveOtp: Boolean(active),
        code: active?.code || null,
        expiresAt: active?.expiresAt || null,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action specified.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in /api/auth/otp:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred processing your OTP request.' },
      { status: 500 }
    );
  }
}
