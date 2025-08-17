import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useUserRole } from "@/hooks/useUserRole"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface TagUMKM {
  id: string
  nama_tag: string
  deskripsi?: string
  warna: string
  created_at: string
  updated_at: string
}

export function MasterTag() {
  const { toast } = useToast()
  const { userProfile, loading: userLoading, isAdmin } = useUserRole()
  const { fetchTagUMKM, addTagUMKM, updateTagUMKM, deleteTagUMKM } = useSupabaseData()
  const [tags, setTags] = useState<TagUMKM[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagUMKM | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    nama_tag: '',
    deskripsi: '',
    warna: '#3B82F6'
  })

  // Check access control
  if (!userLoading && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
        <p className="text-gray-600 mb-4">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <p className="text-sm text-gray-500">
          Halaman ini hanya dapat diakses oleh pengguna dengan role Admin.
        </p>
      </div>
    )
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const data = await fetchTagUMKM()
      setTags(data || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data tag",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      setUploading(true)
      const data = await addTagUMKM(formData)
      
      setTags(prev => [...prev, data])
      setIsAddOpen(false)
      resetForm()
      toast({
        title: "Berhasil",
        description: "Tag berhasil ditambahkan",
      })
    } catch (error) {
      console.error('Error adding tag:', error)
      toast({
        title: "Error",
        description: "Gagal menambahkan tag",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedTag) return
    
    try {
      setUploading(true)
      const data = await updateTagUMKM(selectedTag.id, formData)
      
      setTags(prev => prev.map(tag => tag.id === selectedTag.id ? data : tag))
      setIsEditOpen(false)
      setSelectedTag(null)
      resetForm()
      toast({
        title: "Berhasil",
        description: "Tag berhasil diperbarui",
      })
    } catch (error) {
      console.error('Error updating tag:', error)
      toast({
        title: "Error",
        description: "Gagal memperbarui tag",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTagUMKM(id)
      
      setTags(prev => prev.filter(tag => tag.id !== id))
      toast({
        title: "Berhasil",
        description: "Tag berhasil dihapus",
      })
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: "Error",
        description: "Gagal menghapus tag",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nama_tag: '',
      deskripsi: '',
      warna: '#3B82F6'
    })
  }

  const openEditDialog = (tag: TagUMKM) => {
    setSelectedTag(tag)
    setFormData({
      nama_tag: tag.nama_tag,
      deskripsi: tag.deskripsi || '',
      warna: tag.warna
    })
    setIsEditOpen(true)
  }

  const filteredTags = tags.filter(tag =>
    tag.nama_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.deskripsi && tag.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Master Data Tag UMKM</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tag
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari tag berdasarkan nama atau deskripsi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Memuat data tag...</div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Tag</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Warna</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm ? 'Tidak ada tag yang sesuai dengan pencarian' : 'Belum ada data tag'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Badge style={{ backgroundColor: tag.warna, color: 'white' }}>
                        {tag.nama_tag}
                      </Badge>
                    </TableCell>
                    <TableCell>{tag.deskripsi || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: tag.warna }}
                        />
                        <span className="text-sm text-gray-600">{tag.warna}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(tag.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(tag)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Apakah Anda yakin ingin menghapus tag ini?')) {
                              handleDelete(tag.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Tag Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tag Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama_tag">Nama Tag *</Label>
              <Input
                id="nama_tag"
                value={formData.nama_tag}
                onChange={(e) => setFormData(prev => ({ ...prev, nama_tag: e.target.value }))}
                placeholder="Masukkan nama tag"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                placeholder="Deskripsi tag (opsional)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="warna">Warna</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="warna"
                  value={formData.warna}
                  onChange={(e) => setFormData(prev => ({ ...prev, warna: e.target.value }))}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={formData.warna}
                  onChange={(e) => setFormData(prev => ({ ...prev, warna: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_nama_tag">Nama Tag *</Label>
              <Input
                id="edit_nama_tag"
                value={formData.nama_tag}
                onChange={(e) => setFormData(prev => ({ ...prev, nama_tag: e.target.value }))}
                placeholder="Masukkan nama tag"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_deskripsi">Deskripsi</Label>
              <Textarea
                id="edit_deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                placeholder="Deskripsi tag (opsional)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_warna">Warna</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="edit_warna"
                  value={formData.warna}
                  onChange={(e) => setFormData(prev => ({ ...prev, warna: e.target.value }))}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={formData.warna}
                  onChange={(e) => setFormData(prev => ({ ...prev, warna: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Memperbarui...' : 'Update'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}