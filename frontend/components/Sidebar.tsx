'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  BarChart3,
  Receipt,
  FileDown,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vehicles', label: 'Vehicles', icon: Truck },
  { href: '/drivers', label: 'Drivers', icon: Users },
  { href: '/trips', label: 'Trips', icon: MapPin },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reports', label: 'Reports', icon: FileDown },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border/80 bg-card/95 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-2 border-b border-border/80 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">FleetFlow</span>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground')} />
              {item.label}
              {active && <ChevronRight className="ml-auto h-4 w-4 text-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/80 p-4">
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-sm font-medium">{user?.name}</p>
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
