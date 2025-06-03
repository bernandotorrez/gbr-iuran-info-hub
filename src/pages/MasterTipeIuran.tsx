
import { useState } from "react"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface TipeIuran {
  id: string
  nama: string
  nominal: number
  periode: "bulanan" | "tahunan" | "sekali"
  deskripsi: string
  status: "aktif" | "non-aktif"
  tanggalBuat: string
}

const dummyData: TipeIuran[] = [
  {
    id: "1",
    nama: "Iuran Sampah",
    nominal: 25000,
    periode: "bulanan",
    deskripsi: "Iuran pengangkutan sampah bulanan",
    status: "aktif",
    tanggalBuat: "2024-01-01"
  },
  {
    id: "2",
    nama: "Kas Lingkungan",
    nominal: 50000,
    periode: "bulanan", 
    deskripsi: "Kas untuk keperluan lingkungan dan keamanan",
    status: "aktif",
    tanggalBuat: "2024-01-01"
  },
  {
    id: "3",
    nama: "Iuran Keamanan",
    nominal: 100000,
    periode: "bulanan",
    deskripsi: "Iuran untuk jasa keamanan 24 jam",
    status: "aktif",
    tanggalBuat: "2024-01-01"
  }
]

export default function MasterTipeIuran() {
  const [tipeIuranList, setTipeIuranList] = useState<TipeIuran[]>(dummyData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedTipe, setSelectedTipe] = useState<TipeIuran | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nama: "",
    nominal: "",
    periode: "bulanan" as "bulanan" | "tahunan" | "sekali",
    deskripsi: "",
    status: "aktif" as "aktif" | "non-aktif"
  })

  const filteredTipe = tipeIuranList.filter(tipe =>
    tipe.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipe.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    const newTipe: TipeIuran = {
      id: Date.now().toString(),
      nama: formData.nama,
      nominal: parseInt(formData.nominal),
      periode: formData.periode,
      deskripsi: formData.deskripsi,
      status: formData.status,
      tanggalBuat: new Date().toISOString().split('T')[0]
    }
    setTipeIuranList([...tipeIuranList, newTipe])
    setFormData({ nama: "", nominal: "", periode: "bulanan", deskripsi: "", status: "aktif" })
    setIsAddOpen(false)
    toast({ title: "Berhasil", description: "Tipe iuran berhasil ditambahkan" })
  }

  const handleEdit = () => {
    if (!selectedTipe) return
    const updated = tipeIuranList.map(t => t.id === selectedTipe.id ? {
      ...selectedTipe,
      nama: formData.nama,
      nominal: parseInt(formData.nominal),
      periode: formData.periode,
      deskripsi: formData.deskripsi,
      status: formData.status
    } : t)
    setTipeIuranList(updated)
    setIsEditOpen(false)
    setSelectedTipe(null)
    toast({ title: "Berhasil", description: "Tipe iuran berhasil diperbarui" })
  }

  const handleDelete = (id: string) => {
    setTipeIuranList(tipeIuranList.filter(t => t.id !== id))
    toast({ title: "Berhasil", description: "Tipe iuran berhasil dihapus" })
  }

  const openEdit = (tipe: TipeIuran) => {
    setSelectedTipe(tipe)
    setFormData({
      nama: tipe.nama,
      nominal: tipe.nominal.toString(),
      periode: tipe.periode,
      deskripsi: tipe.deskripsi,
      status: tipe.status
    })
    setIsEditOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Tipe Iuran</h1>
          <p className="text-muted-foreground">Kelola jenis-jenis iuran perumahan</p>
        </div>
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
                <Label htmlFor="periode">Periode</Label>
                <select
                  id="periode"
                  value={formData.periode}
                  onChange={(e) => setFormData({...formData, periode: e.target.value as any})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="bulanan">Bulanan</option>
                  <option value="tahunan">Tahunan</option>
                  <option value="sekali">Sekali Bayar</option>
                </select>
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
              <TableHead>Periode</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Buat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTipe.map((tipe) => (
              <TableRow key={tipe.id}>
                <TableCell className="font-medium">{tipe.nama}</TableCell>
                <TableCell>{formatCurrency(tipe.nominal)}</TableCell>
                <TableCell>
                  <span className="capitalize">{tipe.periode}</span>
                </TableCell>
                <TableCell>{tipe.deskripsi}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tipe.status === 'aktif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tipe.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(tipe.tanggalBuat).toLocaleDateString('id-ID')}</TableCell>
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
              <Label htmlFor="edit-periode">Periode</Label>
              <select
                id="edit-periode"
                value={formData.periode}
                onChange={(e) => setFormData({...formData, periode: e.target.value as any})}
                className="w-full p-2 border rounded-md"
              >
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
                <option value="sekali">Sekali Bayar</option>
              </select>
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
