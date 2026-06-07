'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const publicLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'How It Works', href: '/#how-it-works' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
];

const authNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Cards', href: '/cards', icon: CreditCard },
  { name: 'Top Up', href: '/deposit', icon: Wallet },
  { name: 'Referral', href: '/referral', icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">PryCard</span>
            </Link>

            {!session && (
              <div className="hidden md:flex items-center gap-1">
                {publicLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {session && (
              <div className="hidden md:flex items-center gap-1">
                {authNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[180px]">
                  {session.user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="gradient" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <div className="flex flex-col gap-1">
              {session
                ? authNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })
                : publicLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      {item.name}
                    </Link>
                  ))}
              {!session && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm text-muted-foreground"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
