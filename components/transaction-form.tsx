'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, FORMAT_CURRENCY } from '@/lib/constants';
import type { TransactionType, PaymentMethod } from '@/lib/types';

const baseSchema = z.object({
  date: z.date({ required_error: 'Tanggal wajib diisi' }),
  amount: z.coerce.number().min(1, 'Nominal wajib diisi'),
  source: z.string().optional().default(''),
  category: z.string().min(1, 'Kategori wajib diisi'),
  paymentMethod: z.string().optional().default(''),
  note: z.string().optional().default(''),
});

type FormData = z.infer<typeof baseSchema>;

interface TransactionFormProps {
  type: TransactionType;
  onSubmit: (data: {
    date: string;
    amount: number;
    category: string;
    source?: string;
    paymentMethod?: PaymentMethod;
    note?: string;
  }) => void;
  defaultValues?: {
    date?: string;
    amount?: number;
    source?: string;
    category?: string;
    paymentMethod?: string;
    note?: string;
  };
  submitLabel?: string;
}

export function TransactionForm({ type, onSubmit, defaultValues, submitLabel }: TransactionFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const form = useForm<FormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: defaultValues
      ? {
          date: new Date(defaultValues.date!),
          amount: defaultValues.amount,
          source: defaultValues.source || '',
          category: defaultValues.category || '',
          paymentMethod: defaultValues.paymentMethod || '',
          note: defaultValues.note || '',
        }
      : {
          date: new Date(),
          amount: undefined as unknown as number,
          source: '',
          category: '',
          paymentMethod: '',
          note: '',
        },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      date: format(data.date, 'yyyy-MM-dd'),
      amount: data.amount,
      category: data.category,
      source: type === 'income' ? data.source : undefined,
      paymentMethod: type === 'expense' ? (data.paymentMethod as PaymentMethod) : undefined,
      note: data.note || undefined,
    });
    form.reset({
      date: new Date(),
      amount: undefined as unknown as number,
      source: '',
      category: '',
      paymentMethod: '',
      note: '',
    });
  });

  const watchDate = form.watch('date');
  const watchCategory = form.watch('category');
  const watchPaymentMethod = form.watch('paymentMethod');
  const watchAmount = form.watch('amount');

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date */}
      <div className="space-y-1.5">
        <Label className="text-[13px]">Tanggal</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-full justify-start text-left font-normal h-9 text-[13px]', !watchDate && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchDate ? format(watchDate, 'dd MMMM yyyy') : 'Pilih tanggal'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watchDate}
              onSelect={(d) => {
                if (d) {
                  form.setValue('date', d);
                  setCalendarOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.date && <p className="text-[12px] text-destructive">{form.formState.errors.date.message}</p>}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label className="text-[13px]">Nominal (Rp)</Label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0"
            className="h-9 text-[13px] pr-20"
            {...form.register('amount')}
          />
          {watchAmount > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-medium">
              {FORMAT_CURRENCY(watchAmount)}
            </span>
          )}
        </div>
        {form.formState.errors.amount && <p className="text-[12px] text-destructive">{form.formState.errors.amount.message}</p>}
      </div>

      {/* Source (income only) */}
      {type === 'income' && (
        <div className="space-y-1.5">
          <Label className="text-[13px]">Sumber Pemasukan</Label>
          <Input placeholder="Contoh: PT ABC" className="h-9 text-[13px]" {...form.register('source')} />
        </div>
      )}

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-[13px]">Kategori</Label>
        <Select value={watchCategory} onValueChange={(v) => form.setValue('category', v)}>
          <SelectTrigger className="h-9 text-[13px]">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="text-[13px]">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.category && <p className="text-[12px] text-destructive">{form.formState.errors.category.message}</p>}
      </div>

      {/* Payment Method (expense only) */}
      {type === 'expense' && (
        <div className="space-y-1.5">
          <Label className="text-[13px]">Metode Pembayaran</Label>
          <Select value={watchPaymentMethod} onValueChange={(v) => form.setValue('paymentMethod', v)}>
            <SelectTrigger className="h-9 text-[13px]">
              <SelectValue placeholder="Pilih metode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m} className="text-[13px]">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.paymentMethod && <p className="text-[12px] text-destructive">{form.formState.errors.paymentMethod.message}</p>}
        </div>
      )}

      {/* Note */}
      <div className="space-y-1.5">
        <Label className="text-[13px]">Catatan <span className="text-muted-foreground font-normal">(Opsional)</span></Label>
        <Textarea placeholder="Tambahkan catatan..." className="text-[13px] min-h-[60px]" {...form.register('note')} />
      </div>

      <Button
        type="submit"
        className={cn(
          'w-full gap-2 h-9 text-[13px]',
          type === 'income' && 'bg-emerald-600 hover:bg-emerald-700 text-white',
          type === 'expense' && 'bg-red-600 hover:bg-red-700 text-white'
        )}
      >
        <Plus className="h-4 w-4" />
        {submitLabel || (type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran')}
      </Button>
    </form>
  );
}
