'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@nasneh/ui';

export function Footer() {
  const router = useRouter();

  const footerLinks = {
    marketplace: [
      { name: 'Kitchens', href: '/kitchens' },
      { name: 'Craft', href: '/craft' },
      { name: 'Products', href: '/products' },
      { name: 'Food Trucks', href: '/food-trucks' },
      { name: 'Services', href: '/services' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Help Center', href: '/support' },
      { name: 'Safety', href: '/safety' },
      { name: 'Contact Us', href: '/contact' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: `1px solid var(--border-primary)`,
        marginTop: 'var(--spacing-3xl)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: 'var(--spacing-3xl) var(--spacing-xl)',
        }}
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <Logo variant="auto" size={40} />
            </div>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-small)',
                lineHeight: '1.6',
              }}
            >
              From us, for us — Your marketplace for homemade food, handcrafted products, and trusted services
            </p>
          </div>

          {/* Marketplace Column */}
          <div>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Marketplace
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {footerLinks.marketplace.map((link) => (
                <li key={link.name} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <button
                    onClick={() => router.push(link.href)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-small)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Company
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {footerLinks.company.map((link) => (
                <li key={link.name} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <button
                    onClick={() => router.push(link.href)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-small)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Support
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {footerLinks.support.map((link) => (
                <li key={link.name} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <button
                    onClick={() => router.push(link.href)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-small)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Legal
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {footerLinks.legal.map((link) => (
                <li key={link.name} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <button
                    onClick={() => router.push(link.href)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-small)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: `1px solid var(--border-primary)`,
            paddingTop: 'var(--spacing-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
          }}
        >
          <p
            style={{
              color: 'var(--text-tertiary)',
              fontSize: 'var(--font-size-small)',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Nasneh. All rights reserved.
          </p>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <p
              style={{
                color: 'var(--text-tertiary)',
                fontSize: 'var(--font-size-small)',
                margin: 0,
              }}
            >
              Made with care in Saudi Arabia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
