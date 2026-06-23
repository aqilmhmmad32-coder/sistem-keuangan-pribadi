'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Lightbulb,
  PiggyBank,
  AlertCircle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
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
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTransactions, getTotalIncome, getTotalExpense } from '@/lib/store';
import { FORMAT_CURRENCY, MONTH_NAMES, CATEGORY_COLORS } from '@/lib/constants';
import type { Transaction } from '@/lib/types';

function Progress({ value, className, colorClass }: { value: number; className?: string; colorClass?: string }) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className || ''}`}>
      <div
        className={`h-full transition-all duration-500 rounded-full ${colorClass || 'bg-primary'}`}
        style={{ width: `${Math.max(Math.min(value, 100), 0)}%` }}
      />
    </div>
  );
}

export default function AnalysisPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    setMounted(true);
    setTransactions(getTransactions());
  }, []);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === selectedYear)
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, selectedYear]);

  const totalExpenseThisYear = useMemo(
    () => categoryData.reduce((s, c) => s + c.value, 0),
    [categoryData]
  );

  const totalIncomeThisYear = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 12; i++) {
      total += getTotalIncome(i, selectedYear);
    }
    return total;
  }, [transactions, selectedYear]);

  const monthlyTrend = useMemo(() => {
    return MONTH_NAMES.map((name, i) => ({
      name: name.substring(0, 3),
      Pemasukan: getTotalIncome(i, selectedYear),
      Pengeluaran: getTotalExpense(i, selectedYear),
    }));
  }, [transactions, selectedYear]);

  const savingsRate = useMemo(() => {
    if (totalIncomeThisYear === 0) return 0;
    return Math.round(((totalIncomeThisYear - totalExpenseThisYear) / totalIncomeThisYear) * 100);
  }, [transactions, selectedYear, totalIncomeThisYear, totalExpenseThisYear]);

  const biggestCategory = useMemo(() => {
    if (categoryData.length === 0) return null;
    return categoryData[0];
  }, [categoryData]);

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if (biggestCategory) {
      const pct = totalExpenseThisYear > 0 ? Math.round((biggestCategory.value / totalExpenseThisYear) * 100) : 0;
      if (pct > 30) {
        recs.push(`Pengeluaran ${biggestCategory.name} mendominasi ${pct}% dari total. Coba kurangi pengeluaran di kategori ini.`);
      }
    }
    if (savingsRate < 20 && savingsRate >= 0) {
      recs.push(`Tingkat tabunganmu hanya ${savingsRate}%. Idealnya simpan minimal 20% dari pemasukan.`);
    } else if (savingsRate >= 20) {
      recs.push(`Bagus! Tingkat tabunganmu ${savingsRate}%. Pertahankan!`);
    }
    if (savingsRate < 0) {
      recs.push('Pengeluaranmu melebihi pemasukan! Segera evaluasi dan buat anggaran baru.');
    }
    const highMonths = monthlyTrend.filter(m => m.Pengeluaran > 0).sort((a, b) => b.Pengeluaran - a.Pengeluaran).slice(0, 2);
    if (highMonths.length > 0) {
      recs.push(`Bulan ${highMonths.map(m => m.name).join(' dan ')} memiliki pengeluaran tertinggi. Periksa apakah ada pengeluaran yang bisa dikurangi.`);
    }
    if (recs.length === 0) {
      recs.push('Mulai catat transaksi untuk mendapatkan rekomendasi penghematan.');
    }
    return recs;
  }, [biggestCategory, savingsRate, monthlyTrend, totalExpenseThisYear]);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analisis</h1>
          <p className="text-sm text-muted-foreground mt-1">Insight keuangan pribadimu</p>
        </div>
        <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
          <SelectTrigger className="w-[110px] h-9 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="card-hover animate-fade-in stagger-1">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Pengeluaran</p>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-[18px] w-[18px] text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-lg font-bold">{FORMAT_CURRENCY(totalExpenseThisYear)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover animate-fade-in stagger-2">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tingkat Tabungan</p>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <PiggyBank className="h-[18px] w-[18px] text-primary" />
              </div>
            </div>
            <p className="text-lg font-bold">{savingsRate}%</p>
            <Progress value={Math.max(savingsRate, 0)} className="mt-2 h-2" colorClass={savingsRate >= 20 ? 'bg-emerald-500' : savingsRate >= 0 ? 'bg-amber-500' : 'bg-red-500'} />
          </CardContent>
        </Card>
        <Card className="card-hover animate-fade-in stagger-3">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Kategori Terbesar</p>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="h-[18px] w-[18px] text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-lg font-bold">{biggestCategory?.name || '-'}</p>
            {biggestCategory && (
              <p className="text-[12px] text-muted-foreground mt-0.5">{FORMAT_CURRENCY(biggestCategory.value)}</p>
            )}
          </CardContent>
        </Card>
        <Card className="card-hover animate-fade-in stagger-4">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Pemasukan</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-lg font-bold">{FORMAT_CURRENCY(totalIncomeThisYear)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="card-hover animate-fade-in stagger-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tren Bulanan {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260} className="sm:h-[300px]">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                formatter={(value: number) => FORMAT_CURRENCY(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 20px -4px hsl(var(--foreground) / 0.1)',
                }}
              />
              <Line type="monotone" dataKey="Pemasukan" stroke="hsl(var(--income))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--income))', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Pengeluaran" stroke="hsl(var(--expense))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--expense))', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="card-hover animate-fade-in stagger-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240} className="sm:h-[280px]">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {categoryData.map((entry, idx) => (
                      <Cell key={idx} fill={CATEGORY_COLORS[entry.name] || '#78716c'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => FORMAT_CURRENCY(value)} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] sm:h-[280px] text-sm text-muted-foreground">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover animate-fade-in stagger-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Detail Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="space-y-4">
                {categoryData.map(c => {
                  const pct = totalExpenseThisYear > 0 ? Math.round((c.value / totalExpenseThisYear) * 100) : 0;
                  return (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[c.name] || '#78716c' }}
                          />
                          <span className="font-medium">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-[12px]">{FORMAT_CURRENCY(c.value)}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{pct}%</Badge>
                        </div>
                      </div>
                      <Progress value={pct} className="h-1.5" colorClass={`bg-[${CATEGORY_COLORS[c.name] || '#78716c'}]`} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-l-4 border-l-primary/50 card-hover animate-fade-in stagger-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Rekomendasi Penghematan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-[13px]">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <span className="text-muted-foreground leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
