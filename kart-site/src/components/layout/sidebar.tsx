'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CreditCard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Receipt,
  Users,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Cards', href: '/cards', icon: CreditCard },
  { name: 'Deposit', href: '/deposit', icon: ArrowDownToLine },
  { name: 'Withdraw', href: '/withdraw', icon: ArrowUpFromLine },
  { name: 'Exchange', href: '/exchange', icon: ArrowLeftRight },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Referrals', href: '/referral', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-border/40 bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border/40 px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">PryCard</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-500'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive && 'text-emerald-500')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border/40 p-3">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
