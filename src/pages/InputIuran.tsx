
import { useState, useEffect } from "react"
import { Plus, Search, Calendar, User, CreditCard, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [filteredTransaksi, setFilteredTransaksi] = useState<Transaksi[]>([])
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [tipeIuranList, setTipeIuranList] = useState<TipeIuran[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
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

  useEffect(() => {
    // Set current month and year as default
    const currentDate = new Date()
    setFormData(prev => ({
      ...prev,
      bulan: (currentDate.getMonth() + 1).toString(),
      tahun: currentDate.getFullYear().toString(),
      tanggal_bayar: currentDate.toISOString().split('T')[0]
    }))
  }, [])

  useEffect(() => {
    // Filter transactions based on search term and month/year filter
    let filtered = transaksiList.filter(transaksi =>
      transaksi.warga?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaksi.tipe_iuran?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaksi.warga?.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterMonth && filterYear) {
      filtered = filtered.filter(transaksi => 
        transaksi.bulan === parseInt(filterMonth) && 
        transaksi.tahun === parseInt(filterYear)
      )
    }

    setFilteredTransaksi(filtered)
  }, [transaksiList, searchTerm, filterMonth, filterYear])

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

      setFormData({ 
        warga_id: "", 
        tipe_iuran_id: "", 
        tanggal_bayar: new Date().toISOString().split('T')[0], 
        bulan: (new Date().getMonth() + 1).toString(), 
        tahun: new Date().getFullYear().toString(), 
        keterangan: "" 
      })
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

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString())

  const getBulanLabel = (bulan: number) => {
    const option = bulanOptions.find(opt => opt.value === bulan.toString())
    return option ? option.label : bulan.toString()
  }

  const getStatsForPeriod = (month: number, year: number) => {
    const periodTransactions = transaksiList.filter(t => 
      t.bulan === month && t.tahun === year
    )
    
    const todayTransactions = periodTransactions.filter(t => 
      t.tanggal_bayar === new Date().toISOString().split('T')[0]
    )

    return {
      todayCount: todayTransactions.length,
      todayTotal: todayTransactions.reduce((sum, t) => sum + t.nominal, 0),
      monthCount: periodTransactions.length,
      monthTotal: periodTransactions.reduce((sum, t) => sum + t.nominal, 0)
    }
  }

  const stats = getStatsForPeriod(parseInt(filterMonth), parseInt(filterYear))

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
                <Select value={formData.warga_id} onValueChange={(value) => setFormData({...formData, warga_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Warga --" />
                  </SelectTrigger>
                  <SelectContent>
                    {wargaList.map(warga => (
                      <SelectItem key={warga.id} value={warga.id}>
                        {warga.nama} - {warga.alamat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipeIuran">Tipe Iuran</Label>
                <Select value={formData.tipe_iuran_id} onValueChange={(value) => setFormData({...formData, tipe_iuran_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Tipe Iuran --" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipeIuranList.map(tipe => (
                      <SelectItem key={tipe.id} value={tipe.id}>
                        {tipe.nama} - {formatCurrency(tipe.nominal)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Select value={formData.bulan} onValueChange={(value) => setFormData({...formData, bulan: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Pilih Bulan --" />
                    </SelectTrigger>
                    <SelectContent>
                      {bulanOptions.map(bulan => (
                        <SelectItem key={bulan.value} value={bulan.value}>{bulan.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tahunPeriode">Tahun</Label>
                  <Select value={formData.tahun} onValueChange={(value) => setFormData({...formData, tahun: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Transaksi Hari Ini</p>
              <p className="text-2xl font-bold">{stats.todayCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Nominal Hari Ini</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.todayTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Transaksi Periode</p>
              <p className="text-2xl font-bold">{stats.monthCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Periode</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.monthTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Bulan</SelectItem>
              {bulanOptions.map(bulan => (
                <SelectItem key={bulan.value} value={bulan.value}>{bulan.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {filteredTransaksi.length > 0 ? (
              filteredTransaksi.map((transaksi) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Tidak ada transaksi ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
