
import { useState } from "react"
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Warga {
  id: string
  nama: string
  blok: string
  nomor: string
  noWa: string
  email: string
  status: "aktif" | "non-aktif"
  tanggalDaftar: string
}

const dummyData: Warga[] = [
  {
    id: "1",
    nama: "Ahmad Budiman",
    blok: "A",
    nomor: "12",
    noWa: "081234567890",
    email: "ahmad@email.com",
    status: "aktif",
    tanggalDaftar: "2024-01-15"
  },
  {
    id: "2", 
    nama: "Siti Nurhaliza",
    blok: "B",
    nomor: "05",
    noWa: "085678901234",
    email: "siti@email.com",
    status: "aktif",
    tanggalDaftar: "2024-02-10"
  },
  {
    id: "3",
    nama: "Budi Santoso",
    blok: "C",
    nomor: "08",
    noWa: "087890123456",
    email: "budi@email.com",
    status: "non-aktif",
    tanggalDaftar: "2024-01-20"
  }
]

export default function MasterWarga() {
  const [wargaList, setWargaList] = useState<Warga[]>(dummyData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nama: "",
    blok: "",
    nomor: "",
    noWa: "",
    email: "",
    status: "aktif" as "aktif" | "non-aktif"
  })

  const filteredWarga = wargaList.filter(warga =>
    warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.blok.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.nomor.includes(searchTerm)
  )

  const handleAdd = () => {
    const newWarga: Warga = {
      id: Date.now().toString(),
      ...formData,
      tanggalDaftar: new Date().toISOString().split('T')[0]
    }
    setWargaList([...wargaList, newWarga])
    setFormData({ nama: "", blok: "", nomor: "", noWa: "", email: "", status: "aktif" })
    setIsAddOpen(false)
    toast({ title: "Berhasil", description: "Data warga berhasil ditambahkan" })
  }

  const handleEdit = () => {
    if (!selectedWarga) return
    const updated = wargaList.map(w => w.id === selectedWarga.id ? { ...selectedWarga, ...formData } : w)
    setWargaList(updated)
    setIsEditOpen(false)
    setSelectedWarga(null)
    toast({ title: "Berhasil", description: "Data warga berhasil diperbarui" })
  }

  const handleDelete = (id: string) => {
    setWargaList(wargaList.filter(w => w.id !== id))
    toast({ title: "Berhasil", description: "Data warga berhasil dihapus" })
  }

  const openEdit = (warga: Warga) => {
    setSelectedWarga(warga)
    setFormData({
      nama: warga.nama,
      blok: warga.blok,
      nomor: warga.nomor,
      noWa: warga.noWa,
      email: warga.email,
      status: warga.status
    })
    setIsEditOpen(true)
  }

  const openView = (warga: Warga) => {
    setSelectedWarga(warga)
    setIsViewOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data Warga</h1>
          <p className="text-muted-foreground">Kelola data warga perumahan GBR</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Warga
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Warga Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blok">Blok</Label>
                  <Input
                    id="blok"
                    value={formData.blok}
                    onChange={(e) => setFormData({...formData, blok: e.target.value})}
                    placeholder="A, B, C, dll"
                  />
                </div>
                <div>
                  <Label htmlFor="nomor">Nomor Rumah</Label>
                  <Input
                    id="nomor"
                    value={formData.nomor}
                    onChange={(e) => setFormData({...formData, nomor: e.target.value})}
                    placeholder="01, 02, 03, dll"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="noWa">No. WhatsApp</Label>
                <Input
                  id="noWa"
                  value={formData.noWa}
                  onChange={(e) => setFormData({...formData, noWa: e.target.value})}
                  placeholder="081234567890"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@contoh.com"
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
            placeholder="Cari warga..."
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
              <TableHead>Nama</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>No. WhatsApp</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarga.map((warga) => (
              <TableRow key={warga.id}>
                <TableCell className="font-medium">{warga.nama}</TableCell>
                <TableCell>Blok {warga.blok} No. {warga.nomor}</TableCell>
                <TableCell>{warga.noWa}</TableCell>
                <TableCell>{warga.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    warga.status === 'aktif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {warga.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(warga.tanggalDaftar).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openView(warga)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(warga)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(warga.id)}
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
            <DialogTitle>Edit Data Warga</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nama">Nama Lengkap</Label>
              <Input
                id="edit-nama"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-blok">Blok</Label>
                <Input
                  id="edit-blok"
                  value={formData.blok}
                  onChange={(e) => setFormData({...formData, blok: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-nomor">Nomor Rumah</Label>
                <Input
                  id="edit-nomor"
                  value={formData.nomor}
                  onChange={(e) => setFormData({...formData, nomor: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-noWa">No. WhatsApp</Label>
              <Input
                id="edit-noWa"
                value={formData.noWa}
                onChange={(e) => setFormData({...formData, noWa: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <Button onClick={handleEdit} className="w-full">
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Warga</DialogTitle>
          </DialogHeader>
          {selectedWarga && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Nama Lengkap</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.nama}</p>
              </div>
              <div>
                <Label className="font-medium">Alamat</Label>
                <p className="text-sm text-muted-foreground">Blok {selectedWarga.blok} No. {selectedWarga.nomor}</p>
              </div>
              <div>
                <Label className="font-medium">No. WhatsApp</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.noWa}</p>
              </div>
              <div>
                <Label className="font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.email}</p>
              </div>
              <div>
                <Label className="font-medium">Status</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.status}</p>
              </div>
              <div>
                <Label className="font-medium">Tanggal Daftar</Label>
                <p className="text-sm text-muted-foreground">{new Date(selectedWarga.tanggalDaftar).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
