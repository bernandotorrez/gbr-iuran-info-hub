
import { useState, useEffect } from "react"
import { Save, Users, CreditCard, Bell, Shield, Palette, Database, Download, Upload, Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "@/hooks/useSettings"
import { Switch } from "@/components/ui/switch"

export default function Settings() {
  const { toast } = useToast()
  const { settings, loading, updateMultipleSettings } = useSettings()
  
  const [generalSettings, setGeneralSettings] = useState({
    nama_perumahan: "",
    alamat_perumahan: "",
    email_kontak: "",
    telepon_kontak: "",
    ketua_paguyuban: "",
    sekretaris_paguyuban: ""
  })

  const [iuranSettings, setIuranSettings] = useState({
    batas_waktu_pembayaran: "25",
    denda_keterlambatan: "10000",
    metode_notifikasi: "whatsapp",
    interval_notifikasi: "7"
  })

  const [systemSettings, setSystemSettings] = useState({
    theme: "green",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    backup_interval: "weekly",
    max_upload_size: "5"
  })

  const [personalizationSettings, setPersonalizationSettings] = useState({
    dark_mode: false,
    sidebar_collapsed: false,
    ui_animations: true,
    compact_view: false
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    whatsapp_notifications: true,
    push_notifications: false,
    payment_reminders: true
  })

  // Helper function to convert string to boolean
  const stringToBoolean = (value: string | boolean | undefined, defaultValue: boolean = false): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true'
    }
    return defaultValue
  }

  // Load settings from database when available
  useEffect(() => {
    if (!loading && settings) {
      setGeneralSettings({
        nama_perumahan: settings.nama_perumahan || "Perumahan GBR",
        alamat_perumahan: settings.alamat_perumahan || "Jl. GBR No. 123, Jakarta Selatan",
        email_kontak: settings.email_kontak || "info@gbr-housing.com",
        telepon_kontak: settings.telepon_kontak || "021-12345678",
        ketua_paguyuban: settings.ketua_paguyuban || settings.ketua_rt || "Bapak Ahmad Budiman",
        sekretaris_paguyuban: settings.sekretaris_paguyuban || settings.sekretaris_rt || "Ibu Siti Nurhaliza"
      })

      setIuranSettings({
        batas_waktu_pembayaran: settings.batas_waktu_pembayaran || "25",
        denda_keterlambatan: settings.denda_keterlambatan || "10000",
        metode_notifikasi: settings.metode_notifikasi || "whatsapp",
        interval_notifikasi: settings.interval_notifikasi || "7"
      })

      setSystemSettings({
        theme: settings.theme || "green",
        currency: settings.currency || "IDR",
        timezone: settings.timezone || "Asia/Jakarta",
        backup_interval: settings.backup_interval || "weekly",
        max_upload_size: settings.max_upload_size || "5"
      })

      setPersonalizationSettings({
        dark_mode: stringToBoolean(settings.dark_mode, false),
        sidebar_collapsed: stringToBoolean(settings.sidebar_collapsed, false),
        ui_animations: stringToBoolean(settings.ui_animations, true),
        compact_view: stringToBoolean(settings.compact_view, false)
      })

      setNotificationSettings({
        email_notifications: stringToBoolean(settings.email_notifications, true),
        whatsapp_notifications: stringToBoolean(settings.whatsapp_notifications, true),
        push_notifications: stringToBoolean(settings.push_notifications, false),
        payment_reminders: stringToBoolean(settings.payment_reminders, true)
      })
    }
  }, [loading, settings])

  const handleThemeChange = async (newTheme: string) => {
    try {
      await updateMultipleSettings({ theme: newTheme })
      setSystemSettings(prev => ({ ...prev, theme: newTheme }))
      
      // Apply theme immediately to the document
      applyTheme(newTheme)
      
      toast({ title: "Berhasil", description: "Tema berhasil diubah" })
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengubah tema", variant: "destructive" })
    }
  }

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    const themeColors = {
      green: { primary: "34 197 94", secondary: "22 163 74" },
      blue: { primary: "59 130 246", secondary: "37 99 235" },
      purple: { primary: "147 51 234", secondary: "126 34 206" },
      orange: { primary: "249 115 22", secondary: "234 88 12" }
    }
    
    const colors = themeColors[theme as keyof typeof themeColors] || themeColors.green
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', '255 255 255')
  }

  const handleSaveGeneral = async () => {
    try {
      await updateMultipleSettings(generalSettings)
      toast({ title: "Berhasil", description: "Pengaturan umum berhasil disimpan" })
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan pengaturan umum", variant: "destructive" })
    }
  }

  const handleSaveIuran = async () => {
    try {
      await updateMultipleSettings(iuranSettings)
      toast({ title: "Berhasil", description: "Pengaturan iuran berhasil disimpan" })
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan pengaturan iuran", variant: "destructive" })
    }
  }

  const handleSaveSystem = async () => {
    try {
      await updateMultipleSettings(systemSettings)
      toast({ title: "Berhasil", description: "Pengaturan sistem berhasil disimpan" })
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan pengaturan sistem", variant: "destructive" })
    }
  }

  const handleSavePersonalization = async () => {
    try {
      await updateMultipleSettings({
        dark_mode: personalizationSettings.dark_mode.toString(),
        sidebar_collapsed: personalizationSettings.sidebar_collapsed.toString(),
        ui_animations: personalizationSettings.ui_animations.toString(),
        compact_view: personalizationSettings.compact_view.toString()
      })
      toast({ title: "Berhasil", description: "Pengaturan personalisasi berhasil disimpan" })
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan pengaturan personalisasi", variant: "destructive" })
    }
  }

  const handleSaveNotifications = async () => {
    try {
      await updateMultipleSettings({
        email_notifications: notificationSettings.email_notifications.toString(),
        whatsapp_notifications: notificationSettings.whatsapp_notifications.toString(),
        push_notifications: notificationSettings.push_notifications.toString(),
        payment_reminders: notificationSettings.payment_reminders.toString()
      })
      toast({ title: "Berhasil", description: "Pengaturan notifikasi berhasil disimpan" })
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan pengaturan notifikasi", variant: "destructive" })
    }
  }

  const handleBackupData = () => {
    // Implement backup functionality
    toast({ title: "Info", description: "Backup sedang diproses..." })
  }

  const handleExportData = () => {
    // Implement export functionality
    toast({ title: "Info", description: "Export data sedang diproses..." })
  }

  const handleImportData = () => {
    // Implement import functionality
    toast({ title: "Info", description: "Fitur import data akan tersedia segera" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Memuat pengaturan...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan sistem informasi iuran paguyuban</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pengaturan Umum */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-semibold">Pengaturan Umum</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nama_perumahan">Nama Perumahan</Label>
              <Input
                id="nama_perumahan"
                value={generalSettings.nama_perumahan}
                onChange={(e) => setGeneralSettings({...generalSettings, nama_perumahan: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="alamat_perumahan">Alamat Perumahan</Label>
              <Input
                id="alamat_perumahan"
                value={generalSettings.alamat_perumahan}
                onChange={(e) => setGeneralSettings({...generalSettings, alamat_perumahan: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email_kontak">Email Kontak</Label>
              <Input
                id="email_kontak"
                type="email"
                value={generalSettings.email_kontak}
                onChange={(e) => setGeneralSettings({...generalSettings, email_kontak: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="telepon_kontak">Telepon Kontak</Label>
              <Input
                id="telepon_kontak"
                value={generalSettings.telepon_kontak}
                onChange={(e) => setGeneralSettings({...generalSettings, telepon_kontak: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="ketua_paguyuban">Ketua Paguyuban</Label>
              <Input
                id="ketua_paguyuban"
                value={generalSettings.ketua_paguyuban}
                onChange={(e) => setGeneralSettings({...generalSettings, ketua_paguyuban: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="sekretaris_paguyuban">Sekretaris Paguyuban</Label>
              <Input
                id="sekretaris_paguyuban"
                value={generalSettings.sekretaris_paguyuban}
                onChange={(e) => setGeneralSettings({...generalSettings, sekretaris_paguyuban: e.target.value})}
              />
            </div>
            <Button onClick={handleSaveGeneral} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Pengaturan Umum
            </Button>
          </div>
        </div>

        {/* Pengaturan Iuran */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <CreditCard className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-semibold">Pengaturan Iuran</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="batas_waktu">Batas Waktu Pembayaran (Tanggal)</Label>
              <Input
                id="batas_waktu"
                type="number"
                value={iuranSettings.batas_waktu_pembayaran}
                onChange={(e) => setIuranSettings({...iuranSettings, batas_waktu_pembayaran: e.target.value})}
                placeholder="25"
              />
              <p className="text-xs text-muted-foreground mt-1">Tanggal batas pembayaran setiap bulan</p>
            </div>
            <div>
              <Label htmlFor="denda">Denda Keterlambatan (Rp)</Label>
              <Input
                id="denda"
                type="number"
                value={iuranSettings.denda_keterlambatan}
                onChange={(e) => setIuranSettings({...iuranSettings, denda_keterlambatan: e.target.value})}
                placeholder="10000"
              />
            </div>
            <div>
              <Label htmlFor="metode_notif">Metode Notifikasi</Label>
              <select
                id="metode_notif"
                value={iuranSettings.metode_notifikasi}
                onChange={(e) => setIuranSettings({...iuranSettings, metode_notifikasi: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div>
              <Label htmlFor="interval_notif">Interval Notifikasi (Hari)</Label>
              <Input
                id="interval_notif"
                type="number"
                value={iuranSettings.interval_notifikasi}
                onChange={(e) => setIuranSettings({...iuranSettings, interval_notifikasi: e.target.value})}
                placeholder="7"
              />
              <p className="text-xs text-muted-foreground mt-1">Interval pengiriman reminder</p>
            </div>
            <Button onClick={handleSaveIuran} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Pengaturan Iuran
            </Button>
          </div>
        </div>

        {/* Pengaturan Sistem dengan Theme */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-semibold">Pengaturan Sistem</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">Tema Warna</Label>
              <select
                id="theme"
                value={systemSettings.theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="green">Hijau (Default)</option>
                <option value="blue">Biru</option>
                <option value="purple">Ungu</option>
                <option value="orange">Orange</option>
              </select>
            </div>
            <div>
              <Label htmlFor="currency">Mata Uang</Label>
              <select
                id="currency"
                value={systemSettings.currency}
                onChange={(e) => setSystemSettings({...systemSettings, currency: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="IDR">IDR (Rupiah)</option>
                <option value="USD">USD (Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">Zona Waktu</Label>
              <select
                id="timezone"
                value={systemSettings.timezone}
                onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="backup">Interval Backup</Label>
              <select
                id="backup"
                value={systemSettings.backup_interval}
                onChange={(e) => setSystemSettings({...systemSettings, backup_interval: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
            <div>
              <Label htmlFor="max_upload">Maksimal Upload File (MB)</Label>
              <Input
                id="max_upload"
                type="number"
                value={systemSettings.max_upload_size}
                onChange={(e) => setSystemSettings({...systemSettings, max_upload_size: e.target.value})}
                placeholder="5"
              />
            </div>
            <Button onClick={handleSaveSystem} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Pengaturan Sistem
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personalisasi */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Palette className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold">Personalisasi</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mode Gelap</span>
              <Switch
                checked={personalizationSettings.dark_mode}
                onCheckedChange={(checked) => setPersonalizationSettings({...personalizationSettings, dark_mode: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sidebar Collapsed</span>
              <Switch
                checked={personalizationSettings.sidebar_collapsed}
                onCheckedChange={(checked) => setPersonalizationSettings({...personalizationSettings, sidebar_collapsed: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Animasi UI</span>
              <Switch
                checked={personalizationSettings.ui_animations}
                onCheckedChange={(checked) => setPersonalizationSettings({...personalizationSettings, ui_animations: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tampilan Kompak</span>
              <Switch
                checked={personalizationSettings.compact_view}
                onCheckedChange={(checked) => setPersonalizationSettings({...personalizationSettings, compact_view: checked})}
              />
            </div>
            <Button onClick={handleSavePersonalization} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Personalisasi
            </Button>
          </div>
        </div>

        {/* Data & Backup */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Data & Backup</h3>
          </div>
          <div className="space-y-3">
            <Button onClick={handleExportData} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={handleImportData} variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button onClick={handleBackupData} variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              Backup Sekarang
            </Button>
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Backup terakhir: {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* Notifikasi */}
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold">Notifikasi</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Notifikasi</span>
              <Switch
                checked={notificationSettings.email_notifications}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_notifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">WhatsApp Notifikasi</span>
              <Switch
                checked={notificationSettings.whatsapp_notifications}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, whatsapp_notifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Push Notifikasi</span>
              <Switch
                checked={notificationSettings.push_notifications}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, push_notifications: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reminder Pembayaran</span>
              <Switch
                checked={notificationSettings.payment_reminders}
                onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, payment_reminders: checked})}
              />
            </div>
            <Button onClick={handleSaveNotifications} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Simpan Notifikasi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
