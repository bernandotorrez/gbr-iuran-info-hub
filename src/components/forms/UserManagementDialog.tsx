
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface UserManagementDialogProps {
  open: boolean
  onClose: () => void
  onUserAdded: () => void
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
    rt_rw: "",
    role: "warga"
  })
  
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { addWarga } = useSupabaseData()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await addWarga(formData)
      setFormData({
        nama: "",
        phone_number: "",
        email: "",
        alamat: "",
        rt_rw: "",
        role: "warga"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rt_rw">RT/RW</Label>
              <Input
                id="rt_rw"
                value={formData.rt_rw}
                onChange={(e) => setFormData(prev => ({ ...prev, rt_rw: e.target.value }))}
                placeholder="RT 001/RW 001"
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
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> User akan dibuat dengan email: {formData.phone_number}@gbr.com dan password default: <code>warga123</code>
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
