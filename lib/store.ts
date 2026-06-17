'use client';

import type { Transaction, AppSettings, MonthlyBudget } from './types';
import { generateId } from './constants';

const TRANSACTIONS_KEY = 'fintrack_transactions';
const SETTINGS_KEY = 'fintrack_settings';
const BUDGETS_KEY = 'fintrack_budgets';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'IDR',
  monthlyBudget: 5000000,
  notifications: true,
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Transactions
export function getTransactions(): Transaction[] {
  return safeGet<Transaction[]>(TRANSACTIONS_KEY, []);
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
  const now = new Date().toISOString();
  const transaction: Transaction = { ...tx, id: generateId(), createdAt: now, updatedAt: now };
  const all = getTransactions();
  all.push(transaction);
  safeSet(TRANSACTIONS_KEY, all);
  return transaction;
}

export function updateTransaction(id: string, data: Partial<Transaction>): Transaction | null {
  const all = getTransactions();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  safeSet(TRANSACTIONS_KEY, all);
  return all[idx];
}

export function deleteTransaction(id: string): boolean {
  const all = getTransactions();
  const filtered = all.filter(t => t.id !== id);
  if (filtered.length === all.length) return false;
  safeSet(TRANSACTIONS_KEY, filtered);
  return true;
}

// Settings
export function getSettings(): AppSettings {
  return safeGet<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function updateSettings(data: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...data };
  safeSet(SETTINGS_KEY, updated);
  return updated;
}

// Budgets
export function getBudgets(): MonthlyBudget[] {
  return safeGet<MonthlyBudget[]>(BUDGETS_KEY, []);
}

export function setBudget(month: number, year: number, budget: number): MonthlyBudget {
  const all = getBudgets();
  const idx = all.findIndex(b => b.month === month && b.year === year);
  if (idx !== -1) {
    all[idx].budget = budget;
  } else {
    all.push({ month, year, budget });
  }
  safeSet(BUDGETS_KEY, all);
  return { month, year, budget };
}

export function getBudget(month: number, year: number): number {
  const all = getBudgets();
  const found = all.find(b => b.month === month && b.year === year);
  return found?.budget ?? getSettings().monthlyBudget;
}

// Stats helpers
export function getMonthTransactions(month: number, year: number): Transaction[] {
  return getTransactions().filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

export function getTotalIncome(month: number, year: number): number {
  return getMonthTransactions(month, year)
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
}

export function getTotalExpense(month: number, year: number): number {
  return getMonthTransactions(month, year)
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
}

export function getTotalBalance(): number {
  return getTransactions().reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);
}

// Export helpers
export function exportToCSV(transactions: Transaction[]): string {
  const headers = 'Tanggal,Tipe,Nominal,Kategori,Sumber,Metode Pembayaran,Catatan';
  const rows = transactions.map(t =>
    `${t.date},${t.type},${t.amount},${t.category},${t.source || ''},${t.paymentMethod || ''},${t.note || ''}`
  );
  return [headers, ...rows].join('\n');
}
