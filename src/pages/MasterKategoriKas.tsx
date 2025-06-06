
import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface KategoriKas {
  id: string
  nama: string
  deskripsi: string | null
  status_aktif: boolean
  created_at: string
  updated_at: string
}

export default function MasterKategoriKas() {
  const [kategoriList, setKategoriList] = useState<KategoriKas[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingKategori, setEditingKategori] = useState<KategoriKas | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    status_aktif: true
  })

  const [formErrors, setFormErrors] = useState({
    nama: "",
    deskripsi: ""
  })

  const loadKategoriKas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('kategori_kas_keluar')
        .select('*')
        .order('nama')
      
      if (error) throw error
      setKategoriList(data || [])
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat data kategori kas",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKategoriKas()
  }, [])

  const filteredKategori = kategoriList.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const validateForm = () => {
    const errors = {
      nama: "",
      deskripsi: ""
    }

    let isValid = true

    if (!formData.nama || formData.nama.length < 3) {
      errors.nama = "Nama kategori wajib diisi minimal 3 karakter"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleAdd = async () => {
    if (!validateForm()) {
      toast({ 
        title: "Error", 
        description: "Periksa kembali form yang diisi",
        variant: "destructive" 
      })
      return
    }

    try {
      const { error } = await supabase
        .from('kategori_kas_keluar')
        .insert([{
          nama: formData.nama,
          deskripsi: formData.deskripsi || null,
          status_aktif: formData.status_aktif
        }])

      if (error) throw error

      setFormData({ nama: "", deskripsi: "", status_aktif: true })
      setFormErrors({ nama: "", deskripsi: "" })
      setIsAddOpen(false)
      await loadKategoriKas()
      toast({ title: "Berhasil", description: "Kategori kas berhasil ditambahkan" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menambahkan kategori kas",
        variant: "destructive" 
      })
    }
  }

  const handleEdit = (kategori: KategoriKas) => {
    setEditingKategori(kategori)
    setFormData({
      nama: kategori.nama,
      deskripsi: kategori.deskripsi || "",
      status_aktif: kategori.status_aktif
    })
    setFormErrors({ nama: "", deskripsi: "" })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!validateForm() || !editingKategori) {
      toast({ 
        title: "Error", 
        description: "Periksa kembali form yang diisi",
        variant: "destructive" 
      })
      return
    }

    try {
      const { error } = await supabase
        .from('kategori_kas_keluar')
        .update({
          nama: formData.nama,
          deskripsi: formData.deskripsi || null,
          status_aktif: formData.status_aktif
        })
        .eq('id', editingKategori.id)

      if (error) throw error

      setFormData({ nama: "", deskripsi: "", status_aktif: true })
      setFormErrors({ nama: "", deskripsi: "" })
      setIsEditOpen(false)
      setEditingKategori(null)
      await loadKategoriKas()
      toast({ title: "Berhasil", description: "Kategori kas berhasil diperbarui" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memperbarui kategori kas",
        variant: "destructive" 
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      return
    }

    try {
      const { error } = await supabase
        .from('kategori_kas_keluar')
        .update({ status_aktif: false })
        .eq('id', id)

      if (error) throw error

      await loadKategoriKas()
      toast({ title: "Berhasil", description: "Kategori kas berhasil dinonaktifkan" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menghapus kategori kas",
        variant: "destructive" 
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Kategori Output Kas</h1>
          <p className="text-muted-foreground">Kelola kategori pengeluaran kas perumahan</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kategori Kas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Kategori *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Nama kategori"
                  className={formErrors.nama ? "border-red-500" : ""}
                />
                {formErrors.nama && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.nama}</p>
                )}
              </div>
              <div>
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  placeholder="Deskripsi kategori"
                  className={formErrors.deskripsi ? "border-red-500" : ""}
                />
                {formErrors.deskripsi && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.deskripsi}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status_aktif"
                  checked={formData.status_aktif}
                  onCheckedChange={(checked) => setFormData({...formData, status_aktif: checked})}
                />
                <Label htmlFor="status_aktif">Aktif</Label>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Simpan Kategori
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKategori.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nama}</TableCell>
                <TableCell>{item.deskripsi || "-"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status_aktif 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status_aktif ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {item.status_aktif && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kategori Kas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nama">Nama Kategori *</Label>
              <Input
                id="edit-nama"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                placeholder="Nama kategori"
                className={formErrors.nama ? "border-red-500" : ""}
              />
              {formErrors.nama && (
                <p className="text-sm text-red-500 mt-1">{formErrors.nama}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-deskripsi">Deskripsi</Label>
              <Textarea
                id="edit-deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                placeholder="Deskripsi kategori"
                className={formErrors.deskripsi ? "border-red-500" : ""}
              />
              {formErrors.deskripsi && (
                <p className="text-sm text-red-500 mt-1">{formErrors.deskripsi}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-status_aktif"
                checked={formData.status_aktif}
                onCheckedChange={(checked) => setFormData({...formData, status_aktif: checked})}
              />
              <Label htmlFor="edit-status_aktif">Aktif</Label>
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Perbarui Kategori
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
