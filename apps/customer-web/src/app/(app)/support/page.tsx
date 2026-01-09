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
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--spacing-xl)',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 'var(--spacing-3xl)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <Headphones size={64} style={{ color: 'var(--text-tertiary)' }} />
        </div>
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
            margin: 0,
          }}
        >
          {en.support.support}
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-large)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {en.support.supportDescription}
        </p>
      </div>

      {/* Support Options Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-xl)',
        }}
      >
        {supportOptions.map((option, index) => (
          <Card key={index}>
            <div
              style={{
                padding: 'var(--spacing-xl)',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  background: 'var(--bg-tertiary)',
                  marginBottom: 'var(--spacing-lg)',
                }}
                className="rounded-xl"
              >
                <option.icon size={32} style={{ color: 'var(--text-secondary)' }} />
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: 'var(--font-size-h3)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-sm)',
                  margin: 0,
                }}
              >
                {option.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-base)',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                {option.description}
              </p>

              {/* Action Button */}
              <Button
                variant="secondary"
                size="md"
                onClick={option.action}
                style={{ width: '100%' }}
              >
                {en.support.getInTouch}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Help Section */}
      <div
        style={{
          marginTop: 'var(--spacing-3xl)',
          padding: 'var(--spacing-2xl)',
          background: 'var(--bg-secondary)',
          textAlign: 'center',
        }}
        className="rounded-xl"
      >
        <h2
          style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
            margin: 0,
          }}
        >
          {en.support.needHelp}
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-base)',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
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
