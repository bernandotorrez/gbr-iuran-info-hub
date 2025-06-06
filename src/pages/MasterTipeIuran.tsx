import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useUserRole } from "@/hooks/useUserRole"

interface TipeIuran {
  id: string
  nama: string
  nominal: number
  deskripsi: string
  status_aktif: boolean
  created_at: string
}

export default function MasterTipeIuran() {
  const [tipeIuranList, setTipeIuranList] = useState<TipeIuran[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedTipe, setSelectedTipe] = useState<TipeIuran | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { fetchTipeIuran, addTipeIuran, updateTipeIuran, deleteTipeIuran } = useSupabaseData()
  const { isAdmin } = useUserRole()

  const [formData, setFormData] = useState({
    nama: "",
    nominal: "",
    deskripsi: ""
  })

  const loadTipeIuran = async () => {
    try {
      setLoading(true)
      const data = await fetchTipeIuran()
      setTipeIuranList(data)
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat data tipe iuran",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTipeIuran()
  }, [])

  const filteredTipe = tipeIuranList.filter(tipe =>
    tipe.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipe.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    try {
      await addTipeIuran({
        nama: formData.nama,
        nominal: parseInt(formData.nominal),
        deskripsi: formData.deskripsi
      })
      setFormData({ nama: "", nominal: "", deskripsi: "" })
      setIsAddOpen(false)
      await loadTipeIuran()
      toast({ title: "Berhasil", description: "Tipe iuran berhasil ditambahkan" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menambahkan tipe iuran",
        variant: "destructive" 
      })
    }
  }

  const handleEdit = async () => {
    if (!selectedTipe) return
    try {
      await updateTipeIuran(selectedTipe.id, {
        nama: formData.nama,
        nominal: parseInt(formData.nominal),
        deskripsi: formData.deskripsi
      })
      setIsEditOpen(false)
      setSelectedTipe(null)
      await loadTipeIuran()
      toast({ title: "Berhasil", description: "Tipe iuran berhasil diperbarui" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memperbarui tipe iuran",
        variant: "destructive" 
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTipeIuran(id)
      await loadTipeIuran()
      toast({ title: "Berhasil", description: "Tipe iuran berhasil dihapus" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menghapus tipe iuran",
        variant: "destructive" 
      })
    }
  }

  const openEdit = (tipe: TipeIuran) => {
    setSelectedTipe(tipe)
    setFormData({
      nama: tipe.nama,
      nominal: tipe.nominal.toString(),
      deskripsi: tipe.deskripsi || ""
    })
    setIsEditOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Tipe Iuran</h1>
          <p className="text-muted-foreground">Kelola jenis-jenis iuran perumahan</p>
        </div>
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tipe Iuran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Tipe Iuran Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nama">Nama Iuran</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    placeholder="Contoh: Iuran Sampah"
                  />
                </div>
                <div>
                  <Label htmlFor="nominal">Nominal (Rp)</Label>
                  <Input
                    id="nominal"
                    type="number"
                    value={formData.nominal}
                    onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Input
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    placeholder="Deskripsi singkat tentang iuran ini"
                  />
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari tipe iuran..."
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
              <TableHead>Nama Iuran</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Buat</TableHead>
              {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTipe.map((tipe) => (
              <TableRow key={tipe.id}>
                <TableCell className="font-medium">{tipe.nama}</TableCell>
                <TableCell>{formatCurrency(tipe.nominal)}</TableCell>
                <TableCell>{tipe.deskripsi || "-"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tipe.status_aktif 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tipe.status_aktif ? 'Aktif' : 'Non-aktif'}
                  </span>
                </TableCell>
                <TableCell>{new Date(tipe.created_at).toLocaleDateString('id-ID')}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(tipe)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(tipe.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tipe Iuran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nama">Nama Iuran</Label>
              <Input
                id="edit-nama"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-nominal">Nominal (Rp)</Label>
              <Input
                id="edit-nominal"
                type="number"
                value={formData.nominal}
                onChange={(e) => setFormData({...formData, nominal: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-deskripsi">Deskripsi</Label>
              <Input
                id="edit-deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              />
            </div>
            <Button onClick={handleEdit} className="w-full">
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
