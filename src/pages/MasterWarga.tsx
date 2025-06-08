
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { WargaFormDialog } from "@/components/forms/WargaFormDialog"
import { UserManagementDialog } from "@/components/forms/UserManagementDialog"

interface Warga {
  id: string
  nama: string
  phone_number: string
  alamat: string
  rt_rw: string
  email?: string
  role: string
  status_aktif: boolean
  created_at: string
}

export default function MasterWarga() {
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false)
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { fetchWarga, addWarga, updateWarga, deleteWarga } = useSupabaseData()

  const loadWarga = async () => {
    try {
      setLoading(true)
      const data = await fetchWarga()
      setWargaList(data)
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat data warga",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWarga()
  }, [])

  const filteredWarga = wargaList.filter(warga =>
    warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.phone_number.includes(searchTerm) ||
    warga.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.rt_rw.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async (wargaData: any) => {
    try {
      await addWarga(wargaData)
      await loadWarga()
      toast({ title: "Berhasil", description: "Warga berhasil ditambahkan" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menambahkan warga",
        variant: "destructive" 
      })
    }
  }

  const handleEdit = async (wargaData: any) => {
    if (!selectedWarga) return
    try {
      await updateWarga(selectedWarga.id, wargaData)
      setIsEditOpen(false)
      setSelectedWarga(null)
      await loadWarga()
      toast({ title: "Berhasil", description: "Data warga berhasil diperbarui" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memperbarui data warga",
        variant: "destructive" 
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWarga(id)
      await loadWarga()
      toast({ title: "Berhasil", description: "Warga berhasil dihapus" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menghapus warga",
        variant: "destructive" 
      })
    }
  }

  const openEdit = (warga: Warga) => {
    setSelectedWarga(warga)
    setIsEditOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data Warga</h1>
          <p className="text-muted-foreground">Kelola data warga dan pengguna sistem</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsUserMgmtOpen(true)} variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah User Login
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Warga
          </Button>
        </div>
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
              <TableHead>Telepon</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>RT/RW</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarga.map((warga) => (
              <TableRow key={warga.id}>
                <TableCell className="font-medium">{warga.nama}</TableCell>
                <TableCell>{warga.phone_number}</TableCell>
                <TableCell className="max-w-xs truncate">{warga.alamat}</TableCell>
                <TableCell>{warga.rt_rw}</TableCell>
                <TableCell>
                  <Badge variant={warga.role === 'admin' ? 'default' : 'secondary'}>
                    {warga.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={warga.status_aktif ? 'default' : 'secondary'}>
                    {warga.status_aktif ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(warga)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(warga.id)}
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
      <WargaFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAdd}
        title="Tambah Warga Baru"
      />

      {/* Edit Dialog */}
      <WargaFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleEdit}
        initialData={selectedWarga || undefined}
        title="Edit Data Warga"
      />

      {/* User Management Dialog */}
      <UserManagementDialog
        open={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
        onUserAdded={loadWarga}
      />
    </div>
  )
}
