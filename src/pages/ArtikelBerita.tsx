
import { useState } from "react"
import { Plus, Search, Edit2, Trash2, Eye, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Artikel {
  id: string
  judul: string
  konten: string
  penulis: string
  tanggalPublish: string
  status: "draft" | "published" | "archived"
  kategori: string
  views: number
  gambar: string
}

const dummyData: Artikel[] = [
  {
    id: "1",
    judul: "Jadwal Pengangkutan Sampah Bulan Februari",
    konten: "Pengangkutan sampah akan dilakukan setiap hari Senin, Rabu, dan Jumat mulai pukul 06:00 WIB. Mohon warga untuk menyiapkan sampah sebelum waktu tersebut.",
    penulis: "Admin GBR",
    tanggalPublish: "2024-01-25",
    status: "published",
    kategori: "Pengumuman",
    views: 245,
    gambar: "sampah.jpg"
  },
  {
    id: "2",
    judul: "Rapat RT Bulanan - Februari 2024",
    konten: "Rapat RT akan dilaksanakan pada hari Minggu, 4 Februari 2024 pukul 19:00 WIB di Balai Pertemuan. Agenda utama adalah pembahasan proposal renovasi pos keamanan.",
    penulis: "Ketua RT",
    tanggalPublish: "2024-01-20",
    status: "published",
    kategori: "Rapat",
    views: 156,
    gambar: "rapat.jpg"
  },
  {
    id: "3",
    judul: "Program Kerja Bakti Lingkungan",
    konten: "Akan diadakan kerja bakti membersihkan saluran air dan taman lingkungan pada hari Sabtu, 10 Februari 2024. Partisipasi warga sangat diharapkan.",
    penulis: "Koordinator Lingkungan",
    tanggalPublish: "2024-01-22",
    status: "draft",
    kategori: "Kegiatan",
    views: 89,
    gambar: "kerja_bakti.jpg"
  }
]

const kategoriOptions = [
  "Pengumuman",
  "Rapat", 
  "Kegiatan",
  "Informasi",
  "Peringatan"
]

export default function ArtikelBerita() {
  const [artikelList, setArtikelList] = useState<Artikel[]>(dummyData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    judul: "",
    konten: "",
    penulis: "",
    kategori: "",
    gambar: "",
    status: "draft" as "draft" | "published" | "archived"
  })

  const filteredArtikel = artikelList.filter(artikel =>
    artikel.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artikel.konten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artikel.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    const newArtikel: Artikel = {
      id: Date.now().toString(),
      judul: formData.judul,
      konten: formData.konten,
      penulis: formData.penulis,
      tanggalPublish: new Date().toISOString().split('T')[0],
      status: formData.status,
      kategori: formData.kategori,
      views: 0,
      gambar: formData.gambar
    }

    setArtikelList([...artikelList, newArtikel])
    setFormData({ judul: "", konten: "", penulis: "", kategori: "", gambar: "", status: "draft" })
    setIsAddOpen(false)
    toast({ title: "Berhasil", description: "Artikel berhasil ditambahkan" })
  }

  const handleEdit = () => {
    if (!selectedArtikel) return
    const updated = artikelList.map(a => a.id === selectedArtikel.id ? {
      ...selectedArtikel,
      judul: formData.judul,
      konten: formData.konten,
      penulis: formData.penulis,
      kategori: formData.kategori,
      gambar: formData.gambar,
      status: formData.status
    } : a)
    setArtikelList(updated)
    setIsEditOpen(false)
    setSelectedArtikel(null)
    toast({ title: "Berhasil", description: "Artikel berhasil diperbarui" })
  }

  const handleDelete = (id: string) => {
    setArtikelList(artikelList.filter(a => a.id !== id))
    toast({ title: "Berhasil", description: "Artikel berhasil dihapus" })
  }

  const openEdit = (artikel: Artikel) => {
    setSelectedArtikel(artikel)
    setFormData({
      judul: artikel.judul,
      konten: artikel.konten,
      penulis: artikel.penulis,
      kategori: artikel.kategori,
      gambar: artikel.gambar,
      status: artikel.status
    })
    setIsEditOpen(true)
  }

  const openView = (artikel: Artikel) => {
    setSelectedArtikel(artikel)
    setIsViewOpen(true)
    // Increment views
    const updated = artikelList.map(a => a.id === artikel.id ? { ...a, views: a.views + 1 } : a)
    setArtikelList(updated)
  }

  const updateStatus = (id: string, status: "draft" | "published" | "archived") => {
    const updated = artikelList.map(a => a.id === id ? { ...a, status } : a)
    setArtikelList(updated)
    toast({ title: "Berhasil", description: `Status artikel diubah menjadi ${status}` })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Artikel & Berita</h1>
          <p className="text-muted-foreground">Kelola artikel dan pengumuman untuk warga</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tulis Artikel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tulis Artikel Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="judul">Judul Artikel</Label>
                <Input
                  id="judul"
                  value={formData.judul}
                  onChange={(e) => setFormData({...formData, judul: e.target.value})}
                  placeholder="Masukkan judul artikel"
                />
              </div>
              <div>
                <Label htmlFor="kategori">Kategori</Label>
                <select
                  id="kategori"
                  value={formData.kategori}
                  onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriOptions.map(kategori => (
                    <option key={kategori} value={kategori}>{kategori}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="konten">Konten Artikel</Label>
                <textarea
                  id="konten"
                  value={formData.konten}
                  onChange={(e) => setFormData({...formData, konten: e.target.value})}
                  placeholder="Tulis konten artikel di sini..."
                  rows={6}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="penulis">Penulis</Label>
                  <Input
                    id="penulis"
                    value={formData.penulis}
                    onChange={(e) => setFormData({...formData, penulis: e.target.value})}
                    placeholder="Nama penulis"
                  />
                </div>
                <div>
                  <Label htmlFor="gambar">Gambar (Nama File)</Label>
                  <Input
                    id="gambar"
                    value={formData.gambar}
                    onChange={(e) => setFormData({...formData, gambar: e.target.value})}
                    placeholder="artikel.jpg"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Publikasi</option>
                  <option value="archived">Arsip</option>
                </select>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Simpan Artikel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Artikel</p>
              <p className="text-2xl font-bold">{artikelList.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">{artikelList.reduce((sum, a) => sum + a.views, 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Artikel Published</p>
              <p className="text-2xl font-bold">{artikelList.filter(a => a.status === 'published').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari artikel..."
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
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArtikel.map((artikel) => (
              <TableRow key={artikel.id}>
                <TableCell className="font-medium max-w-xs truncate">{artikel.judul}</TableCell>
                <TableCell>{artikel.kategori}</TableCell>
                <TableCell>{artikel.penulis}</TableCell>
                <TableCell>{new Date(artikel.tanggalPublish).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    artikel.status === 'published' 
                      ? 'bg-green-100 text-green-800'
                      : artikel.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {artikel.status}
                  </span>
                </TableCell>
                <TableCell>{artikel.views}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openView(artikel)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(artikel)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(artikel.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Artikel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-judul">Judul Artikel</Label>
              <Input
                id="edit-judul"
                value={formData.judul}
                onChange={(e) => setFormData({...formData, judul: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-kategori">Kategori</Label>
              <select
                id="edit-kategori"
                value={formData.kategori}
                onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="">-- Pilih Kategori --</option>
                {kategoriOptions.map(kategori => (
                  <option key={kategori} value={kategori}>{kategori}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-konten">Konten Artikel</Label>
              <textarea
                id="edit-konten"
                value={formData.konten}
                onChange={(e) => setFormData({...formData, konten: e.target.value})}
                rows={6}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-penulis">Penulis</Label>
                <Input
                  id="edit-penulis"
                  value={formData.penulis}
                  onChange={(e) => setFormData({...formData, penulis: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-gambar">Gambar</Label>
                <Input
                  id="edit-gambar"
                  value={formData.gambar}
                  onChange={(e) => setFormData({...formData, gambar: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full p-2 border rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="published">Publikasi</option>
                <option value="archived">Arsip</option>
              </select>
            </div>
            <Button onClick={handleEdit} className="w-full">
              Update Artikel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Artikel</DialogTitle>
          </DialogHeader>
          {selectedArtikel && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedArtikel.judul}</h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                  <span>Oleh: {selectedArtikel.penulis}</span>
                  <span>•</span>
                  <span>{new Date(selectedArtikel.tanggalPublish).toLocaleDateString('id-ID')}</span>
                  <span>•</span>
                  <span>{selectedArtikel.kategori}</span>
                  <span>•</span>
                  <span>{selectedArtikel.views} views</span>
                </div>
              </div>
              <div className="prose max-w-none">
                <p>{selectedArtikel.konten}</p>
              </div>
              <div className="flex space-x-2 pt-4">
                {selectedArtikel.status === 'draft' && (
                  <Button onClick={() => updateStatus(selectedArtikel.id, 'published')}>
                    Publikasikan
                  </Button>
                )}
                {selectedArtikel.status === 'published' && (
                  <Button variant="outline" onClick={() => updateStatus(selectedArtikel.id, 'archived')}>
                    Arsipkan
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
