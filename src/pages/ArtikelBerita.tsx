
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Eye, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { ArtikelFormDialog } from "@/components/forms/ArtikelFormDialog"

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

// Valid status types for artikel
type ValidStatus = "draft" | "published" | "archived";

// Function to validate and normalize artikel status
const normalizeStatus = (status: string | null | undefined): ValidStatus => {
  if (status === "published" || status === "draft" || status === "archived") {
    return status;
  }
  return "draft"; // Default to draft for any invalid status
}

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

  const loadArtikel = async () => {
    try {
      setLoading(true)
      const data = await fetchArtikel()
      
      // Transform the data to ensure it conforms to the Artikel interface
      const typedData: Artikel[] = data.map(item => ({
        ...item,
        status: normalizeStatus(item.status),
        excerpt: item.excerpt || "",
        gambar_url: item.gambar_url || "",
        published_at: item.published_at || undefined
      }));
      
      setArtikelList(typedData)
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

  const handleAdd = async (formData: any) => {
    try {
      await addArtikel(formData)
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

  const handleEdit = async (formData: any) => {
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
    setIsEditOpen(true)
  }

  const openView = (artikel: Artikel) => {
    setSelectedArtikel(artikel)
    setIsViewOpen(true)
  }

  const updateStatus = async (id: string, status: ValidStatus) => {
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
        <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Tulis Artikel
        </Button>
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

      {/* Add Dialog */}
      <ArtikelFormDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />

      {/* Edit Dialog */}
      <ArtikelFormDialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEdit}
        editData={selectedArtikel}
      />

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
              <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedArtikel.konten }} />
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
