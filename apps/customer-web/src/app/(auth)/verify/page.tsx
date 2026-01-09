'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Logo } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { verifyOtp, requestOtp } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [phone, setPhone] = useState('');
  const [expiresIn, setExpiresIn] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get phone from sessionStorage
  useEffect(() => {
    const storedPhone = sessionStorage.getItem('otp_phone');
    const storedExpiresIn = sessionStorage.getItem('otp_expires_in');
    
    if (!storedPhone) {
      router.replace('/login');
      return;
    }
    
    setPhone(storedPhone);
    if (storedExpiresIn) {
      setExpiresIn(parseInt(storedExpiresIn, 10));
    }
  }, [router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // OTP expiry countdown
  useEffect(() => {
    if (expiresIn <= 0) return;
    
    const timer = setInterval(() => {
      setExpiresIn(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresIn]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneDisplay = (phoneNumber: string): string => {
    // +97312345678 -> +973 1234 5678
    if (phoneNumber.startsWith('+973')) {
      const digits = phoneNumber.slice(4);
      return `+973 ${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return phoneNumber;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) {
        handleSubmit(fullOtp);
      }
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
    
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus last filled input or submit
      const lastIndex = Math.min(pastedData.length - 1, OTP_LENGTH - 1);
      inputRefs.current[lastIndex]?.focus();
      
      if (pastedData.length === OTP_LENGTH) {
        handleSubmit(pastedData);
      }
    }
  };

  const handleSubmit = useCallback(async (otpValue?: string) => {
    const otpToSubmit = otpValue || otp.join('');
    
    if (otpToSubmit.length !== OTP_LENGTH) {
      setError(en.auth.otpRequired);
      return;
    }

    if (expiresIn <= 0) {
      setError(en.auth.expiredOtp);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await verifyOtp(phone, otpToSubmit);

      if (response.success && response.data) {
        // Clear session storage
        sessionStorage.removeItem('otp_phone');
        sessionStorage.removeItem('otp_expires_in');
        
        // Login with tokens
        login(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );
        
        // Redirect to home
        router.replace('/');
      } else {
        setError(response.error || en.auth.invalidOtp);
        // Clear OTP on error
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(en.errors.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, phone, expiresIn, login, router]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      const response = await requestOtp(phone);

      if (response.success) {
        setExpiresIn(response.data?.expiresIn || 300);
        setResendCooldown(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        setError(response.error || en.errors.somethingWrong);
      }
    } catch {
      setError(en.errors.networkError);
    } finally {
      setIsResending(false);
    }
  };

  const handleChangePhone = () => {
    sessionStorage.removeItem('otp_phone');
    sessionStorage.removeItem('otp_expires_in');
    router.replace('/login');
  };

  if (authLoading || !phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[color:var(--text-secondary)]">{en.ui.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]" dir="ltr">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo variant="auto" size={40} />
        </div>

        {/* Verify Card */}
        <Card padding="lg">
          <h1 className="text-xl font-semibold text-center mb-2 text-[color:var(--text-primary)]">
            {en.auth.verifyOtp}
          </h1>
          <p className="text-sm text-center mb-2 text-[color:var(--text-secondary)]">
            {en.auth.otpSentTo}
          </p>
          <p className="text-sm text-center mb-6 font-medium text-[color:var(--text-primary)]" dir="ltr">
            {formatPhoneDisplay(phone)}
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-4" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isSubmitting}
                className={`
                  w-12 h-14
                  text-center text-xl font-semibold
                  bg-[var(--bg-tertiary)]
                  rounded-xl
                  text-[color:var(--text-primary)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--ring-color)]
                  disabled:opacity-50
                  transition-all
                  ${error ? 'ring-2 ring-[var(--color-danger)]' : ''}
                `}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-center mb-4 text-[color:var(--color-danger)]">
              {error}
            </p>
          )}

          {/* Expiry Timer */}
          <div className="text-center mb-4">
            {expiresIn > 0 ? (
              <p className="text-sm text-[color:var(--text-secondary)]">
                {en.auth.otpExpiry}: <span className="font-medium">{formatTime(expiresIn)}</span>
              </p>
            ) : (
              <p className="text-sm text-[color:var(--color-danger)]">
                {en.auth.expiredOtp}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={isSubmitting || otp.join('').length !== OTP_LENGTH}
            onClick={() => handleSubmit()}
            className="w-full mb-4"
          >
            {isSubmitting ? en.ui.loading : en.auth.verifyOtp}
          </Button>

          {/* Resend & Change Phone */}
          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className={`
                text-[color:var(--text-secondary)]
                ${resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-[color:var(--text-primary)]'}
              `}
            >
              {resendCooldown > 0 
                ? `${en.auth.resendIn} ${resendCooldown}${en.auth.seconds}`
                : en.auth.resendOtp
              }
            </button>
            
            <button
              type="button"
              onClick={handleChangePhone}
              className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            >
              {en.auth.changePhone}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
