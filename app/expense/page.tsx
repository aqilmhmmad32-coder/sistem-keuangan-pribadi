'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingDown, Search, Pencil, Trash2, Plus, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionForm } from '@/components/transaction-form';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getBudget, getTotalExpense } from '@/lib/store';
import { FORMAT_CURRENCY, MONTH_NAMES, CATEGORY_COLORS } from '@/lib/constants';
import type { Transaction, ExpenseCategory, PaymentMethod } from '@/lib/types';
import { toast } from 'sonner';

export default function ExpensePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDefaults, setEditDefaults] = useState<Record<string, string | number> | undefined>(undefined);

  const now = new Date();

  useEffect(() => {
    setMounted(true);
    setTransactions(getTransactions());
  }, []);

  const expenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        if (search) {
          const q = search.toLowerCase();
          return (
            t.category.toLowerCase().includes(q) ||
            (t.paymentMethod?.toLowerCase().includes(q)) ||
            (t.note?.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .filter(t => {
        if (filterMonth !== 'all' || filterYear !== 'all') {
          const d = new Date(t.date);
          if (filterMonth !== 'all' && d.getMonth() !== parseInt(filterMonth)) return false;
          if (filterYear !== 'all' && d.getFullYear() !== parseInt(filterYear)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, filterMonth, filterYear]);

  const totalExpense = useMemo(() => expenses.reduce((s, t) => s + t.amount, 0), [expenses]);

  const currentMonthBudget = getBudget(now.getMonth(), now.getFullYear());
  const currentMonthExpense = getTotalExpense(now.getMonth(), now.getFullYear());
  const overBudget = currentMonthExpense > currentMonthBudget && currentMonthBudget > 0;
  const budgetUsagePct = currentMonthBudget > 0 ? Math.round((currentMonthExpense / currentMonthBudget) * 100) : 0;

  const handleAdd = (data: { date: string; amount: number; category: string; paymentMethod?: PaymentMethod; note?: string }) => {
    addTransaction({ ...data, type: 'expense', category: data.category as ExpenseCategory });
    setTransactions(getTransactions());
    setDialogOpen(false);
    toast.success('Pengeluaran berhasil ditambahkan');

    const newExpense = getTotalExpense(now.getMonth(), now.getFullYear());
    if (newExpense > currentMonthBudget && currentMonthBudget > 0) {
      toast.warning('Pengeluaran melebihi target bulanan!', { duration: 5000 });
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditId(t.id);
    setEditDefaults({
      date: t.date,
      amount: t.amount,
      category: t.category,
      paymentMethod: t.paymentMethod || '',
      note: t.note || '',
    });
    setDialogOpen(true);
  };

  const handleUpdate = (data: { date: string; amount: number; category: string; paymentMethod?: PaymentMethod; note?: string }) => {
    if (editId) {
      updateTransaction(editId, { ...data, category: data.category as ExpenseCategory });
      setTransactions(getTransactions());
      setEditId(null);
      setEditDefaults(undefined);
      setDialogOpen(false);
      toast.success('Pengeluaran berhasil diperbarui');
    }
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setTransactions(getTransactions());
    toast.success('Pengeluaran berhasil dihapus');
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengeluaran</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola semua pengeluaranmu</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setEditId(null); setEditDefaults(undefined); }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-red-600 hover:bg-red-700 h-9 text-[13px]">
              <Plus className="h-4 w-4" />
              Tambah Pengeluaran
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[15px]">{editId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</DialogTitle>
            </DialogHeader>
            <TransactionForm
              type="expense"
              onSubmit={editId ? handleUpdate : handleAdd}
              defaultValues={editDefaults}
              submitLabel={editId ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Alert */}
      {overBudget && (
        <Card className="border-l-4 border-l-destructive bg-destructive/[0.03] card-hover animate-fade-in stagger-1">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-destructive">Pengeluaran melebihi target!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Target: {FORMAT_CURRENCY(currentMonthBudget)} | Terpakai: {budgetUsagePct}% | Lebih: {FORMAT_CURRENCY(currentMonthExpense - currentMonthBudget)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Progress */}
      {!overBudget && currentMonthBudget > 0 && (
        <Card className="card-hover animate-fade-in stagger-1">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Target Bulanan</p>
              <p className="text-[11px] text-muted-foreground">{budgetUsagePct}% terpakai</p>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all duration-500 rounded-full ${budgetUsagePct > 80 ? 'bg-amber-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(budgetUsagePct, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[11px] text-muted-foreground">{FORMAT_CURRENCY(currentMonthExpense)}</p>
              <p className="text-[11px] text-muted-foreground">{FORMAT_CURRENCY(currentMonthBudget)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="border-l-4 border-l-red-500 card-hover animate-fade-in stagger-2">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Pengeluaran</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{FORMAT_CURRENCY(totalExpense)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col xs:flex-row gap-3 animate-fade-in stagger-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pengeluaran..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-[13px]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-full xs:w-[140px] h-9 text-[13px]">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bulan</SelectItem>
            {MONTH_NAMES.map((m, i) => (
              <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-full xs:w-[110px] h-9 text-[13px]">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {[2024, 2025, 2026].map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <Card className="card-hover animate-fade-in stagger-4">
        <CardContent className="p-0">
          {expenses.length > 0 ? (
            <div className="divide-y divide-border">
              {expenses.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 table-row-hover">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${CATEGORY_COLORS[t.category] || '#ef4444'}15` }}
                  >
                    <TrendingDown className="h-4 w-4" style={{ color: CATEGORY_COLORS[t.category] || '#ef4444' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium truncate">{t.category}</p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                        {t.paymentMethod || 'Tunai'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{t.note || t.date}</p>
                  </div>
                  <p className="text-[13px] font-semibold text-red-600 dark:text-red-400 shrink-0 ml-2 hidden xs:block">-{FORMAT_CURRENCY(t.amount)}</p>
                  <div className="flex items-center gap-0.5 shrink-0 ml-2 xs:ml-4">
                    <p className="text-[13px] font-semibold text-red-600 dark:text-red-400 xs:hidden">-{FORMAT_CURRENCY(t.amount)}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(t)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <TrendingDown className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Belum ada pengeluaran</p>
              <p className="text-[12px] mt-1">Mulai catat pengeluaranmu</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
