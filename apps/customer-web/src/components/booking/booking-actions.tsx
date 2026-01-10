'use client';

import { en } from '@nasneh/ui/copy';
import { Button } from '@nasneh/ui';

interface BookingActionsProps {
  /**
   * Callback when back button is clicked
   */
  onBack: () => void;
  /**
   * Callback when confirm button is clicked
   */
  onConfirm: () => void;
  /**
   * Whether the confirm action is in progress
   */
  isConfirming?: boolean;
  /**
   * Whether the confirm button should be disabled
   */
  confirmDisabled?: boolean;
  /**
   * Custom label for confirm button (defaults to "Confirm Booking")
   */
  confirmLabel?: string;
}

/**
 * BookingActions Component
 * 
 * Action buttons for booking flow (Back + Confirm).
 * 
 * Features:
 * - Back button (secondary variant)
 * - Confirm button (primary variant)
 * - Loading state for confirm button
 * - Disabled state support
 * - Custom confirm label support
 */
export function BookingActions({
  onBack,
  onConfirm,
  isConfirming = false,
  confirmDisabled = false,
  confirmLabel = en.booking.confirmBooking,
}: BookingActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        onClick={onBack}
        disabled={isConfirming}
        className="flex-1"
      >
        {en.ui.back}
      </Button>
      <Button
        variant="default"
        onClick={onConfirm}
        disabled={confirmDisabled || isConfirming}
        loading={isConfirming}
        className="flex-1"
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
