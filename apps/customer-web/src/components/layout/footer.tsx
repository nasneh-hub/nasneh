'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

export function Footer() {
  const router = useRouter();

  const footerLinks = {
    marketplace: [
      { name: en.footer.kitchens, href: '/kitchens' },
      { name: en.footer.craft, href: '/craft' },
      { name: en.footer.products, href: '/products' },
      { name: en.footer.foodTrucks, href: '/food-trucks' },
      { name: en.footer.services, href: '/services' },
    ],
    company: [
      { name: en.footer.aboutUs, href: '/about' },
      { name: en.footer.howItWorks, href: '/how-it-works' },
      { name: en.footer.careers, href: '/careers' },
      { name: en.footer.press, href: '/press' },
    ],
    support: [
      { name: en.footer.helpCenter, href: '/support' },
      { name: en.footer.safety, href: '/safety' },
      { name: en.footer.contactUs, href: '/contact' },
    ],
    legal: [
      { name: en.footer.termsOfService, href: '/terms' },
      { name: en.footer.privacyPolicy, href: '/privacy' },
      { name: en.footer.cookiePolicy, href: '/cookies' },
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
              {en.taglines.primary}
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
              {en.footer.marketplace}
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
              {en.footer.company}
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
              {en.footer.support}
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
              {en.footer.legal}
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
            paddingTop: 'var(--spacing-xl)',
            borderTop: `1px solid var(--border-primary)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
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
            <p
              style={{
                color: 'var(--text-tertiary)',
                fontSize: 'var(--font-size-small)',
                margin: 0,
              }}
            >
              {en.footer.madeIn} {en.footer.bahrain}
            </p>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
