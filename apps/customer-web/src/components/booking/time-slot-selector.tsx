'use client';

import { en } from '@nasneh/ui/copy';
import { Card } from '@nasneh/ui';

interface TimeSlotSelectorProps {
  /**
   * Array of time slots with availability status
   */
  slots: Array<{
    time: string; // HH:MM format
    available: boolean;
  }>;
  /**
   * Currently selected time (HH:MM)
   */
  selectedTime?: string;
  /**
   * Callback when a time slot is selected
   */
  onSelectTime: (time: string) => void;
  /**
   * Whether the slots are loading
   */
  isLoading?: boolean;
}

/**
 * TimeSlotSelector Component
 * 
 * Grid of time slots for a selected date.
 * 
 * Features:
 * - Shows available and unavailable time slots
 * - Available slots are clickable
 * - Unavailable slots are grayed out
 * - Selected slot is highlighted
 * - Loading state with skeleton
 */
export function TimeSlotSelector({
  slots,
  selectedTime,
  onSelectTime,
  isLoading = false,
}: TimeSlotSelectorProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-[var(--muted)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-[var(--muted-foreground)]">
          {en.booking.noSlotsAvailable}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
        {en.booking.selectTime}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {slots.map(({ time, available }) => {
          const isSelected = time === selectedTime;
          const isClickable = available;

          return (
            <button
              key={time}
              type="button"
              onClick={() => isClickable && onSelectTime(time)}
              disabled={!isClickable}
              className={`
                flex items-center justify-center
                h-12 rounded-xl
                font-medium
                transition-colors
                ${isSelected
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : isClickable
                  ? 'bg-[var(--secondary)] hover:bg-[var(--accent)] text-[var(--foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed opacity-50'
                }
              `}
            >
              {formatTime(time)}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
