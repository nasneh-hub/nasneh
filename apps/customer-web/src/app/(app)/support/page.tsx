'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, Mail, MessageCircle, HelpCircle } from 'lucide-react';
import { Card, Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

export default function SupportPage() {
  const router = useRouter();

  const supportOptions = [
    {
      icon: HelpCircle,
      title: en.support.faq,
      description: 'Find answers to common questions',
      action: () => router.push('/faq'),
    },
    {
      icon: MessageCircle,
      title: en.support.contactUs,
      description: 'Send us a message',
      action: () => router.push('/contact'),
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@nasneh.com',
      action: () => window.open('mailto:support@nasneh.com'),
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] p-[var(--spacing-xl)]">
      {/* Page Header */}
      <div className="mb-[var(--spacing-3xl)] text-center">
        <div className="mb-[var(--spacing-lg)] inline-flex items-center justify-center">
          <Headphones size={64} className="text-[var(--text-tertiary)]" />
        </div>
        <h1 className="m-0 mb-[var(--spacing-md)] text-[length:var(--font-size-h1)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          {en.support.support}
        </h1>
        <p className="mx-auto max-w-[600px] text-[length:var(--font-size-large)] text-[var(--text-secondary)]">
          {en.support.supportDescription}
        </p>
      </div>

      {/* Support Options Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[var(--spacing-xl)]">
        {supportOptions.map((option, index) => (
          <Card key={index}>
            <div className="p-[var(--spacing-xl)] text-center">
              {/* Icon */}
              <div className="mb-[var(--spacing-lg)] inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--bg-tertiary)]">
                <option.icon size={32} className="text-[var(--text-secondary)]" />
              </div>

              {/* Title */}
              <h3 className="m-0 mb-[var(--spacing-sm)] text-[length:var(--font-size-h3)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {option.title}
              </h3>

              {/* Description */}
              <p className="mb-[var(--spacing-lg)] text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
                {option.description}
              </p>

              {/* Action Button */}
              <Button
                variant="secondary"
                size="md"
                onClick={option.action}
                className="w-full"
              >
                {en.support.getInTouch}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Help Section */}
      <div className="mt-[var(--spacing-3xl)] rounded-xl bg-[var(--bg-secondary)] p-[var(--spacing-2xl)] text-center">
        <h2 className="m-0 mb-[var(--spacing-md)] text-[length:var(--font-size-h2)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          {en.support.needHelp}
        </h2>
        <p className="mb-[var(--spacing-xl)] text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
          Our support team is here to help you with any questions or issues
        </p>
        <Button
          variant="default"
          size="lg"
          onClick={() => router.push('/contact')}
        >
          {en.support.contactUs}
        </Button>
      </div>
    </div>
  );
}
