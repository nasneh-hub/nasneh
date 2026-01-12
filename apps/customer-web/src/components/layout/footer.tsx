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
      { name: 'Market', href: '/market' },
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
    <footer className="mt-[var(--spacing-3xl)] border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="mx-auto max-w-[1440px] px-[var(--spacing-xl)] py-[var(--spacing-3xl)]">
        {/* Main Footer Content */}
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div>
            <div className="mb-[var(--spacing-lg)]">
              <Logo variant="auto" size={40} />
            </div>
            <p className="text-[length:var(--font-size-small)] leading-[1.6] text-[var(--text-secondary)]">
              {en.taglines.primary}
            </p>
          </div>

          {/* Marketplace Column */}
          <div>
            <h3 className="mb-[var(--spacing-md)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              {en.footer.marketplace}
            </h3>
            <ul className="m-0 list-none p-0">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name} className="mb-[var(--spacing-sm)]">
                  <button
                    onClick={() => router.push(link.href)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[length:var(--font-size-small)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-[var(--spacing-md)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              {en.footer.company}
            </h3>
            <ul className="m-0 list-none p-0">
              {footerLinks.company.map((link) => (
                <li key={link.name} className="mb-[var(--spacing-sm)]">
                  <button
                    onClick={() => router.push(link.href)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[length:var(--font-size-small)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="mb-[var(--spacing-md)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              {en.footer.support}
            </h3>
            <ul className="m-0 list-none p-0">
              {footerLinks.support.map((link) => (
                <li key={link.name} className="mb-[var(--spacing-sm)]">
                  <button
                    onClick={() => router.push(link.href)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[length:var(--font-size-small)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-[var(--spacing-md)] text-[length:var(--font-size-base)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              {en.footer.legal}
            </h3>
            <ul className="m-0 list-none p-0">
              {footerLinks.legal.map((link) => (
                <li key={link.name} className="mb-[var(--spacing-sm)]">
                  <button
                    onClick={() => router.push(link.href)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[length:var(--font-size-small)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border-primary)] pt-[var(--spacing-xl)]">
          <div className="flex flex-col items-center gap-[var(--spacing-md)]">
            <p className="m-0 text-[length:var(--font-size-small)] text-[var(--text-tertiary)]">
              {en.footer.madeIn} {en.footer.bahrain}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
