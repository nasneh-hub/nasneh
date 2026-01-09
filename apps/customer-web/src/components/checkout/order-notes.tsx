'use client';

import { Textarea } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { FileText } from 'lucide-react';

interface OrderNotesProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function OrderNotes({ value, onChange, maxLength = 500 }: OrderNotesProps) {
  const remainingChars = maxLength - value.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-mono-10" />
        <h3 className="text-lg font-semibold text-mono-12">
          {en.checkout.orderNotes}
        </h3>
        <span className="text-sm text-mono-9">
          ({en.checkout.optional})
        </span>
      </div>

      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={en.checkout.orderNotesPlaceholder}
          maxLength={maxLength}
          rows={4}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-mono-10">
            {en.checkout.orderNotesHint}
          </span>
          <span className={`${remainingChars < 50 ? 'text-mono-11' : 'text-mono-9'}`}>
            {remainingChars} {en.checkout.charactersRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}
