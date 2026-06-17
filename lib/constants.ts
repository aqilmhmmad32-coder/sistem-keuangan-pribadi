import type { IncomeCategory, ExpenseCategory, PaymentMethod } from './types';

export const INCOME_CATEGORIES: IncomeCategory[] = ['Gaji', 'Freelance', 'Bisnis', 'Investasi', 'Lainnya'];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Makan', 'Transportasi', 'Belanja', 'Hiburan', 'Pendidikan', 'Kesehatan', 'Tagihan', 'Lainnya'];
export const PAYMENT_METHODS: PaymentMethod[] = ['Tunai', 'Kartu Debit', 'Kartu Kredit', 'E-Wallet', 'Transfer Bank', 'Lainnya'];

export const MOTIVATIONAL_QUOTES = [
  'Uang adalah pelayan yang baik, tetapi tuan yang buruk. — Francis Bacon',
  'Jangan simpan apa yang tersisa setelah belanja, tetapi belanjakan apa yang tersisa setelah menabung. — Warren Buffett',
  'Investasi terbaik adalah investasi pada diri sendiri. — Warren Buffett',
  'Disiplin keuangan adalah jembatan antara tujuan dan pencapaian. — Jim Rohn',
  'Kaya bukan seberapa banyak uang yang kamu punya, tapi seberapa sedikit kebutuhanmu. — Epicurus',
  'Waktu adalah uang. — Benjamin Franklin',
  'Mulailah dari tempat kamu berada. Gunakan apa yang kamu punya. Lakukan apa yang kamu bisa. — Arthur Ashe',
  'Perencanaan keuangan bukan tentang menjadi kaya, tapi tentang menjadi bebas. — Robert Kiyosaki',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Gaji: '#10b981',
  Freelance: '#06b6d4',
  Bisnis: '#f59e0b',
  Investasi: '#8b5cf6',
  Makan: '#ef4444',
  Transportasi: '#f97316',
  Belanja: '#ec4899',
  Hiburan: '#a855f7',
  Pendidikan: '#3b82f6',
  Kesehatan: '#14b8a6',
  Tagihan: '#64748b',
  Lainnya: '#78716c',
};

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const FORMAT_CURRENCY = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
