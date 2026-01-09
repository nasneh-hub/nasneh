'use client';

import React from 'react';
import { Skeleton } from '@nasneh/ui';

export default function FoodTrucksPage() {
  return (
    <div
      style={{
        padding: 'var(--spacing-2xl)',
        maxWidth: '1440px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-4xl) 0',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          Food Trucks
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
          Find street food & mobile kitchens
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: 'var(--spacing-md) var(--spacing-xl)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--text-tertiary)',
              margin: 0,
            }}
          >
            Coming soon
          </p>
        </div>
      </div>

      {/* Skeleton placeholders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--spacing-lg)',
          marginTop: 'var(--spacing-2xl)',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} style={{ height: '300px', borderRadius: 'var(--radius-xl)' }} />
        ))}
      </div>
    </div>
  );
}
