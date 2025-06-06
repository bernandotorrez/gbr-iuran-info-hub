
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface StrukturPengurusFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
}

export function StrukturPengurusFormDialog({ 
  open, 
  onClose, 
  onSave, 
  editData 
}: StrukturPengurusFormDialogProps) {
  const { fetchWarga } = useSupabaseData()
  
  const [formData, setFormData] = useState({
    jabatan: "",
    level_jabatan: 1,
    nama_pengurus: "",
    warga_id: "",
    blok_rumah: "",
    periode_mulai: new Date().getFullYear(),
    periode_selesai: new Date().getFullYear() + 1,
    status_aktif: true
  })
  
  const [wargaList, setWargaList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadWarga()
      if (editData) {
        setFormData({
          jabatan: editData.jabatan || "",
          level_jabatan: editData.level_jabatan || 1,
          nama_pengurus: editData.nama_pengurus || "",
          warga_id: editData.warga_id || "",
          blok_rumah: editData.blok_rumah || "",
          periode_mulai: editData.periode_mulai || new Date().getFullYear(),
          periode_selesai: editData.periode_selesai || new Date().getFullYear() + 1,
          status_aktif: editData.status_aktif !== undefined ? editData.status_aktif : true
        })
      } else {
        setFormData({
          jabatan: "",
          level_jabatan: 1,
          nama_pengurus: "",
          warga_id: "",
          blok_rumah: "",
          periode_mulai: new Date().getFullYear(),
          periode_selesai: new Date().getFullYear() + 1,
          status_aktif: true
        })
      }
    }
  }, [open, editData])

  const loadWarga = async () => {
    try {
      const data = await fetchWarga()
      setWargaList(data)
    } catch (error) {
      console.error('Error loading warga:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWargaChange = (wargaId: string) => {
    const selectedWarga = wargaList.find(w => w.id === wargaId)
    setFormData(prev => ({
      ...prev,
      warga_id: wargaId,
      nama_pengurus: selectedWarga ? selectedWarga.nama : prev.nama_pengurus
    }))
  }

  const jabatanOptions = [
    "Ketua RT",
    "Wakil Ketua RT", 
    "Sekretaris",
    "Bendahara",
    "Sie Keamanan",
    "Sie Kebersihan",
    "Sie Sosial",
    "Sie Pemuda",
    "Sie Ibu-ibu",
    "Koordinator Blok"
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Pengurus" : "Tambah Pengurus"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="jabatan">Jabatan</Label>
            <Select
              value={formData.jabatan}
              onValueChange={(value) => setFormData(prev => ({ ...prev, jabatan: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jabatan" />
              </SelectTrigger>
              <SelectContent>
                {jabatanOptions.map((jabatan) => (
                  <SelectItem key={jabatan} value={jabatan}>
                    {jabatan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="level_jabatan">Level Jabatan</Label>
            <Select
              value={formData.level_jabatan.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, level_jabatan: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1 (Tertinggi)</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="warga_id">Pilih Warga (Opsional)</Label>
            <Select
              value={formData.warga_id}
              onValueChange={handleWargaChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih warga atau kosongkan jika bukan warga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Bukan Warga / Kosongkan</SelectItem>
                {wargaList.map((warga) => (
                  <SelectItem key={warga.id} value={warga.id}>
                    {warga.nama} - {warga.rt_rw}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="nama_pengurus">Nama Pengurus</Label>
            <Input
              id="nama_pengurus"
              value={formData.nama_pengurus}
              onChange={(e) => setFormData(prev => ({ ...prev, nama_pengurus: e.target.value }))}
              placeholder="Masukkan nama pengurus"
              required
            />
          </div>

          <div>
            <Label htmlFor="blok_rumah">Blok Rumah (Opsional)</Label>
            <Input
              id="blok_rumah"
              value={formData.blok_rumah}
              onChange={(e) => setFormData(prev => ({ ...prev, blok_rumah: e.target.value }))}
              placeholder="Contoh: A1, B5, C3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periode_mulai">Periode Mulai</Label>
              <Input
                id="periode_mulai"
                type="number"
                value={formData.periode_mulai}
                onChange={(e) => setFormData(prev => ({ ...prev, periode_mulai: parseInt(e.target.value) }))}
                placeholder="2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="periode_selesai">Periode Selesai</Label>
              <Input
                id="periode_selesai"
                type="number"
                value={formData.periode_selesai}
                onChange={(e) => setFormData(prev => ({ ...prev, periode_selesai: parseInt(e.target.value) }))}
                placeholder="2025"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status_aktif">Status</Label>
            <Select
              value={formData.status_aktif.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status_aktif: value === 'true' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
