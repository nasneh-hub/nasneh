'use client';

import { en } from '@nasneh/ui/copy';
import { Card } from '@nasneh/ui';

interface DateCalendarProps {
  /**
   * Array of dates with availability status
   */
  dates: Array<{
    date: string; // YYYY-MM-DD
    available: boolean;
  }>;
  /**
   * Currently selected date (YYYY-MM-DD)
   */
  selectedDate?: string;
  /**
   * Callback when a date is selected
   */
  onSelectDate: (date: string) => void;
  /**
   * Whether the calendar is loading
   */
  isLoading?: boolean;
}

/**
 * DateCalendar Component
 * 
 * Calendar grid showing available and unavailable dates for booking.
 * 
 * Features:
 * - Shows 30 days from today
 * - Available dates are clickable
 * - Unavailable dates are grayed out
 * - Selected date is highlighted
 * - Loading state with skeleton
 */
export function DateCalendar({
  dates,
  selectedDate,
  onSelectDate,
  isLoading = false,
}: DateCalendarProps) {
  // Group dates by month
  const datesByMonth = dates.reduce((acc, { date, available }) => {
    const monthKey = date.substring(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push({ date, available });
    return acc;
  }, {} as Record<string, Array<{ date: string; available: boolean }>>);

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.getDate();
  };

  const formatDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-mono-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-mono-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (dates.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-mono-600">
          {en.booking.noAvailability}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(datesByMonth).map(([monthKey, monthDates]) => (
        <Card key={monthKey} className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {formatMonthYear(monthKey)}
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {monthDates.map(({ date, available }) => {
              const isSelected = date === selectedDate;
              const isClickable = available;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => isClickable && onSelectDate(date)}
                  disabled={!isClickable}
                  className={`
                    flex flex-col items-center justify-center
                    h-16 rounded-xl
                    transition-colors
                    ${isSelected
                      ? 'bg-primary text-primary-foreground'
                      : isClickable
                      ? 'bg-mono-100 hover:bg-mono-200 text-mono-900'
                      : 'bg-mono-50 text-mono-400 cursor-not-allowed'
                    }
                  `}
                >
                  <span className="text-xs font-medium">
                    {formatDayOfWeek(date)}
                  </span>
                  <span className="text-lg font-semibold">
                    {formatDay(date)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
