'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Logo, Button, NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@nasneh/ui';
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
  Globe,
} from 'lucide-react';
import { useTheme } from 'next-themes';
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
    { name: 'Craft', href: '/categories/craft' },
    { name: 'Products', href: '/products' },
    { name: 'Food Trucks', href: '/categories/food-trucks' },
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
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)] shadow-[var(--shadow-sm)]">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-[var(--spacing-xl)] relative">
          {/* Left: Logo */}
          <div className="flex items-center gap-[var(--spacing-lg)]">
            <button
              onClick={() => router.push('/')}
              className="flex h-10 w-10 cursor-pointer items-center justify-center border-none bg-transparent p-0"
              aria-label="Home"
            >
              <Logo variant="auto" size={40} />
            </button>
          </div>

          {/* Center: NavigationMenu (Desktop only) - Using absolute positioning within relative container */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {tabs.map((tab) => {
                  const active = isActiveTab(tab.href);
                  const isHighlighted = tab.highlighted;
                  return (
                    <NavigationMenuItem key={tab.name}>
                      <NavigationMenuLink
                        href={tab.href}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(tab.href);
                        }}
                        active={active}
                        className={
                          isHighlighted && !active
                            ? 'bg-[var(--bg-tertiary)] font-[var(--font-weight-semibold)]'
                            : isHighlighted
                            ? 'font-[var(--font-weight-semibold)]'
                            : ''
                        }
                      >
                        {tab.name}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: Utilities */}
          <div className="flex items-center gap-[var(--spacing-md)]">
            {/* Sell CTA (Desktop only) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/sell')}
              className="hidden md:inline-flex"
            >
              Become a Seller
            </Button>

            {/* Settings Dropdown (Language/Currency/Country) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex cursor-pointer items-center justify-center rounded-xl border-none bg-transparent p-[var(--spacing-sm)] transition-colors duration-200 hover:bg-[var(--bg-hover)]"
                  aria-label="Settings"
                >
                  <Globe size={20} className="text-[var(--text-primary)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                {/* Language Section */}
                <div className="px-[var(--spacing-sm)] py-[var(--spacing-xs)]">
                  <p className="m-0 text-[length:var(--font-size-xs)] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)]">
                    {en.settings.language}
                  </p>
                </div>
                <DropdownMenuItem>
                  <span className="text-[var(--text-primary)]">{en.settings.english}</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-[var(--text-tertiary)]">{en.settings.arabic} ({en.settings.comingSoon})</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Currency Section */}
                <div className="px-[var(--spacing-sm)] py-[var(--spacing-xs)]">
                  <p className="m-0 text-[length:var(--font-size-xs)] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)]">
                    {en.settings.currency}
                  </p>
                </div>
                <DropdownMenuItem>
                  <span className="text-[var(--text-primary)]">{en.settings.bahrainDinar}</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Country Section */}
                <div className="px-[var(--spacing-sm)] py-[var(--spacing-xs)]">
                  <p className="m-0 text-[length:var(--font-size-xs)] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)]">
                    {en.settings.country}
                  </p>
                </div>
                <DropdownMenuItem>
                  <span className="text-[var(--text-primary)]">{en.settings.bahrain}</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-[var(--text-tertiary)]">{en.settings.gcc} ({en.settings.comingSoon})</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex cursor-pointer items-center justify-center rounded-xl border-none bg-transparent p-[var(--spacing-sm)] transition-colors duration-200 hover:bg-[var(--bg-hover)]"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={20} className="text-[var(--text-primary)]" />
                ) : (
                  <Moon size={20} className="text-[var(--text-primary)]" />
                )}
              </button>
            )}

            {/* Favorites (Desktop only) */}
            <button
              onClick={() => router.push('/favorites')}
              className="hidden cursor-pointer items-center justify-center rounded-xl border-none bg-transparent p-[var(--spacing-sm)] transition-colors duration-200 hover:bg-[var(--bg-hover)] md:flex"
              aria-label="Favorites"
            >
              <Heart size={20} className="text-[var(--text-primary)]" />
            </button>

            {/* Cart (Desktop only) */}
            <button
              onClick={() => router.push('/cart')}
              className="relative hidden cursor-pointer items-center justify-center rounded-xl border-none bg-transparent p-[var(--spacing-sm)] transition-colors duration-200 hover:bg-[var(--bg-hover)] md:flex"
              aria-label="Cart"
            >
              <ShoppingBag size={20} className="text-[var(--text-primary)]" />
              {/* Badge placeholder */}
              <span className="absolute right-0 top-0 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-[0.625rem] font-[var(--font-weight-bold)] text-[var(--text-on-primary)]">
                0
              </span>
            </button>

            {/* Avatar Dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex cursor-pointer items-center justify-center rounded-xl border-none bg-transparent p-0 transition-colors duration-200 hover:bg-[var(--bg-hover)]"
                    aria-label="User menu"
                  >
                    <Avatar name={getInitials()} size="md" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
                  <div className="px-[var(--spacing-sm)] py-[var(--spacing-xs)]">
                    <p className="m-0 text-[length:var(--font-size-sm)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                      {user?.phone || 'Guest'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User size={16} className="mr-[var(--spacing-sm)]" />
                    {en.profile.myProfile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/orders')}>
                    <Package size={16} className="mr-[var(--spacing-sm)]" />
                    {en.orders.myOrders}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/bookings')}>
                    <Calendar size={16} className="mr-[var(--spacing-sm)]" />
                    {en.bookings.myBookings}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/reviews')}>
                    <Star size={16} className="mr-[var(--spacing-sm)]" />
                    {en.reviews.myReviews}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/addresses')}>
                    <MapPin size={16} className="mr-[var(--spacing-sm)]" />
                    {en.profile.myAddresses}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/favorites')}>
                    <Heart size={16} className="mr-[var(--spacing-sm)]" />
                    {en.wishlist.myWishlist}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/support')}>
                    <Headphones size={16} className="mr-[var(--spacing-sm)]" />
                    {en.support.support}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} className="mr-[var(--spacing-sm)]" />
                    {en.auth.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/login')}
              >
                {en.auth.login}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-primary)] shadow-[var(--shadow-md)] md:hidden">
        <div className="flex h-16 items-center justify-around px-[var(--spacing-md)]">
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center justify-center gap-1 border-none bg-transparent p-[var(--spacing-xs)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
            aria-label="Home"
          >
            <Package size={20} />
            <span className="text-[0.625rem]">{en.dashboard.home}</span>
          </button>

          <button
            onClick={() => router.push('/categories')}
            className="flex flex-col items-center justify-center gap-1 border-none bg-transparent p-[var(--spacing-xs)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
            aria-label="Categories"
          >
            <Globe size={20} />
            <span className="text-[0.625rem]">{en.categories.allCategories.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => router.push('/favorites')}
            className="flex flex-col items-center justify-center gap-1 border-none bg-transparent p-[var(--spacing-xs)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
            aria-label="Favorites"
          >
            <Heart size={20} />
            <span className="text-[0.625rem]">{en.wishlist.wishlist}</span>
          </button>

          <button
            onClick={() => router.push('/cart')}
            className="relative flex flex-col items-center justify-center gap-1 border-none bg-transparent p-[var(--spacing-xs)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            <span className="text-[0.625rem]">{en.orders.cart}</span>
            <span className="absolute right-0 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[0.5rem] font-[var(--font-weight-bold)] text-[var(--text-on-primary)]">
              0
            </span>
          </button>

          <button
            onClick={() => router.push(isAuthenticated ? '/profile' : '/login')}
            className="flex flex-col items-center justify-center gap-1 border-none bg-transparent p-[var(--spacing-xs)] text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--text-primary)]"
            aria-label="Profile"
          >
            <User size={20} />
            <span className="text-[0.625rem]">{en.dashboard.profile}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
