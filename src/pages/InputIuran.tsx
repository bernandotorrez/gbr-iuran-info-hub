import { useState, useEffect } from "react"
import { Plus, Search, Calendar, TrendingUp, FileText, Download, Filter, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useAuth } from "@/contexts/AuthContext"
import { useUserRole } from "@/hooks/useUserRole"
import { supabase } from "@/integrations/supabase/client"
import { ImageZoom } from "@/components/ui/image-zoom"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Transaction {
  id: string
  warga: { nama_suami: string; nama_istri: string; blok_rumah: string }
  tipe_iuran: { nama: string }
  nominal: number
  tanggal_bayar: string
  status_verifikasi: string
  keterangan?: string
  bukti_transfer_url?: string
}

interface Warga {
  id: string
  blok_rumah: string
  nama_suami?: string
  nama_istri?: string
  nomor_hp_suami?: string
  nomor_hp_istri?: string
  status_tinggal: 'Sudah' | 'Kadang-Kadang' | 'Belum'
  created_at: string
  updated_at: string
}

interface TipeIuran {
  id: string
  nama: string
  nominal: number
  deskripsi?: string
  status_aktif: boolean
}

export default function InputIuran() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [tipeIuranList, setTipeIuranList] = useState<TipeIuran[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tipeIuranFilter, setTipeIuranFilter] = useState<string>("semua")
  const [uploadingFile, setUploadingFile] = useState(false)
  const { toast } = useToast()
  const { session } = useAuth()
  const { fetchIuran, addIuran, deleteIuran, fetchWarga, fetchTipeIuran, fetchDashboardStats } = useSupabaseData()
  const { isAdmin } = useUserRole()

  const [formData, setFormData] = useState({
    warga_id: "",
    tipe_iuran_id: "",
    nominal: "",
    tanggal_bayar: new Date().toISOString().split('T')[0],
    keterangan: "",
    bukti_transfer_url: ""
  })

  const [formErrors, setFormErrors] = useState({
    warga_id: "",
    tipe_iuran_id: "",
    nominal: "",
    tanggal_bayar: "",
    keterangan: "",
    bukti_transfer_url: ""
  })

  useEffect(() => {
    loadTransactions()
    loadWarga()
    loadTipeIuran()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await fetchIuran()
      const processedData: Transaction[] = data.map((item: any) => ({
        id: item.id,
        warga: item.warga,
        tipe_iuran: item.tipe_iuran,
        nominal: item.nominal,
        tanggal_bayar: item.tanggal_bayar,
        status_verifikasi: item.status_verifikasi,
        keterangan: item.keterangan,
        bukti_transfer_url: item.bukti_transfer_url
      }))
      setTransactions(processedData)
      await fetchDashboardStats()
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat data iuran",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const loadWarga = async () => {
    try {
      const data = await fetchWarga()
      setWargaList(data)
    } catch (error) {
      console.error('Error loading warga:', error)
    }
  }

  const loadTipeIuran = async () => {
    try {
      const data = await fetchTipeIuran()
      setTipeIuranList(data)
    } catch (error) {
      console.error('Error loading tipe iuran:', error)
    }
  }

  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        getWargaDisplayName(transaction.warga).toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tipe_iuran.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.warga.blok_rumah.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (tipeIuranFilter !== "semua") {
      filtered = filtered.filter(transaction => transaction.tipe_iuran.nama === tipeIuranFilter)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, tipeIuranFilter])

  const handleFileUpload = async (file: File) => {
    if (!file) return ""

    try {
      setUploadingFile(true)
      const currentDate = new Date()
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const fileExtension = file.name.split('.').pop()
      const fileName = `bukti_transfer_${month}_${year}_${Date.now()}.${fileExtension}`
      const filePath = `bukti_transfer_input_iuran/${fileName}`

      const { data, error } = await supabase.storage
        .from('images_private')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images_private')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Error",
        description: "Gagal mengupload file bukti transfer",
        variant: "destructive"
      })
      return ""
    } finally {
      setUploadingFile(false)
    }
  }

  const getWargaDisplayName = (warga: { nama_suami?: string; nama_istri?: string; blok_rumah: string }) => {
    const names = []
    if (!warga) return '-'
    if (warga.nama_suami) names.push(warga.nama_suami)
    if (warga.nama_istri) names.push(warga.nama_istri)
    return names.length > 0 ? names.join(' & ') : 'Tidak ada nama'
  }

  const validateForm = () => {
    const errors = {
      warga_id: "",
      tipe_iuran_id: "",
      nominal: "",
      tanggal_bayar: "",
      keterangan: "",
      bukti_transfer_url: ""
    }

    let isValid = true

    if (!formData.warga_id) {
      errors.warga_id = "Warga wajib dipilih"
      isValid = false
    }

    if (!formData.tipe_iuran_id) {
      errors.tipe_iuran_id = "Tipe iuran wajib dipilih"
      isValid = false
    }

    if (!formData.nominal || parseInt(formData.nominal) <= 0) {
      errors.nominal = "Nominal harus lebih dari 0"
      isValid = false
    }

    if (!formData.tanggal_bayar) {
      errors.tanggal_bayar = "Tanggal bayar wajib diisi"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleAdd = async () => {
    if (!validateForm()) {
      toast({ 
        title: "Error", 
        description: "Periksa kembali form yang diisi",
        variant: "destructive" 
      })
      return
    }

    try {
      const selectedTipeIuran = tipeIuranList.find(t => t.id === formData.tipe_iuran_id)
      const tanggalBayar = new Date(formData.tanggal_bayar)
      
      await addIuran({
        warga_id: formData.warga_id,
        tipe_iuran_id: formData.tipe_iuran_id,
        nominal: parseInt(formData.nominal),
        tanggal_bayar: formData.tanggal_bayar,
        bulan: tanggalBayar.getMonth() + 1,
        tahun: tanggalBayar.getFullYear(),
        keterangan: formData.keterangan,
        bukti_transfer_url: formData.bukti_transfer_url
      })

      setFormData({ 
        warga_id: "", 
        tipe_iuran_id: "", 
        nominal: "", 
        tanggal_bayar: new Date().toISOString().split('T')[0], 
        keterangan: "",
        bukti_transfer_url: ""
      })
      setFormErrors({
        warga_id: "",
        tipe_iuran_id: "",
        nominal: "",
        tanggal_bayar: "",
        keterangan: "",
        bukti_transfer_url: ""
      })
      setIsAddOpen(false)
      await loadTransactions()
      toast({ title: "Berhasil", description: "Iuran berhasil dicatat" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal mencatat iuran",
        variant: "destructive" 
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteIuran(id)
      await loadTransactions()
      toast({ title: "Berhasil", description: "Data iuran berhasil dihapus" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menghapus data iuran",
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

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Input Iuran', 14, 22)
    
    const tableData = filteredTransactions.map(transaction => [
      getWargaDisplayName(transaction.warga),
      transaction.warga.blok_rumah,
      transaction.tipe_iuran.nama,
      formatCurrency(transaction.nominal),
      new Date(transaction.tanggal_bayar).toLocaleDateString('id-ID'),
      transaction.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'
    ])

    autoTable(doc, {
      head: [['Warga', 'Alamat', 'Jenis Iuran', 'Nominal', 'Tanggal', 'Status']],
      body: tableData,
      startY: 30,
    })

    doc.save('input-iuran.pdf')
    toast({ title: "Berhasil", description: "Laporan PDF berhasil diunduh" })
  }

  const exportToExcel = () => {
    const data = filteredTransactions.map(transaction => ({
      Warga: getWargaDisplayName(transaction.warga),
      Alamat: transaction.warga.blok_rumah,
      'Jenis Iuran': transaction.tipe_iuran.nama,
      Nominal: transaction.nominal,
      Tanggal: new Date(transaction.tanggal_bayar).toLocaleDateString('id-ID'),
      Status: transaction.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Input Iuran')
    XLSX.writeFile(wb, 'input-iuran.xlsx')
    toast({ title: "Berhasil", description: "Laporan Excel berhasil diunduh" })
  }

  const totalTransaksi = filteredTransactions.length
  const totalNominal = filteredTransactions.reduce((sum, transaction) => sum + transaction.nominal, 0)
  const totalVerified = filteredTransactions.filter(t => t.status_verifikasi === 'verified').length

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
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          {isAdmin && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Iuran
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Tambah Data Iuran</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="warga">Warga *</Label>
                      <select
                        id="warga"
                        value={formData.warga_id}
                        onChange={(e) => setFormData({...formData, warga_id: e.target.value})}
                        className={`w-full p-2 border rounded-md ${formErrors.warga_id ? "border-red-500" : ""}`}
                      >
                        <option value="">-- Pilih Warga --</option>
                        {wargaList.map(warga => (
                          <option key={warga.id} value={warga.id}>
                            {getWargaDisplayName(warga)} - {warga.blok_rumah}
                          </option>
                        ))}
                      </select>
                      {formErrors.warga_id && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.warga_id}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="tipe_iuran">Tipe Iuran *</Label>
                      <select
                        id="tipe_iuran"
                        value={formData.tipe_iuran_id}
                        onChange={(e) => {
                          const selectedTipe = tipeIuranList.find(t => t.id === e.target.value)
                          setFormData({
                            ...formData, 
                            tipe_iuran_id: e.target.value,
                            nominal: selectedTipe ? selectedTipe.nominal.toString() : ""
                          })
                        }}
                        className={`w-full p-2 border rounded-md ${formErrors.tipe_iuran_id ? "border-red-500" : ""}`}
                      >
                        <option value="">-- Pilih Tipe Iuran --</option>
                        {tipeIuranList.map(tipe => (
                          <option key={tipe.id} value={tipe.id}>
                            {tipe.nama} ({formatCurrency(tipe.nominal)})
                          </option>
                        ))}
                      </select>
                      {formErrors.tipe_iuran_id && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.tipe_iuran_id}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="nominal">Nominal (Rp) *</Label>
                      <Input
                        id="nominal"
                        value={formData.nominal}
                        onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                        placeholder="Nominal akan terisi otomatis"
                        className={formErrors.nominal ? "border-red-500" : ""}
                      />
                      {formErrors.nominal && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.nominal}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="tanggal_bayar">Tanggal Bayar *</Label>
                      <Input
                        id="tanggal_bayar"
                        type="date"
                        value={formData.tanggal_bayar}
                        onChange={(e) => setFormData({...formData, tanggal_bayar: e.target.value})}
                        className={formErrors.tanggal_bayar ? "border-red-500" : ""}
                      />
                      {formErrors.tanggal_bayar && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.tanggal_bayar}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="bukti_upload">Upload Bukti Transfer</Label>
                      <div className="mt-2">
                        <Input
                          id="bukti_upload"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const uploadedUrl = await handleFileUpload(file)
                              if (uploadedUrl) {
                                setFormData({...formData, bukti_transfer_url: uploadedUrl})
                              }
                            }
                          }}
                          disabled={uploadingFile}
                          className="cursor-pointer"
                        />
                        {uploadingFile && (
                          <div className="flex items-center mt-2 text-sm text-blue-600">
                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                            Mengupload file...
                          </div>
                        )}
                        {formData.bukti_transfer_url && (
                          <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded border">
                            <span className="text-sm text-green-700">File berhasil diupload</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData({...formData, bukti_transfer_url: ""})}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Format: .jpg, .jpeg, .png, .gif, .pdf (Max 5MB)</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bukti">Bukti Transfer (URL)</Label>
                      <Input
                        id="bukti"
                        value={formData.bukti_transfer_url}
                        onChange={(e) => setFormData({...formData, bukti_transfer_url: e.target.value})}
                        placeholder="https://example.com/bukti.jpg atau upload file di atas"
                        className={formErrors.bukti_transfer_url ? "border-red-500" : ""}
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: .jpg, .jpeg, .png, .gif, .pdf</p>
                      {formErrors.bukti_transfer_url && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.bukti_transfer_url}</p>
                      )}
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
                  </div>
                </ScrollArea>
                <div className="mt-4">
                  <Button onClick={handleAdd} className="w-full" disabled={uploadingFile}>
                    {uploadingFile ? "Mengupload..." : "Simpan Iuran"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
              <p className="text-2xl font-bold">{totalTransaksi}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Nominal</p>
              <p className="text-2xl font-bold">{formatCurrency(totalNominal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Terverifikasi</p>
              <p className="text-2xl font-bold">{totalVerified}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari warga, jenis iuran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={tipeIuranFilter} onValueChange={setTipeIuranFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Tipe Iuran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Tipe Iuran</SelectItem>
              {tipeIuranList.map(tipe => (
                <SelectItem key={tipe.id} value={tipe.nama}>{tipe.nama}</SelectItem>
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
              <TableHead>Tanggal Bayar</TableHead>
              <TableHead>Bukti Transfer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
              {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{getWargaDisplayName(transaction.warga)}</TableCell>
                <TableCell>{transaction.warga.blok_rumah}</TableCell>
                <TableCell>{transaction.tipe_iuran.nama}</TableCell>
                <TableCell>{formatCurrency(transaction.nominal)}</TableCell>
                <TableCell>{new Date(transaction.tanggal_bayar).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>
                  {transaction.bukti_transfer_url ? (
                    <ImageZoom 
                      src={transaction.bukti_transfer_url} 
                      alt="Bukti Transfer"
                      thumbnailClassName="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 border"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Tidak ada bukti</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.status_verifikasi === 'verified' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transaction.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'}
                  </span>
                </TableCell>
                <TableCell>{transaction.keterangan || '-'}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Hapus
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
