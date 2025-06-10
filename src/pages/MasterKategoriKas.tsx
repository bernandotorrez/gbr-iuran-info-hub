
import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useKategoriKas } from "@/hooks/useKategoriKas"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface KategoriKas {
  id: string
  nama: string
  deskripsi: string | null
  status_aktif: boolean
}

export default function MasterKategoriKas() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingKategori, setEditingKategori] = useState<KategoriKas | null>(null)
  const { toast } = useToast()
  const { kategoriList, loading, fetchKategoriKas } = useKategoriKas()
  const { user, session } = useAuth()

  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: ""
  })

  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('warga_new')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          setUserProfile(data)
        }
      }
    }
    
    fetchUserProfile()
  }, [user])

  const filteredKategori = kategoriList.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAdd = async () => {
    if (!formData.nama.trim()) {
      toast({ 
        title: "Error", 
        description: "Nama kategori wajib diisi",
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
          status_aktif: true
        }])

      if (error) throw error

      setFormData({ nama: "", deskripsi: "" })
      setIsAddOpen(false)
      await fetchKategoriKas()
      toast({ title: "Berhasil", description: "Kategori berhasil ditambahkan" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menambahkan kategori",
        variant: "destructive" 
      })
    }
  }

  const handleEdit = async () => {
    if (!editingKategori || !formData.nama.trim()) {
      toast({ 
        title: "Error", 
        description: "Nama kategori wajib diisi",
        variant: "destructive" 
      })
      return
    }

    try {
      const { error } = await supabase
        .from('kategori_kas_keluar')
        .update({
          nama: formData.nama,
          deskripsi: formData.deskripsi || null
        })
        .eq('id', editingKategori.id)

      if (error) throw error

      setFormData({ nama: "", deskripsi: "" })
      setIsEditOpen(false)
      setEditingKategori(null)
      await fetchKategoriKas()
      toast({ title: "Berhasil", description: "Kategori berhasil diperbarui" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memperbarui kategori",
        variant: "destructive" 
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return

    try {
      const { error } = await supabase
        .from('kategori_kas_keluar')
        .update({ status_aktif: false })
        .eq('id', id)

      if (error) throw error

      await fetchKategoriKas()
      toast({ title: "Berhasil", description: "Kategori berhasil dihapus" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menghapus kategori",
        variant: "destructive" 
      })
    }
  }

  const openEditDialog = (kategori: KategoriKas) => {
    setEditingKategori(kategori)
    setFormData({
      nama: kategori.nama,
      deskripsi: kategori.deskripsi || ""
    })
    setIsEditOpen(true)
  }

  const isAdmin = userProfile?.role === 'admin'

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Kategori Output Kas</h1>
          <p className="text-muted-foreground">Kelola kategori pengeluaran kas</p>
        </div>
        {isAdmin && (
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
                  />
                </div>
                <div>
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Input
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    placeholder="Deskripsi kategori"
                  />
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Simpan Kategori
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
              {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKategori.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nama}</TableCell>
                <TableCell>{item.deskripsi || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status_aktif 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status_aktif ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(item)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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
              />
            </div>
            <div>
              <Label htmlFor="edit-deskripsi">Deskripsi</Label>
              <Input
                id="edit-deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                placeholder="Deskripsi kategori"
              />
            </div>
            <Button onClick={handleEdit} className="w-full">
              Perbarui Kategori
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
