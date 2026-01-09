'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Logo, Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { useAuth } from '@/context/auth-context';
import {
  Heart,
  ShoppingBag,
  User,
  Package,
  Calendar,
  Star,
  MapPin,
  Headphones,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
// Dialog import removed - no longer needed after removing Globe modal
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@nasneh/ui';
import { Avatar } from '@nasneh/ui';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering theme toggle after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const tabs = [
    { name: 'Kitchens', href: '/kitchens' },
    { name: 'Craft', href: '/craft' },
    { name: 'Products', href: '/products' },
    { name: 'Food Trucks', href: '/food-trucks' },
    { name: 'Services', href: '/services', highlighted: true },
  ];

  const isActiveTab = (href: string) => pathname.startsWith(href);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getInitials = () => {
    if (!user?.phone) return 'U';
    return user.phone.slice(-2).toUpperCase();
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            height: '5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--spacing-xl)',
            maxWidth: '1440px',
            margin: '0 auto',
          }}
        >
          {/* Left: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Home"
            >
              <Logo variant="auto" size={40} />
            </button>
          </div>

          {/* Center: Tabs (Desktop only) */}
          <nav
            style={{
              display: 'none',
              gap: 'var(--spacing-lg)',
            }}
            className="md:flex"
          >
            {tabs.map((tab) => {
              const active = isActiveTab(tab.href);
              const isHighlighted = tab.highlighted;
              return (
                <button
                  key={tab.name}
                  onClick={() => router.push(tab.href)}
                  style={{
                    background: isHighlighted && !active ? 'var(--bg-tertiary)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: active || isHighlighted ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  className="rounded-xl"
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      if (!isHighlighted) {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = isHighlighted ? 'var(--bg-tertiary)' : 'transparent';
                    }
                  }}
                >
                  {tab.name}
                </button>
              );
            })}
          </nav>

          {/* Right: Utilities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            {/* Sell CTA (Desktop only) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/sell')}
              style={{ display: 'none' }}
              className="md:inline-flex"
            >
              Become a Seller
            </Button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                className="rounded-xl hover:bg-[var(--bg-hover)]"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={20} style={{ color: 'var(--text-primary)' }} />
                ) : (
                  <Moon size={20} style={{ color: 'var(--text-primary)' }} />
                )}
              </button>
            )}

            {/* Favorites (Desktop only) */}
            <button
              onClick={() => router.push('/favorites')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--spacing-sm)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              className="md:flex rounded-xl hover:bg-[var(--bg-hover)]"
              aria-label="Favorites"
            >
              <Heart size={20} style={{ color: 'var(--text-primary)' }} />
            </button>

            {/* Cart (Desktop only) */}
            <button
              onClick={() => router.push('/cart')}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--spacing-sm)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'background 0.2s',
              }}
              className="md:flex rounded-xl hover:bg-[var(--bg-hover)]"
              aria-label="Cart"
            >
              <ShoppingBag size={20} style={{ color: 'var(--text-primary)' }} />
              {/* Badge placeholder */}
              <span
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: 'var(--primary)',
                  color: 'var(--text-on-primary)',
                  fontSize: '0.625rem',
                  fontWeight: 'var(--font-weight-bold)',
                  padding: '0.125rem 0.375rem',
                  minWidth: '1.25rem',
                  height: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="rounded-full"
              >
                0
              </span>
            </button>

            {/* Avatar Dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    aria-label="Account menu"
                  >
                    <Avatar size="md" name={user?.name || user?.phone || '?'} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/orders')}>
                    <Package size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/bookings')}>
                    <Calendar size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/reviews')}>
                    <Star size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
                    My Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile/addresses')}>
                    <MapPin size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
                    My Addresses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/wishlist')}>
                    <Heart size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/support')}>
                    <Headphones size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} style={{ marginRight: 'var(--spacing-sm)' }} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={() => router.push('/login')}>
                Login
              </Button>
            )}

            {/* Mobile Menu Button removed - will be implemented in PR4 with proper Sheet component */}
          </div>
        </div>
      </header>

      {/* Globe Modal removed - will be replaced with dropdowns in PR3 */}
    </>
  );
}
