
import { useState } from "react"
import { Plus, Search, TrendingDown, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Pengeluaran {
  id: string
  tanggal: string
  kategori: string
  deskripsi: string
  nominal: number
  penerima: string
  bukti: string
  status: "disetujui" | "pending" | "ditolak"
  catatan: string
  dibuat: string
}

const dummyData: Pengeluaran[] = [
  {
    id: "1",
    tanggal: "2024-01-10",
    kategori: "Operasional",
    deskripsi: "Pembelian alat kebersihan",
    nominal: 150000,
    penerima: "Toko ABC",
    bukti: "nota_001.jpg",
    status: "disetujui",
    catatan: "Untuk kebutuhan cleaning service",
    dibuat: "2024-01-10"
  },
  {
    id: "2",
    tanggal: "2024-01-15",
    kategori: "Keamanan",
    deskripsi: "Gaji satpam bulan Januari",
    nominal: 2500000,
    penerima: "Pak Security",
    bukti: "slip_gaji_jan.pdf",
    status: "disetujui",
    catatan: "Gaji bulanan security",
    dibuat: "2024-01-15"
  },
  {
    id: "3",
    tanggal: "2024-01-20",
    kategori: "Maintenance",
    deskripsi: "Perbaikan lampu jalan",
    nominal: 500000,
    penerima: "Tukang Listrik",
    bukti: "nota_listrik.jpg",
    status: "pending",
    catatan: "Lampu jalan Blok B rusak",
    dibuat: "2024-01-20"
  }
]

const kategoriOptions = [
  "Operasional",
  "Keamanan", 
  "Maintenance",
  "Kebersihan",
  "Administrasi",
  "Lainnya"
]

export default function OutputKas() {
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>(dummyData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    tanggal: "",
    kategori: "",
    deskripsi: "",
    nominal: "",
    penerima: "",
    bukti: "",
    catatan: ""
  })

  const filteredPengeluaran = pengeluaranList.filter(item =>
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.penerima.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    const newPengeluaran: Pengeluaran = {
      id: Date.now().toString(),
      tanggal: formData.tanggal,
      kategori: formData.kategori,
      deskripsi: formData.deskripsi,
      nominal: parseInt(formData.nominal),
      penerima: formData.penerima,
      bukti: formData.bukti,
      status: "pending",
      catatan: formData.catatan,
      dibuat: new Date().toISOString().split('T')[0]
    }

    setPengeluaranList([...pengeluaranList, newPengeluaran])
    setFormData({ tanggal: "", kategori: "", deskripsi: "", nominal: "", penerima: "", bukti: "", catatan: "" })
    setIsAddOpen(false)
    toast({ title: "Berhasil", description: "Pengeluaran berhasil dicatat" })
  }

  const updateStatus = (id: string, status: "disetujui" | "pending" | "ditolak") => {
    const updated = pengeluaranList.map(item => 
      item.id === id ? { ...item, status } : item
    )
    setPengeluaranList(updated)
    toast({ title: "Berhasil", description: `Status pengeluaran diubah menjadi ${status}` })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const totalPengeluaran = pengeluaranList
    .filter(item => item.status === "disetujui")
    .reduce((sum, item) => sum + item.nominal, 0)

  const totalPending = pengeluaranList
    .filter(item => item.status === "pending")
    .reduce((sum, item) => sum + item.nominal, 0)

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
                  value={formData.tanggal}
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
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
                <Label htmlFor="penerima">Penerima</Label>
                <Input
                  id="penerima"
                  value={formData.penerima}
                  onChange={(e) => setFormData({...formData, penerima: e.target.value})}
                  placeholder="Nama penerima/vendor"
                />
              </div>
              <div>
                <Label htmlFor="bukti">Bukti (Nama File)</Label>
                <Input
                  id="bukti"
                  value={formData.bukti}
                  onChange={(e) => setFormData({...formData, bukti: e.target.value})}
                  placeholder="nota_001.jpg"
                />
              </div>
              <div>
                <Label htmlFor="catatan">Catatan</Label>
                <Input
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                  placeholder="Catatan tambahan"
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
              <TableHead>Deskripsi</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Penerima</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bukti</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPengeluaran.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{item.kategori}</TableCell>
                <TableCell className="font-medium">{item.deskripsi}</TableCell>
                <TableCell>{formatCurrency(item.nominal)}</TableCell>
                <TableCell>{item.penerima}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'disetujui' 
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>{item.bukti}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    {item.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateStatus(item.id, 'disetujui')}
                          className="text-green-600 hover:text-green-700"
                        >
                          Setujui
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateStatus(item.id, 'ditolak')}
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
