
import { useState, useEffect } from "react"
import { Plus, Search, Calendar, Users, CreditCard, TrendingUp, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"

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

interface Iuran {
  id: string
  warga: { nama: string; alamat: string; rt_rw: string }
  tipe_iuran: { nama: string }
  nominal: number
  tanggal_bayar: string
  bulan: number
  tahun: number
  status_verifikasi: string
}

const months = [
  { value: "1", label: "Januari" }, { value: "2", label: "Februari" }, 
  { value: "3", label: "Maret" }, { value: "4", label: "April" }, 
  { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
  { value: "7", label: "Juli" }, { value: "8", label: "Agustus" }, 
  { value: "9", label: "September" }, { value: "10", label: "Oktober" }, 
  { value: "11", label: "November" }, { value: "12", label: "Desember" }
]

const years = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - 5 + i
  return { value: year.toString(), label: year.toString() }
})

export default function InputIuran() {
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [tipeIuranList, setTipeIuranList] = useState<TipeIuran[]>([])
  const [iuranList, setIuranList] = useState<Iuran[]>([])
  const [filteredIuran, setFilteredIuran] = useState<Iuran[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filterMonth, setFilterMonth] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterTipeIuran, setFilterTipeIuran] = useState("")
  const { toast } = useToast()
  const { fetchWarga, fetchTipeIuran, fetchIuran, addIuran } = useSupabaseData()

  const [formData, setFormData] = useState({
    warga_id: "",
    tipe_iuran_id: "",
    nominal: "",
    tanggal_bayar: "",
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    keterangan: ""
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [wargaData, tipeIuranData, iuranData] = await Promise.all([
        fetchWarga(),
        fetchTipeIuran(),
        fetchIuran()
      ])
      
      setWargaList(wargaData)
      setTipeIuranList(tipeIuranData)
      setIuranList(iuranData)
      setFilteredIuran(iuranData)
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

  // Apply filters
  useEffect(() => {
    let filtered = iuranList

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.warga?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipe_iuran?.nama.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterMonth) {
      filtered = filtered.filter(item => item.bulan === parseInt(filterMonth))
    }

    if (filterYear) {
      filtered = filtered.filter(item => item.tahun === parseInt(filterYear))
    }

    if (filterTipeIuran) {
      filtered = filtered.filter(item => item.tipe_iuran?.nama === filterTipeIuran)
    }

    setFilteredIuran(filtered)
  }, [iuranList, searchTerm, filterMonth, filterYear, filterTipeIuran])

  const handleTipeIuranChange = (value: string) => {
    setFormData({...formData, tipe_iuran_id: value})
    const selectedTipe = tipeIuranList.find(t => t.id === value)
    if (selectedTipe) {
      setFormData(prev => ({...prev, tipe_iuran_id: value, nominal: selectedTipe.nominal.toString()}))
    }
  }

  const handleNominalKeyDown = (e: React.KeyboardEvent) => {
    // Allow only numbers, backspace, delete, tab, escape, enter
    if (!/[0-9]/.test(e.key) && 
        !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
    }
  }

  const validateForm = () => {
    if (!formData.warga_id) {
      toast({ title: "Error", description: "Pilih warga terlebih dahulu", variant: "destructive" })
      return false
    }
    if (!formData.tipe_iuran_id) {
      toast({ title: "Error", description: "Pilih tipe iuran terlebih dahulu", variant: "destructive" })
      return false
    }
    if (!formData.nominal || parseInt(formData.nominal) <= 0) {
      toast({ title: "Error", description: "Nominal harus lebih dari 0", variant: "destructive" })
      return false
    }
    if (!formData.tanggal_bayar) {
      toast({ title: "Error", description: "Tanggal bayar wajib diisi", variant: "destructive" })
      return false
    }
    return true
  }

  const handleAdd = async () => {
    if (!validateForm()) return

    try {
      await addIuran({
        warga_id: formData.warga_id,
        tipe_iuran_id: formData.tipe_iuran_id,
        nominal: parseInt(formData.nominal),
        tanggal_bayar: formData.tanggal_bayar,
        bulan: formData.bulan,
        tahun: formData.tahun,
        keterangan: formData.keterangan
      })

      setFormData({ 
        warga_id: "", 
        tipe_iuran_id: "", 
        nominal: "", 
        tanggal_bayar: "", 
        bulan: new Date().getMonth() + 1,
        tahun: new Date().getFullYear(),
        keterangan: ""
      })
      setIsAddOpen(false)
      await loadData()
      toast({ title: "Berhasil", description: "Iuran berhasil dicatat" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal mencatat iuran",
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

  // Calculate statistics
  const totalTransaksiFiltered = filteredIuran.length
  const totalNominalFiltered = filteredIuran.reduce((sum, item) => sum + item.nominal, 0)
  
  const selectedTipeIuranName = filterTipeIuran || "Semua Jenis"
  const selectedMonthName = filterMonth ? months.find(m => m.value === filterMonth)?.label : "Semua Bulan"
  const selectedYearName = filterYear || "Semua Tahun"

  // Calculate totals for selected type across all periods
  const totalTransaksiTipe = filterTipeIuran 
    ? iuranList.filter(item => item.tipe_iuran?.nama === filterTipeIuran).length
    : iuranList.length
  
  const totalNominalTipe = filterTipeIuran
    ? iuranList.filter(item => item.tipe_iuran?.nama === filterTipeIuran).reduce((sum, item) => sum + item.nominal, 0)
    : iuranList.reduce((sum, item) => sum + item.nominal, 0)

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Input Iuran</h1>
          <p className="text-muted-foreground">Kelola pembayaran iuran warga</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Iuran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Pembayaran Iuran</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="warga">Warga</Label>
                <Select value={formData.warga_id} onValueChange={(value) => setFormData({...formData, warga_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Warga --" />
                  </SelectTrigger>
                  <SelectContent>
                    {wargaList.map(warga => (
                      <SelectItem key={warga.id} value={warga.id}>
                        {warga.nama} - {warga.rt_rw}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipe_iuran">Tipe Iuran</Label>
                <Select value={formData.tipe_iuran_id} onValueChange={handleTipeIuranChange}>
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
                <Label htmlFor="nominal">Nominal (Rp)</Label>
                <Input
                  id="nominal"
                  type="text"
                  value={formData.nominal}
                  onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                  onKeyDown={handleNominalKeyDown}
                  placeholder="150000"
                />
              </div>
              <div>
                <Label htmlFor="tanggal">Tanggal Bayar</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal_bayar}
                  onChange={(e) => setFormData({...formData, tanggal_bayar: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Input
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  placeholder="Keterangan tambahan (opsional)"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Simpan Iuran
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Bulan:</label>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Semua Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Tahun:</label>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tahun</SelectItem>
              {years.map(year => (
                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Jenis Iuran:</label>
          <Select value={filterTipeIuran} onValueChange={setFilterTipeIuran}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              {Array.from(new Set(tipeIuranList.map(t => t.nama))).map(nama => (
                <SelectItem key={nama} value={nama}>{nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Total Transaksi {selectedMonthName} {selectedYearName}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                dari {selectedTipeIuranName}
              </p>
              <p className="text-2xl font-bold">{totalTransaksiFiltered}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Total Nominal {selectedMonthName} {selectedYearName}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                dari {selectedTipeIuranName}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(totalNominalFiltered)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Total Transaksi Keseluruhan
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                dari {selectedTipeIuranName}
              </p>
              <p className="text-2xl font-bold">{totalTransaksiTipe}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Total Nominal Keseluruhan
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                dari {selectedTipeIuranName}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(totalNominalTipe)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari warga atau tipe iuran..."
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
              <TableHead>Tipe Iuran</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Tanggal Bayar</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIuran.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.warga?.nama}</TableCell>
                <TableCell>{item.warga?.alamat}</TableCell>
                <TableCell>{item.tipe_iuran?.nama}</TableCell>
                <TableCell>{formatCurrency(item.nominal)}</TableCell>
                <TableCell>{new Date(item.tanggal_bayar).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{months.find(m => m.value === item.bulan.toString())?.label} {item.tahun}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status_verifikasi === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
