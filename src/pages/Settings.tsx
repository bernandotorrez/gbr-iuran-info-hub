
import { useState } from "react"
import { Save, Users, CreditCard, Bell, Shield, Palette, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const { toast } = useToast()
  
  const [generalSettings, setGeneralSettings] = useState({
    namaPerumahan: "Perumahan GBR",
    alamatPerumahan: "Jl. GBR No. 123, Jakarta Selatan",
    emailKontak: "info@gbr-housing.com",
    teleponKontak: "021-12345678",
    ketuaRT: "Bapak Ahmad Budiman",
    sekretarisRT: "Ibu Siti Nurhaliza"
  })

  const [iuranSettings, setIuranSettings] = useState({
    batasWaktuPembayaran: "25",
    dendaKeterlambatan: "10000",
    metodeNotifikasi: "whatsapp",
    intervalNotifikasi: "7"
  })

  const [systemSettings, setSystemSettings] = useState({
    theme: "green",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    backupInterval: "weekly",
    maxUploadSize: "5"
  })

  const handleSaveGeneral = () => {
    console.log("General settings saved:", generalSettings)
    toast({ title: "Berhasil", description: "Pengaturan umum berhasil disimpan" })
  }

  const handleSaveIuran = () => {
    console.log("Iuran settings saved:", iuranSettings)
    toast({ title: "Berhasil", description: "Pengaturan iuran berhasil disimpan" })
  }

  const handleSaveSystem = () => {
    console.log("System settings saved:", systemSettings)
    toast({ title: "Berhasil", description: "Pengaturan sistem berhasil disimpan" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan sistem informasi iuran</p>
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
              <Label htmlFor="namaPerumahan">Nama Perumahan</Label>
              <Input
                id="namaPerumahan"
                value={generalSettings.namaPerumahan}
                onChange={(e) => setGeneralSettings({...generalSettings, namaPerumahan: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="alamatPerumahan">Alamat Perumahan</Label>
              <Input
                id="alamatPerumahan"
                value={generalSettings.alamatPerumahan}
                onChange={(e) => setGeneralSettings({...generalSettings, alamatPerumahan: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="emailKontak">Email Kontak</Label>
              <Input
                id="emailKontak"
                type="email"
                value={generalSettings.emailKontak}
                onChange={(e) => setGeneralSettings({...generalSettings, emailKontak: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="teleponKontak">Telepon Kontak</Label>
              <Input
                id="teleponKontak"
                value={generalSettings.teleponKontak}
                onChange={(e) => setGeneralSettings({...generalSettings, teleponKontak: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="ketuaRT">Ketua RT</Label>
              <Input
                id="ketuaRT"
                value={generalSettings.ketuaRT}
                onChange={(e) => setGeneralSettings({...generalSettings, ketuaRT: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="sekretarisRT">Sekretaris RT</Label>
              <Input
                id="sekretarisRT"
                value={generalSettings.sekretarisRT}
                onChange={(e) => setGeneralSettings({...generalSettings, sekretarisRT: e.target.value})}
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
              <Label htmlFor="batasWaktu">Batas Waktu Pembayaran (Tanggal)</Label>
              <Input
                id="batasWaktu"
                type="number"
                value={iuranSettings.batasWaktuPembayaran}
                onChange={(e) => setIuranSettings({...iuranSettings, batasWaktuPembayaran: e.target.value})}
                placeholder="25"
              />
              <p className="text-xs text-muted-foreground mt-1">Tanggal batas pembayaran setiap bulan</p>
            </div>
            <div>
              <Label htmlFor="denda">Denda Keterlambatan (Rp)</Label>
              <Input
                id="denda"
                type="number"
                value={iuranSettings.dendaKeterlambatan}
                onChange={(e) => setIuranSettings({...iuranSettings, dendaKeterlambatan: e.target.value})}
                placeholder="10000"
              />
            </div>
            <div>
              <Label htmlFor="metodeNotif">Metode Notifikasi</Label>
              <select
                id="metodeNotif"
                value={iuranSettings.metodeNotifikasi}
                onChange={(e) => setIuranSettings({...iuranSettings, metodeNotifikasi: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div>
              <Label htmlFor="intervalNotif">Interval Notifikasi (Hari)</Label>
              <Input
                id="intervalNotif"
                type="number"
                value={iuranSettings.intervalNotifikasi}
                onChange={(e) => setIuranSettings({...iuranSettings, intervalNotifikasi: e.target.value})}
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

        {/* Pengaturan Sistem */}
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
                onChange={(e) => setSystemSettings({...systemSettings, theme: e.target.value})}
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
                value={systemSettings.backupInterval}
                onChange={(e) => setSystemSettings({...systemSettings, backupInterval: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
            <div>
              <Label htmlFor="maxUpload">Maksimal Upload File (MB)</Label>
              <Input
                id="maxUpload"
                type="number"
                value={systemSettings.maxUploadSize}
                onChange={(e) => setSystemSettings({...systemSettings, maxUploadSize: e.target.value})}
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

      {/* Additional Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold">Notifikasi</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Notifikasi</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">WhatsApp Notifikasi</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Push Notifikasi</span>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Data & Backup</h3>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full">
              Export Data
            </Button>
            <Button variant="outline" className="w-full">
              Import Data
            </Button>
            <Button variant="outline" className="w-full">
              Backup Sekarang
            </Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Palette className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold">Personalisasi</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mode Gelap</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sidebar Collapsed</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Animasi UI</span>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
