
import { useState, useEffect } from "react"
import { Plus, Search, TrendingDown, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useAuth } from "@/contexts/AuthContext"

interface Pengeluaran {
  id: string
  tanggal_keluar: string
  kategori: string
  deskripsi: string
  judul: string
  nominal: number
  status_persetujuan: string
  bukti_transaksi_url?: string
  created_at: string
  diinput_oleh?: {
    nama: string
  }
  disetujui_oleh?: {
    nama: string
  }
}

const kategoriOptions = [
  "Operasional",
  "Keamanan", 
  "Maintenance",
  "Kebersihan",
  "Administrasi",
  "Lainnya"
]

export default function OutputKas() {
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { session } = useAuth()
  const { fetchKasKeluar, addKasKeluar, updateKasKeluarStatus } = useSupabaseData()

  const [formData, setFormData] = useState({
    tanggal_keluar: "",
    kategori: "",
    judul: "",
    deskripsi: "",
    nominal: "",
    bukti_transaksi_url: ""
  })

  const loadKasKeluar = async () => {
    try {
      setLoading(true)
      const data = await fetchKasKeluar()
      setPengeluaranList(data)
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat data kas keluar",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKasKeluar()
  }, [])

  const filteredPengeluaran = pengeluaranList.filter(item =>
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.judul.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    try {
      await addKasKeluar({
        tanggal_keluar: formData.tanggal_keluar,
        kategori: formData.kategori,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        nominal: parseInt(formData.nominal),
        bukti_transaksi_url: formData.bukti_transaksi_url
      })

      setFormData({ 
        tanggal_keluar: "", 
        kategori: "", 
        judul: "",
        deskripsi: "", 
        nominal: "", 
        bukti_transaksi_url: "" 
      })
      setIsAddOpen(false)
      await loadKasKeluar()
      toast({ title: "Berhasil", description: "Pengeluaran berhasil dicatat" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal mencatat pengeluaran",
        variant: "destructive" 
      })
    }
  }

  const updateStatus = async (id: string, status: "approved" | "pending" | "rejected") => {
    try {
      await updateKasKeluarStatus(id, status, session?.user?.id)
      await loadKasKeluar()
      toast({ title: "Berhasil", description: `Status pengeluaran diubah menjadi ${status}` })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal mengubah status",
        variant: "destructive" 
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const totalPengeluaran = pengeluaranList
    .filter(item => item.status_persetujuan === "approved")
    .reduce((sum, item) => sum + item.nominal, 0)

  const totalPending = pengeluaranList
    .filter(item => item.status_persetujuan === "pending")
    .reduce((sum, item) => sum + item.nominal, 0)

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Output Kas</h1>
          <p className="text-muted-foreground">Kelola pengeluaran kas perumahan</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengeluaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Pengeluaran Kas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal_keluar}
                  onChange={(e) => setFormData({...formData, tanggal_keluar: e.target.value})}
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
                <Label htmlFor="judul">Judul</Label>
                <Input
                  id="judul"
                  value={formData.judul}
                  onChange={(e) => setFormData({...formData, judul: e.target.value})}
                  placeholder="Judul pengeluaran"
                />
              </div>
              <div>
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Input
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  placeholder="Deskripsi pengeluaran"
                />
              </div>
              <div>
                <Label htmlFor="nominal">Nominal (Rp)</Label>
                <Input
                  id="nominal"
                  type="number"
                  value={formData.nominal}
                  onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                  placeholder="150000"
                />
              </div>
              <div>
                <Label htmlFor="bukti">Bukti (URL)</Label>
                <Input
                  id="bukti"
                  value={formData.bukti_transaksi_url}
                  onChange={(e) => setFormData({...formData, bukti_transaksi_url: e.target.value})}
                  placeholder="https://example.com/nota.jpg"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Simpan Pengeluaran
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran Disetujui</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPengeluaran)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
              <p className="text-2xl font-bold">{pengeluaranList.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pengeluaran..."
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
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPengeluaran.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.tanggal_keluar).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{item.kategori}</TableCell>
                <TableCell className="font-medium">{item.judul}</TableCell>
                <TableCell>{item.deskripsi}</TableCell>
                <TableCell>{formatCurrency(item.nominal)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status_persetujuan === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : item.status_persetujuan === 'pending'
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status_persetujuan === 'approved' ? 'Disetujui' : 
                     item.status_persetujuan === 'pending' ? 'Pending' : 'Ditolak'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    {item.status_persetujuan === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateStatus(item.id, 'approved')}
                          className="text-green-600 hover:text-green-700"
                        >
                          Setujui
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateStatus(item.id, 'rejected')}
                          className="text-red-600 hover:text-red-700"
                        >
                          Tolak
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
