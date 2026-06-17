'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Database, Shield, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { getSettings, updateSettings, setBudget } from '@/lib/store';
import { FORMAT_CURRENCY } from '@/lib/constants';
import type { AppSettings } from '@/lib/types';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettingsState] = useState<AppSettings>({
    currency: 'IDR',
    monthlyBudget: 5000000,
    notifications: true,
  });
  const { theme, setTheme } = useTheme();
  const now = new Date();

  useEffect(() => {
    setMounted(true);
    setSettingsState(getSettings());
  }, []);

  const handleSave = () => {
    updateSettings(settings);
    setBudget(now.getMonth(), now.getFullYear(), settings.monthlyBudget);
    toast.success('Pengaturan berhasil disimpan');
  };

  const handleReset = () => {
    const defaults: AppSettings = {
      currency: 'IDR',
      monthlyBudget: 5000000,
      notifications: true,
    };
    setSettingsState(defaults);
    updateSettings(defaults);
    toast.success('Pengaturan dikembalikan ke default');
  };

  const handleClearData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fintrack_transactions');
      toast.success('Semua data transaksi telah dihapus');
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Sesuaikan aplikasi dengan kebutuhanmu</p>
      </div>

      {/* Appearance */}
      <Card className="card-hover animate-fade-in stagger-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Tampilan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-[13px]">Mode Gelap</Label>
              <p className="text-[11px] text-muted-foreground">Beralih antara tema terang dan gelap</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* General */}
      <Card className="card-hover animate-fade-in stagger-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Umum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-[13px]">Mata Uang</Label>
            <Input
              value={settings.currency}
              onChange={e => setSettingsState({ ...settings, currency: e.target.value })}
              placeholder="IDR"
              className="h-9 text-[13px]"
            />
            <p className="text-[11px] text-muted-foreground">Mata uang yang digunakan untuk format nominal</p>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-[13px]">Target Pengeluaran Bulanan</Label>
            <Input
              type="number"
              value={settings.monthlyBudget}
              onChange={e => setSettingsState({ ...settings, monthlyBudget: parseInt(e.target.value) || 0 })}
              placeholder="5000000"
              className="h-9 text-[13px]"
            />
            <p className="text-[11px] text-muted-foreground">
              Notifikasi akan muncul jika pengeluaran melebihi {FORMAT_CURRENCY(settings.monthlyBudget)}
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-[13px]">Notifikasi Over-Budget</Label>
              <p className="text-[11px] text-muted-foreground">Tampilkan peringatan saat pengeluaran melebihi target</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={v => setSettingsState({ ...settings, notifications: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="card-hover animate-fade-in stagger-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Manajemen Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Penyimpanan Lokal</p>
              <p className="text-[11px] text-muted-foreground">Data tersimpan di browser menggunakan Local Storage</p>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Aktif</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Hapus Semua Data</p>
              <p className="text-[11px] text-muted-foreground">Hapus seluruh riwayat transaksi dari perangkat ini</p>
            </div>
            <Button variant="destructive" size="sm" className="h-8 text-[12px]" onClick={handleClearData}>
              Hapus Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in stagger-4">
        <Button onClick={handleSave} className="gap-2 h-9 text-[13px]">
          <Save className="h-4 w-4" />
          Simpan Pengaturan
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2 h-9 text-[13px]">
          <RotateCcw className="h-4 w-4" />
          Kembalikan ke Default
        </Button>
      </div>
    </div>
  );
}
