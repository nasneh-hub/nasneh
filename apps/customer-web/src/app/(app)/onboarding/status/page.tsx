'use client';

import { Card } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

export default function OnboardingStatusPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{en.onboarding.status.title}</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {en.onboarding.status.description}
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{en.onboarding.status.statusLabel}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {en.onboarding.status.pending}
              </p>
            </div>
            <div className="rounded-full bg-[var(--warning)] bg-opacity-10 px-3 py-1">
              <p className="text-sm font-medium text-[var(--warning)]">
                {en.onboarding.status.pending}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--muted)] bg-opacity-50 p-4">
            <p className="text-sm">
              {en.onboarding.status.reviewMessage}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
