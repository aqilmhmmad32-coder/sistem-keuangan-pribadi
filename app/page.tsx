'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Quote,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getTransactions,
  getTotalBalance,
  getTotalIncome,
  getTotalExpense,
} from '@/lib/store';
import { MOTIVATIONAL_QUOTES, MONTH_NAMES, FORMAT_CURRENCY, CATEGORY_COLORS } from '@/lib/constants';
import type { Transaction } from '@/lib/types';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    setMounted(true);
    setTransactions(getTransactions());
  }, []);

  const totalBalance = useMemo(() => getTotalBalance(), [transactions]);
  const monthIncome = useMemo(() => getTotalIncome(selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const monthExpense = useMemo(() => getTotalExpense(selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const cashFlow = monthIncome - monthExpense;

  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[idx];
  }, []);

  const monthlyChartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      data.push({
        name: MONTH_NAMES[m].substring(0, 3),
        Pemasukan: getTotalIncome(m, y),
        Pengeluaran: getTotalExpense(m, y),
      });
    }
    return data;
  }, [transactions, selectedMonth, selectedYear]);

  const expensePieData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      })
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedMonth, selectedYear]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [transactions]);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan keuangan pribadimu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[130px] h-9 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px] h-9 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Motivational Quote */}
      <Card className="border-l-4 border-l-primary/50 bg-primary/[0.03] card-hover animate-fade-in stagger-1">
        <CardContent className="flex items-start gap-3 py-4">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[13px] italic text-muted-foreground leading-relaxed">{quote}</p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Saldo"
          value={FORMAT_CURRENCY(totalBalance)}
          icon={<Wallet className="h-[18px] w-[18px]" />}
          trend={totalBalance >= 0 ? 'up' : 'down'}
          color="primary"
          className="animate-fade-in stagger-2"
        />
        <StatCard
          title="Pemasukan Bulan Ini"
          value={FORMAT_CURRENCY(monthIncome)}
          icon={<TrendingUp className="h-[18px] w-[18px]" />}
          trend="up"
          color="income"
          className="animate-fade-in stagger-3"
        />
        <StatCard
          title="Pengeluaran Bulan Ini"
          value={FORMAT_CURRENCY(monthExpense)}
          icon={<TrendingDown className="h-[18px] w-[18px]" />}
          trend="down"
          color="expense"
          className="animate-fade-in stagger-4"
        />
        <StatCard
          title="Cash Flow"
          value={FORMAT_CURRENCY(cashFlow)}
          icon={cashFlow >= 0 ? <ArrowUpRight className="h-[18px] w-[18px]" /> : <ArrowDownRight className="h-[18px] w-[18px]" />}
          trend={cashFlow >= 0 ? 'up' : 'down'}
          color={cashFlow >= 0 ? 'income' : 'expense'}
          className="animate-fade-in stagger-5"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 card-hover animate-fade-in stagger-5">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4">Pemasukan vs Pengeluaran</h3>
            <ResponsiveContainer width="100%" height={260} className="sm:h-[280px]">
              <BarChart data={monthlyChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} axisLine={false} tickLine={false} width={42} />
                <Tooltip
                  formatter={(value: number) => FORMAT_CURRENCY(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px -4px hsl(var(--foreground) / 0.1)',
                  }}
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                />
                <Bar dataKey="Pemasukan" fill="hsl(var(--income))" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Pengeluaran" fill="hsl(var(--expense))" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in stagger-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-4">Kategori Pengeluaran</h3>
            {expensePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260} className="sm:h-[280px]">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {expensePieData.map((entry, idx) => (
                      <Cell key={idx} fill={CATEGORY_COLORS[entry.name] || '#78716c'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => FORMAT_CURRENCY(value)} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                Belum ada data pengeluaran
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="card-hover animate-fade-in stagger-6">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-4">Transaksi Terbaru</h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3 px-3 rounded-xl table-row-hover"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        t.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {t.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{t.category}</p>
                      <p className="text-[11px] text-muted-foreground">{t.note || t.source || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-[13px] font-semibold ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}{FORMAT_CURRENCY(t.amount)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wallet className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Belum ada transaksi</p>
              <p className="text-[12px] mt-1">Mulai catat pemasukan dan pengeluaranmu</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  color,
  className,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  color: 'primary' | 'income' | 'expense';
  className?: string;
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    income: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    expense: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <Card className={`card-hover ${className || ''}`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            {icon}
          </div>
        </div>
        <p className="text-lg font-bold tracking-tight">{value}</p>
        <Badge
          variant="secondary"
          className={`mt-2 text-[10px] px-1.5 py-0 ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10' : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/10'
          }`}
        >
          {trend === 'up' ? 'Naik' : 'Turun'}
        </Badge>
      </CardContent>
    </Card>
  );
}
