'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Wallet,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
  { href: '/income', label: 'Pemasukan', icon: TrendingUp, section: 'main' },
  { href: '/expense', label: 'Pengeluaran', icon: TrendingDown, section: 'main' },
  { href: '/analysis', label: 'Analisis', icon: BarChart3, section: 'insights' },
  { href: '/reports', label: 'Laporan', icon: FileText, section: 'insights' },
  { href: '/settings', label: 'Pengaturan', icon: Settings, section: 'system' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sectionLabels: Record<string, string> = {
    main: 'Menu Utama',
    insights: 'Insight',
    system: 'Sistem',
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden h-9 w-9 rounded-xl bg-card/80 backdrop-blur-sm border border-border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-[260px] bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] z-40 transition-transform duration-300 ease-in-out flex flex-col',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-16 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Wallet className="h-[18px] w-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-semibold tracking-tight text-[hsl(var(--sidebar-foreground))]">FinTrack</h1>
            <p className="text-[11px] text-[hsl(var(--sidebar-muted))] font-medium">Personal Finance</p>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {['main', 'insights', 'system'].map(section => {
            const items = NAV_ITEMS.filter(i => i.section === section);
            return (
              <div key={section}>
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-muted))]">
                  {sectionLabels[section]}
                </p>
                <div className="space-y-0.5">
                  {items.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-foreground))]/[0.04] hover:text-[hsl(var(--sidebar-foreground))]'
                        )}
                      >
                        <item.icon className={cn(
                          'h-[18px] w-[18px] transition-colors',
                          isActive ? 'text-primary' : 'text-[hsl(var(--sidebar-muted))] group-hover:text-[hsl(var(--sidebar-foreground))]'
                        )} />
                        {item.label}
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-[hsl(var(--sidebar-border))]">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 h-9 text-[13px] font-medium text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-foreground))]/[0.04] rounded-xl"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
            {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          </Button>
        </div>
      </aside>
    </>
  );
}
