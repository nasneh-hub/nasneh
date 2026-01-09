'use client';

import { Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { ArrowLeft } from 'lucide-react';

interface CheckoutActionsProps {
  onBack: () => void;
  onContinue: () => void;
  isContinuing?: boolean;
  continueDisabled?: boolean;
  continueLabel?: string;
}

export function CheckoutActions({
  onBack,
  onContinue,
  isContinuing,
  continueDisabled,
  continueLabel,
}: CheckoutActionsProps) {
  return (
    <div className="space-y-3">
      {/* Continue Button */}
      <Button
        onClick={onContinue}
        disabled={continueDisabled || isContinuing}
        className="w-full"
      >
        {isContinuing ? en.common.loading : (continueLabel || en.checkout.continue)}
      </Button>

      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={isContinuing}
        className="w-full py-3 text-sm text-mono-10 hover:text-mono-12 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {en.checkout.backToCart}
      </button>
    </div>
  );
}
