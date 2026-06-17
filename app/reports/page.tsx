'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, FileSpreadsheet, TrendingUp, TrendingDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTransactions, getTotalIncome, getTotalExpense, exportToCSV } from '@/lib/store';
import { FORMAT_CURRENCY, MONTH_NAMES } from '@/lib/constants';
import type { Transaction } from '@/lib/types';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    setMounted(true);
    setTransactions(getTransactions());
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, selectedYear]);

  const monthIncome = useMemo(() => getTotalIncome(selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const monthExpense = useMemo(() => getTotalExpense(selectedMonth, selectedYear), [transactions, selectedMonth, selectedYear]);
  const balance = monthIncome - monthExpense;

  const dailyData = useMemo(() => {
    const map: Record<string, { Pemasukan: number; Pengeluaran: number }> = {};
    filteredTransactions.forEach(t => {
      if (!map[t.date]) map[t.date] = { Pemasukan: 0, Pengeluaran: 0 };
      if (t.type === 'income') map[t.date].Pemasukan += t.amount;
      else map[t.date].Pengeluaran += t.amount;
    });
    return Object.entries(map)
      .map(([date, vals]) => ({ date, ...vals }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const csv = exportToCSV(filteredTransactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack_${MONTH_NAMES[selectedMonth]}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const printContent = `
      <html>
        <head><title>Laporan Keuangan - ${MONTH_NAMES[selectedMonth]} ${selectedYear}</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 24px; margin-bottom: 4px; font-weight: 700; }
          .subtitle { color: #888; font-size: 14px; margin-bottom: 24px; }
          .summary { display: flex; gap: 16px; margin: 16px 0; }
          .summary-card { padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; flex: 1; }
          .summary-card label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
          .summary-card p { font-size: 20px; font-weight: 700; margin-top: 4px; }
          .income { color: #10b981; }
          .expense { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          th { font-weight: 600; color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
          .badge-income { background: #ecfdf5; color: #10b981; }
          .badge-expense { background: #fef2f2; color: #ef4444; }
          @media print { body { padding: 20px; } }
        </style></head>
        <body>
          <h1>Laporan Keuangan</h1>
          <p class="subtitle">${MONTH_NAMES[selectedMonth]} ${selectedYear}</p>
          <div class="summary">
            <div class="summary-card"><label>Pemasukan</label><p class="income">${FORMAT_CURRENCY(monthIncome)}</p></div>
            <div class="summary-card"><label>Pengeluaran</label><p class="expense">${FORMAT_CURRENCY(monthExpense)}</p></div>
            <div class="summary-card"><label>Saldo Bersih</label><p>${FORMAT_CURRENCY(balance)}</p></div>
          </div>
          <h2 style="font-size: 16px; margin-top: 32px; color: #555;">Daftar Transaksi</h2>
          <table>
            <thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Nominal</th><th>Catatan</th></tr></thead>
            <tbody>${filteredTransactions.map(t => `<tr><td>${t.date}</td><td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.type === 'income' ? 'Masuk' : 'Keluar'}</span></td><td>${t.category}</td><td class="${t.type === 'income' ? 'income' : 'expense'}" style="font-weight:600">${FORMAT_CURRENCY(t.amount)}</td><td style="color:#888">${t.note || '-'}</td></tr>`).join('')}</tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
          <p className="text-sm text-muted-foreground mt-1">Export dan ringkasan data keuangan</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500 card-hover animate-fade-in stagger-1">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pemasukan</p>
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{FORMAT_CURRENCY(monthIncome)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 card-hover animate-fade-in stagger-2">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pengeluaran</p>
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{FORMAT_CURRENCY(monthExpense)}</p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${balance >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'} card-hover animate-fade-in stagger-3`}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Saldo Bersih</p>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {FORMAT_CURRENCY(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Chart */}
      <Card className="card-hover animate-fade-in stagger-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Transaksi Harian - {MONTH_NAMES[selectedMonth]} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => v.substring(8)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} axisLine={false} tickLine={false} width={50} />
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Pemasukan" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="Pengeluaran" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
              Belum ada transaksi untuk periode ini
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card className="card-hover animate-fade-in stagger-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3 table-row-hover">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      t.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {t.type === 'income' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium truncate">{t.category}</p>
                        <Badge variant={t.type === 'income' ? 'secondary' : 'destructive'} className="text-[10px] px-1.5 py-0">
                          {t.type === 'income' ? 'Masuk' : 'Keluar'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{t.date}</p>
                    </div>
                  </div>
                  <p className={`text-[13px] font-semibold shrink-0 ml-4 ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{FORMAT_CURRENCY(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Belum ada transaksi untuk periode ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in stagger-6">
        <Button onClick={handleExportCSV} variant="outline" className="gap-2 h-9 text-[13px]">
          <FileSpreadsheet className="h-4 w-4" />
          Export ke CSV / Excel
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2 h-9 text-[13px]">
          <Download className="h-4 w-4" />
          Export ke PDF (Print)
        </Button>
      </div>
    </div>
  );
}
