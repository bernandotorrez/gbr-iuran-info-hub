
import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useFormValidation, wargaFormSchema, type WargaFormData } from "@/hooks/useFormValidation"
import { ValidatedInput } from "@/components/ui/validated-input"
import { ValidatedSelect } from "@/components/ui/validated-select"

interface Warga {
  id: string
  nama: string
  phone_number: string
  alamat?: string
  rt_rw?: string
  email?: string
  status_aktif: boolean
  created_at: string
}

export default function MasterWarga() {
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { fetchWarga, addWarga, updateWarga, deleteWarga } = useSupabaseData()

  const form = useFormValidation(wargaFormSchema, {
    nama: "",
    phone_number: "",
    alamat: "",
    rt_rw: "",
    email: ""
  })

  const editForm = useFormValidation(wargaFormSchema, {
    nama: "",
    phone_number: "",
    alamat: "",
    rt_rw: "",
    email: ""
  })

  useEffect(() => {
    loadWarga()
  }, [])

  const loadWarga = async () => {
    setLoading(true)
    try {
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

  const filteredWarga = wargaList.filter(warga =>
    warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.phone_number.includes(searchTerm) ||
    (warga.alamat && warga.alamat.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAdd = async (data: WargaFormData) => {
    try {
      await addWarga(data)
      await loadWarga()
      setIsAddOpen(false)
      form.reset()
      toast({ title: "Berhasil", description: "Data warga berhasil ditambahkan" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan data warga",
        variant: "destructive"
      })
    }
  }

  const handleEdit = async (data: WargaFormData) => {
    if (!selectedWarga) return
    try {
      await updateWarga(selectedWarga.id, data)
      await loadWarga()
      setIsEditOpen(false)
      setSelectedWarga(null)
      editForm.reset()
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
      toast({ title: "Berhasil", description: "Data warga berhasil dihapus" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus data warga",
        variant: "destructive"
      })
    }
  }

  const openEdit = (warga: Warga) => {
    setSelectedWarga(warga)
    editForm.reset({
      nama: warga.nama,
      phone_number: warga.phone_number,
      alamat: warga.alamat || "",
      rt_rw: warga.rt_rw || "",
      email: warga.email || ""
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
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
              <ValidatedInput
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                error={form.formState.errors.nama?.message}
                {...form.register("nama")}
              />
              <ValidatedInput
                label="Nomor Handphone"
                placeholder="081234567890"
                error={form.formState.errors.phone_number?.message}
                {...form.register("phone_number")}
              />
              <ValidatedInput
                label="Alamat"
                placeholder="Masukkan alamat lengkap"
                error={form.formState.errors.alamat?.message}
                {...form.register("alamat")}
              />
              <ValidatedInput
                label="RT/RW"
                placeholder="RT 01/RW 02"
                error={form.formState.errors.rt_rw?.message}
                {...form.register("rt_rw")}
              />
              <ValidatedInput
                label="Email"
                type="email"
                placeholder="email@contoh.com"
                error={form.formState.errors.email?.message}
                {...form.register("email")}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                Simpan
              </Button>
            </form>
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
              <TableHead>No. Handphone</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>RT/RW</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredWarga.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Tidak ada data warga</TableCell>
              </TableRow>
            ) : (
              filteredWarga.map((warga) => (
                <TableRow key={warga.id}>
                  <TableCell className="font-medium">{warga.nama}</TableCell>
                  <TableCell>{warga.phone_number}</TableCell>
                  <TableCell>{warga.alamat || "-"}</TableCell>
                  <TableCell>{warga.rt_rw || "-"}</TableCell>
                  <TableCell>{warga.email || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      warga.status_aktif 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {warga.status_aktif ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(warga.created_at).toLocaleDateString('id-ID')}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Warga</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <ValidatedInput
              label="Nama Lengkap"
              error={editForm.formState.errors.nama?.message}
              {...editForm.register("nama")}
            />
            <ValidatedInput
              label="Nomor Handphone"
              error={editForm.formState.errors.phone_number?.message}
              {...editForm.register("phone_number")}
            />
            <ValidatedInput
              label="Alamat"
              error={editForm.formState.errors.alamat?.message}
              {...editForm.register("alamat")}
            />
            <ValidatedInput
              label="RT/RW"
              error={editForm.formState.errors.rt_rw?.message}
              {...editForm.register("rt_rw")}
            />
            <ValidatedInput
              label="Email"
              type="email"
              error={editForm.formState.errors.email?.message}
              {...editForm.register("email")}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              Update
            </Button>
          </form>
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
                <Label className="font-medium">No. Handphone</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.phone_number}</p>
              </div>
              <div>
                <Label className="font-medium">Alamat</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.alamat || "-"}</p>
              </div>
              <div>
                <Label className="font-medium">RT/RW</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.rt_rw || "-"}</p>
              </div>
              <div>
                <Label className="font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.email || "-"}</p>
              </div>
              <div>
                <Label className="font-medium">Status</Label>
                <p className="text-sm text-muted-foreground">{selectedWarga.status_aktif ? 'Aktif' : 'Non-aktif'}</p>
              </div>
              <div>
                <Label className="font-medium">Tanggal Daftar</Label>
                <p className="text-sm text-muted-foreground">{new Date(selectedWarga.created_at).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
