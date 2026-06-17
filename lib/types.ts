export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 'Gaji' | 'Freelance' | 'Bisnis' | 'Investasi' | 'Lainnya';
export type ExpenseCategory = 'Makan' | 'Transportasi' | 'Belanja' | 'Hiburan' | 'Pendidikan' | 'Kesehatan' | 'Tagihan' | 'Lainnya';
export type PaymentMethod = 'Tunai' | 'Kartu Debit' | 'Kartu Kredit' | 'E-Wallet' | 'Transfer Bank' | 'Lainnya';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  source?: string;
  paymentMethod?: PaymentMethod;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  month: number;
  year: number;
  budget: number;
}

export interface AppSettings {
  currency: string;
  monthlyBudget: number;
  notifications: boolean;
}
