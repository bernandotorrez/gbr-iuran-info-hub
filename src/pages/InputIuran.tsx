
import { useState, useEffect } from "react"
import { Plus, Search, Calendar, User, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface Transaksi {
  id: string
  warga_id: string
  tipe_iuran_id: string
  nominal: number
  tanggal_bayar: string
  bulan: number
  tahun: number
  status_verifikasi: string
  keterangan?: string
  warga?: {
    nama: string
    alamat: string
    rt_rw: string
  }
  tipe_iuran?: {
    nama: string
  }
}

interface Warga {
  id: string
  nama: string
  alamat: string
  rt_rw: string
}

interface TipeIuran {
  id: string
  nama: string
  nominal: number
}

export default function InputIuran() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([])
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [tipeIuranList, setTipeIuranList] = useState<TipeIuran[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { fetchWarga, fetchTipeIuran, fetchIuran, addIuran } = useSupabaseData()

  const [formData, setFormData] = useState({
    warga_id: "",
    tipe_iuran_id: "",
    tanggal_bayar: "",
    bulan: "",
    tahun: "",
    keterangan: ""
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [warga, tipeIuran, iuran] = await Promise.all([
        fetchWarga(),
        fetchTipeIuran(),
        fetchIuran()
      ])
      setWargaList(warga)
      setTipeIuranList(tipeIuran)
      setTransaksiList(iuran)
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat data",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredTransaksi = transaksiList.filter(transaksi =>
    transaksi.warga?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaksi.tipe_iuran?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaksi.warga?.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    const selectedWarga = wargaList.find(w => w.id === formData.warga_id)
    const selectedTipe = tipeIuranList.find(t => t.id === formData.tipe_iuran_id)
    
    if (!selectedWarga || !selectedTipe) {
      toast({ title: "Error", description: "Pilih warga dan tipe iuran", variant: "destructive" })
      return
    }

    try {
      await addIuran({
        warga_id: formData.warga_id,
        tipe_iuran_id: formData.tipe_iuran_id,
        nominal: selectedTipe.nominal,
        tanggal_bayar: formData.tanggal_bayar,
        bulan: parseInt(formData.bulan),
        tahun: parseInt(formData.tahun),
        keterangan: formData.keterangan
      })

      setFormData({ warga_id: "", tipe_iuran_id: "", tanggal_bayar: "", bulan: "", tahun: "", keterangan: "" })
      setIsAddOpen(false)
      await loadData()
      toast({ title: "Berhasil", description: "Pembayaran iuran berhasil dicatat" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal mencatat pembayaran",
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

  const bulanOptions = [
    { value: "1", label: "Januari" }, { value: "2", label: "Februari" }, 
    { value: "3", label: "Maret" }, { value: "4", label: "April" }, 
    { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "Agustus" }, 
    { value: "9", label: "September" }, { value: "10", label: "Oktober" }, 
    { value: "11", label: "November" }, { value: "12", label: "Desember" }
  ]

  const getBulanLabel = (bulan: number) => {
    const option = bulanOptions.find(opt => opt.value === bulan.toString())
    return option ? option.label : bulan.toString()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

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
                  value={formData.warga_id}
                  onChange={(e) => setFormData({...formData, warga_id: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">-- Pilih Warga --</option>
                  {wargaList.map(warga => (
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
                  value={formData.tipe_iuran_id}
                  onChange={(e) => setFormData({...formData, tipe_iuran_id: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">-- Pilih Tipe Iuran --</option>
                  {tipeIuranList.map(tipe => (
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
                  value={formData.tanggal_bayar}
                  onChange={(e) => setFormData({...formData, tanggal_bayar: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulanPeriode">Bulan Periode</Label>
                  <select
                    id="bulanPeriode"
                    value={formData.bulan}
                    onChange={(e) => setFormData({...formData, bulan: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">-- Pilih Bulan --</option>
                    {bulanOptions.map(bulan => (
                      <option key={bulan.value} value={bulan.value}>{bulan.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="tahunPeriode">Tahun</Label>
                  <Input
                    id="tahunPeriode"
                    type="number"
                    value={formData.tahun}
                    onChange={(e) => setFormData({...formData, tahun: e.target.value})}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="keterangan">Catatan (Opsional)</Label>
                <Input
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
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
                {transaksiList.filter(t => t.tanggal_bayar === new Date().toISOString().split('T')[0]).length}
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
                    .filter(t => t.tanggal_bayar === new Date().toISOString().split('T')[0])
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
                <TableCell className="font-medium">{transaksi.warga?.nama}</TableCell>
                <TableCell>{transaksi.warga?.alamat}</TableCell>
                <TableCell>{transaksi.tipe_iuran?.nama}</TableCell>
                <TableCell>{formatCurrency(transaksi.nominal)}</TableCell>
                <TableCell>{getBulanLabel(transaksi.bulan)} {transaksi.tahun}</TableCell>
                <TableCell>{new Date(transaksi.tanggal_bayar).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {transaksi.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'}
                  </span>
                </TableCell>
                <TableCell>{transaksi.keterangan || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
