
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { supabase } from "@/integrations/supabase/client"

interface UserManagementDialogProps {
  open: boolean
  onClose: () => void
  onUserAdded: () => void
}

interface Warga {
  id: string
  blok_rumah: string
  nama_suami?: string
  nama_istri?: string
  nomor_hp_suami?: string
  nomor_hp_istri?: string
  status_tinggal: 'Sudah' | 'Kadang-Kadang' | 'Belum'
  created_at: string
  updated_at: string
}

export function UserManagementDialog({ 
  open, 
  onClose, 
  onUserAdded 
}: UserManagementDialogProps) {
  const [formData, setFormData] = useState({
    nama: "",
    phone_number: "",
    email: "",
    alamat: "",
    role: "warga",
    warga_id: ""
  })
  
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { fetchWarga } = useSupabaseData()

  // Load warga data when dialog opens
  React.useEffect(() => {
    if (open) {
      loadWarga()
    }
  }, [open])

  const loadWarga = async () => {
    try {
      const data = await fetchWarga()
      setWargaList(data)
    } catch (error) {
      console.error('Error loading warga:', error)
    }
  }

  const getWargaDisplayName = (warga: Warga) => {
    const names = []
    if (warga.nama_suami) names.push(warga.nama_suami)
    if (warga.nama_istri) names.push(warga.nama_istri)
    return names.length > 0 ? names.join(' & ') : 'Tidak ada nama'
  }

  const handleWargaChange = (wargaId: string) => {
    if (wargaId === "none") {
      // Reset to empty when "none" is selected
      setFormData(prev => ({
        ...prev,
        warga_id: "",
        nama: "",
        alamat: "",
        phone_number: ""
      }))
      return
    }

    const selectedWarga = wargaList.find(w => w.id === wargaId)
    if (selectedWarga) {
      setFormData(prev => ({
        ...prev,
        warga_id: wargaId,
        nama: getWargaDisplayName(selectedWarga),
        alamat: selectedWarga.blok_rumah,
        phone_number: selectedWarga.nomor_hp_suami || selectedWarga.nomor_hp_istri || prev.phone_number
      }))
    }
  }

  const addUser = async (userData: any) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        id: userData.warga_id,
        email: `${userData.phone_number}@gbr.com`,
        password: 'warga123',
        phone: userData.phone_number.slice(1),
        email_confirm: true,
        user_metadata: {
          nama_suami: userData.nama, // Treat input as nama_suami
          nomor_hp_suami: userData.phone_number,
          alamat: userData.alamat,
          role: userData.role,
          warga_id: userData.warga_id || null,
        }
      })

      if (authError) throw authError

      // The trigger will automatically create the profile
      return authData.user
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await addUser(formData)
      setFormData({
        nama: "",
        phone_number: "",
        email: "",
        alamat: "",
        role: "warga",
        warga_id: ""
      })
      onUserAdded()
      onClose()
      toast({ 
        title: "Berhasil", 
        description: "User berhasil ditambahkan dengan password default: warga123" 
      })
    } catch (error) {
      console.error('Error saving user:', error)
      toast({ 
        title: "Error", 
        description: "Gagal menambahkan user",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah User Login</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="warga_id">Pilih Data Warga (Opsional)</Label>
            <Select
              value={formData.warga_id || "none"}
              onValueChange={handleWargaChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih warga untuk auto-fill data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak pilih warga</SelectItem>
                {wargaList.map((warga) => (
                  <SelectItem key={warga.id} value={warga.id}>
                    {getWargaDisplayName(warga)} - {warga.blok_rumah}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone_number">Nomor Telepon</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email (Opsional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              value={formData.alamat}
              onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
              placeholder="Masukkan alamat lengkap"
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warga">Warga</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="bendahara">Bendahara</SelectItem>
                <SelectItem value="ketua">Ketua</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> User akan dibuat dengan email: {formData.phone_number}@gbr.com dan password default: <code>warga123</code>
              {formData.warga_id && formData.warga_id !== "none" && <br />}<span className="text-green-700">Data user akan terhubung dengan data warga yang dipilih.</span>
            </p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Menyimpan..." : "Tambah User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
