'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Logo } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth } from '../../context/auth-context';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyPage() {
  const router = useRouter();
  const { user, activeRole, isLoading, verifyOtp, login } = useAuth();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [expiryTime, setExpiryTime] = useState(OTP_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get phone from session storage
  useEffect(() => {
    const savedPhone = sessionStorage.getItem('verify_phone');
    if (!savedPhone) {
      router.push('/login');
      return;
    }
    setPhone(savedPhone);
  }, [router]);

  // Redirect if already logged in with active role
  useEffect(() => {
    if (!isLoading && user && activeRole) {
      router.push(`/${activeRole.toLowerCase()}`);
    }
  }, [user, activeRole, isLoading, router]);

  // OTP expiry timer
  useEffect(() => {
    if (expiryTime <= 0) return;
    const timer = setInterval(() => {
      setExpiryTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryTime]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pastedData.length === OTP_LENGTH) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (code: string) => {
    if (code.length !== OTP_LENGTH || !phone) return;

    setIsSubmitting(true);
    setError('');

    const result = await verifyOtp(phone, code);

    if (result.success) {
      // Clear session storage
      sessionStorage.removeItem('verify_phone');
      // Redirect based on roles
      // The useEffect will handle the redirect once user state updates
    } else {
      setError(result.error || ar.auth.invalidOtp);
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }

    setIsSubmitting(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !phone) return;

    const result = await login(phone);
    if (result.success) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setExpiryTime(OTP_EXPIRY_SECONDS);
      setOtp(new Array(OTP_LENGTH).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || ar.errors.somethingWrong);
    }
  };

  // Redirect after successful verification
  useEffect(() => {
    if (!isLoading && user && !activeRole) {
      if (user.roles.length > 1) {
        router.push('/select-role');
      } else if (user.roles.length === 1) {
        router.push(`/${user.roles[0].toLowerCase()}`);
      }
    }
  }, [user, activeRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[var(--text-secondary)]">{ar.ui.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-secondary)] p-4">
      <Card padding="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="auto" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {ar.auth.verifyOtp}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {ar.auth.enterOtp}
          </p>
          {phone && (
            <p className="text-sm text-[var(--text-tertiary)] mt-2" dir="ltr">
              {phone}
            </p>
          )}
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-6" dir="ltr" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              disabled={isSubmitting}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-[var(--text-error)] mb-4">{error}</p>
        )}

        {/* Timer */}
        <div className="text-center mb-6">
          {expiryTime > 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              {ar.auth.otpExpiry} {formatTime(expiryTime)}
            </p>
          ) : (
            <p className="text-sm text-[var(--text-error)]">{ar.auth.expiredOtp}</p>
          )}
        </div>

        {/* Resend */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `${ar.auth.resendOtp} (${resendCooldown})`
              : ar.auth.resendOtp}
          </Button>
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              sessionStorage.removeItem('verify_phone');
              router.push('/login');
            }}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {ar.ui.back}
          </button>
        </div>
      </Card>
    </div>
  );
}
