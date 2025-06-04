
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Eye, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface Artikel {
  id: string
  judul: string
  konten: string
  author_id: string
  published_at?: string
  status: "draft" | "published" | "archived"
  kategori: string
  gambar_url?: string
  excerpt?: string
  created_at: string
}

const kategoriOptions = [
  "Pengumuman",
  "Rapat", 
  "Kegiatan",
  "Informasi",
  "Peringatan"
]

export default function ArtikelBerita() {
  const [artikelList, setArtikelList] = useState<Artikel[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { fetchArtikel, addArtikel, updateArtikel, deleteArtikel } = useSupabaseData()

  const [formData, setFormData] = useState({
    judul: "",
    konten: "",
    kategori: "",
    gambar_url: "",
    excerpt: "",
    status: "draft" as "draft" | "published" | "archived"
  })

  const loadArtikel = async () => {
    try {
      setLoading(true)
      const data = await fetchArtikel()
      setArtikelList(data)
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat data artikel",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArtikel()
  }, [])

  const filteredArtikel = artikelList.filter(artikel =>
    artikel.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artikel.konten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artikel.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    try {
      await addArtikel(formData)
      setFormData({ 
        judul: "", 
        konten: "", 
        kategori: "", 
        gambar_url: "", 
        excerpt: "",
        status: "draft" 
      })
      setIsAddOpen(false)
      await loadArtikel()
      toast({ title: "Berhasil", description: "Artikel berhasil ditambahkan" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menambahkan artikel",
        variant: "destructive" 
      })
    }
  }

  const handleEdit = async () => {
    if (!selectedArtikel) return
    try {
      await updateArtikel(selectedArtikel.id, formData)
      setIsEditOpen(false)
      setSelectedArtikel(null)
      await loadArtikel()
      toast({ title: "Berhasil", description: "Artikel berhasil diperbarui" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memperbarui artikel",
        variant: "destructive" 
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteArtikel(id)
      await loadArtikel()
      toast({ title: "Berhasil", description: "Artikel berhasil dihapus" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menghapus artikel",
        variant: "destructive" 
      })
    }
  }

  const openEdit = (artikel: Artikel) => {
    setSelectedArtikel(artikel)
    setFormData({
      judul: artikel.judul,
      konten: artikel.konten,
      kategori: artikel.kategori,
      gambar_url: artikel.gambar_url || "",
      excerpt: artikel.excerpt || "",
      status: artikel.status
    })
    setIsEditOpen(true)
  }

  const openView = (artikel: Artikel) => {
    setSelectedArtikel(artikel)
    setIsViewOpen(true)
  }

  const updateStatus = async (id: string, status: "draft" | "published" | "archived") => {
    try {
      await updateArtikel(id, { status })
      await loadArtikel()
      toast({ title: "Berhasil", description: `Status artikel diubah menjadi ${status}` })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal mengubah status",
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
          <DialogContent className="max-w-2xl bg-card text-card-foreground">
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
                <Label htmlFor="excerpt">Ringkasan</Label>
                <Input
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Ringkasan singkat artikel"
                />
              </div>
              <div>
                <Label htmlFor="konten">Konten Artikel</Label>
                <Textarea
                  id="konten"
                  value={formData.konten}
                  onChange={(e) => setFormData({...formData, konten: e.target.value})}
                  placeholder="Tulis konten artikel di sini..."
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="gambar">Gambar URL</Label>
                <Input
                  id="gambar"
                  value={formData.gambar_url}
                  onChange={(e) => setFormData({...formData, gambar_url: e.target.value})}
                  placeholder="https://example.com/gambar.jpg"
                />
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
              <p className="text-sm font-medium text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold">{artikelList.filter(a => a.status === 'draft').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Published</p>
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
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Buat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArtikel.map((artikel) => (
              <TableRow key={artikel.id}>
                <TableCell className="font-medium max-w-xs truncate">{artikel.judul}</TableCell>
                <TableCell>{artikel.kategori}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    artikel.status === 'published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : artikel.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {artikel.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(artikel.created_at).toLocaleDateString('id-ID')}</TableCell>
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
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
        <DialogContent className="max-w-2xl bg-card text-card-foreground">
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
              <Label htmlFor="edit-excerpt">Ringkasan</Label>
              <Input
                id="edit-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-konten">Konten Artikel</Label>
              <Textarea
                id="edit-konten"
                value={formData.konten}
                onChange={(e) => setFormData({...formData, konten: e.target.value})}
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="edit-gambar">Gambar URL</Label>
              <Input
                id="edit-gambar"
                value={formData.gambar_url}
                onChange={(e) => setFormData({...formData, gambar_url: e.target.value})}
              />
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
        <DialogContent className="max-w-2xl bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Preview Artikel</DialogTitle>
          </DialogHeader>
          {selectedArtikel && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedArtikel.judul}</h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                  <span>{new Date(selectedArtikel.created_at).toLocaleDateString('id-ID')}</span>
                  <span>•</span>
                  <span>{selectedArtikel.kategori}</span>
                  <span>•</span>
                  <span>{selectedArtikel.status}</span>
                </div>
              </div>
              {selectedArtikel.excerpt && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium">{selectedArtikel.excerpt}</p>
                </div>
              )}
              <div className="prose max-w-none dark:prose-invert">
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
