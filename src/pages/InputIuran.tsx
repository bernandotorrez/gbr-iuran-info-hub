
import { useState } from "react"
import { Plus, Search, Calendar, User, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Transaksi {
  id: string
  wargaId: string
  namaWarga: string
  alamat: string
  tipeIuranId: string
  namaIuran: string
  nominal: number
  tanggalBayar: string
  bulanPeriode: string
  tahunPeriode: string
  status: "lunas" | "belum-lunas"
  catatan: string
}

const dummyWarga = [
  { id: "1", nama: "Ahmad Budiman", alamat: "Blok A No. 12" },
  { id: "2", nama: "Siti Nurhaliza", alamat: "Blok B No. 05" },
  { id: "3", nama: "Budi Santoso", alamat: "Blok C No. 08" }
]

const dummyTipeIuran = [
  { id: "1", nama: "Iuran Sampah", nominal: 25000 },
  { id: "2", nama: "Kas Lingkungan", nominal: 50000 },
  { id: "3", nama: "Iuran Keamanan", nominal: 100000 }
]

const dummyTransaksi: Transaksi[] = [
  {
    id: "1",
    wargaId: "1",
    namaWarga: "Ahmad Budiman",
    alamat: "Blok A No. 12",
    tipeIuranId: "1",
    namaIuran: "Iuran Sampah",
    nominal: 25000,
    tanggalBayar: "2024-01-15",
    bulanPeriode: "Januari",
    tahunPeriode: "2024",
    status: "lunas",
    catatan: "Bayar tepat waktu"
  },
  {
    id: "2", 
    wargaId: "2",
    namaWarga: "Siti Nurhaliza",
    alamat: "Blok B No. 05",
    tipeIuranId: "2",
    namaIuran: "Kas Lingkungan",
    nominal: 50000,
    tanggalBayar: "2024-01-20",
    bulanPeriode: "Januari",
    tahunPeriode: "2024",
    status: "lunas",
    catatan: ""
  }
]

export default function InputIuran() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(dummyTransaksi)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    wargaId: "",
    tipeIuranId: "",
    tanggalBayar: "",
    bulanPeriode: "",
    tahunPeriode: "",
    catatan: ""
  })

  const filteredTransaksi = transaksiList.filter(transaksi =>
    transaksi.namaWarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaksi.namaIuran.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaksi.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    const selectedWarga = dummyWarga.find(w => w.id === formData.wargaId)
    const selectedTipe = dummyTipeIuran.find(t => t.id === formData.tipeIuranId)
    
    if (!selectedWarga || !selectedTipe) {
      toast({ title: "Error", description: "Pilih warga dan tipe iuran", variant: "destructive" })
      return
    }

    const newTransaksi: Transaksi = {
      id: Date.now().toString(),
      wargaId: formData.wargaId,
      namaWarga: selectedWarga.nama,
      alamat: selectedWarga.alamat,
      tipeIuranId: formData.tipeIuranId,
      namaIuran: selectedTipe.nama,
      nominal: selectedTipe.nominal,
      tanggalBayar: formData.tanggalBayar,
      bulanPeriode: formData.bulanPeriode,
      tahunPeriode: formData.tahunPeriode,
      status: "lunas",
      catatan: formData.catatan
    }

    setTransaksiList([...transaksiList, newTransaksi])
    setFormData({ wargaId: "", tipeIuranId: "", tanggalBayar: "", bulanPeriode: "", tahunPeriode: "", catatan: "" })
    setIsAddOpen(false)
    toast({ title: "Berhasil", description: "Pembayaran iuran berhasil dicatat" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const bulanOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Input Pembayaran Iuran</h1>
          <p className="text-muted-foreground">Catat pembayaran iuran dari warga</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Input Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Input Pembayaran Iuran</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="warga">Pilih Warga</Label>
                <select
                  id="warga"
                  value={formData.wargaId}
                  onChange={(e) => setFormData({...formData, wargaId: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">-- Pilih Warga --</option>
                  {dummyWarga.map(warga => (
                    <option key={warga.id} value={warga.id}>
                      {warga.nama} - {warga.alamat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="tipeIuran">Tipe Iuran</Label>
                <select
                  id="tipeIuran"
                  value={formData.tipeIuranId}
                  onChange={(e) => setFormData({...formData, tipeIuranId: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">-- Pilih Tipe Iuran --</option>
                  {dummyTipeIuran.map(tipe => (
                    <option key={tipe.id} value={tipe.id}>
                      {tipe.nama} - {formatCurrency(tipe.nominal)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="tanggalBayar">Tanggal Bayar</Label>
                <Input
                  id="tanggalBayar"
                  type="date"
                  value={formData.tanggalBayar}
                  onChange={(e) => setFormData({...formData, tanggalBayar: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulanPeriode">Bulan Periode</Label>
                  <select
                    id="bulanPeriode"
                    value={formData.bulanPeriode}
                    onChange={(e) => setFormData({...formData, bulanPeriode: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">-- Pilih Bulan --</option>
                    {bulanOptions.map(bulan => (
                      <option key={bulan} value={bulan}>{bulan}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="tahunPeriode">Tahun</Label>
                  <Input
                    id="tahunPeriode"
                    type="number"
                    value={formData.tahunPeriode}
                    onChange={(e) => setFormData({...formData, tahunPeriode: e.target.value})}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Input
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                  placeholder="Catatan tambahan..."
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Simpan Pembayaran
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Transaksi Hari Ini</p>
              <p className="text-2xl font-bold">
                {transaksiList.filter(t => t.tanggalBayar === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Nominal Hari Ini</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  transaksiList
                    .filter(t => t.tanggalBayar === new Date().toISOString().split('T')[0])
                    .reduce((sum, t) => sum + t.nominal, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Transaksi Bulan Ini</p>
              <p className="text-2xl font-bold">{transaksiList.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
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
              <TableHead>Warga</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Jenis Iuran</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Tanggal Bayar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransaksi.map((transaksi) => (
              <TableRow key={transaksi.id}>
                <TableCell className="font-medium">{transaksi.namaWarga}</TableCell>
                <TableCell>{transaksi.alamat}</TableCell>
                <TableCell>{transaksi.namaIuran}</TableCell>
                <TableCell>{formatCurrency(transaksi.nominal)}</TableCell>
                <TableCell>{transaksi.bulanPeriode} {transaksi.tahunPeriode}</TableCell>
                <TableCell>{new Date(transaksi.tanggalBayar).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {transaksi.status}
                  </span>
                </TableCell>
                <TableCell>{transaksi.catatan || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
