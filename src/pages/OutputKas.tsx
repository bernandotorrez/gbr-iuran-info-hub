import { useState, useEffect } from "react"
import { Plus, Search, TrendingDown, Calendar, FileText, Download, Filter, Upload, X, Eye } from "lucide-react"
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
import { useKategoriKas } from "@/hooks/useKategoriKas"
import { useUserRole } from "@/hooks/useUserRole"
import { supabase } from "@/integrations/supabase/client"
import { ImageZoom } from "@/components/ui/image-zoom"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Pengeluaran {
  id: string
  tanggal_keluar: string
  kategori: string
  deskripsi: string
  judul: string
  nominal: number
  status_persetujuan: string
  bukti_transaksi_url?: string
  bukti_transfer_url?: string
  created_at: string
  updated_at?: string
  tipe_iuran: string
  diinput_oleh?: any,
  disetujui_oleh?: any
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

export default function OutputKas() {
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([])
  const [filteredPengeluaran, setFilteredPengeluaran] = useState<Pengeluaran[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tipeIuranFilter, setTipeIuranFilter] = useState<string>("semua")
  const [uploadingFile, setUploadingFile] = useState(false)
  const [buktiTransferUrl, setBuktiTransferUrl] = useState("")
  const [processedPengeluaranList, setProcessedPengeluaranList] = useState<Pengeluaran[]>([])
  const { toast } = useToast()
  const { session } = useAuth()
  const { fetchKasKeluar, addKasKeluar, updateKasKeluarStatus, dashboardStats, fetchDashboardStats, fetchTipeIuran } = useSupabaseData()
  const { kategoriList, loading: kategoriLoading } = useKategoriKas()
  const { isAdmin } = useUserRole()
  const [tipeIuranList, setTipeIuranList] = useState<any[]>([])

  const [formData, setFormData] = useState({
    tanggal_keluar: "",
    kategori: "",
    judul: "",
    deskripsi: "",
    nominal: "",
    bukti_transaksi_url: "",
    bukti_transfer_url: "",
    tipe_iuran: ""
  })

  const [formErrors, setFormErrors] = useState({
    tanggal_keluar: "",
    kategori: "",
    judul: "",
    deskripsi: "",
    nominal: "",
    bukti_transaksi_url: "",
    bukti_transfer_url: "",
    tipe_iuran: ""
  })

  // Function to generate signed URLs for private bucket images
  const generateSignedUrl = async (filePath: string): Promise<string> => {
    if (!filePath) return ""
    
    try {
      // Extract path from full URL if needed
      const pathOnly = filePath.includes('bukti_transfer_output_kas/') 
        ? filePath.split('bukti_transfer_output_kas/')[1] 
          ? `bukti_transfer_output_kas/${filePath.split('bukti_transfer_output_kas/')[1]}`
          : filePath
        : filePath

      const { data, error } = await supabase.storage
        .from('images-private')
        .createSignedUrl(pathOnly, 3600) // 1 hour expiry

      if (error) {
        console.error('Error generating signed URL:', error)
        return ""
      }

      return data.signedUrl
    } catch (error) {
      console.error('Error generating signed URL:', error)
      return ""
    }
  }

  const loadKasKeluar = async () => {
    try {
      setLoading(true)
      const data = await fetchKasKeluar()
      
      // Process data to generate signed URLs for private images
      const processedData = await Promise.all(
        data.map(async (item: any) => {
          if (item.bukti_transfer_url && item.bukti_transfer_url.includes('images-private')) {
            // Extract the file path from the URL
            const urlParts = item.bukti_transfer_url.split('bukti_transfer_output_kas/')
            if (urlParts.length > 1) {
              const fileName = urlParts[1].split('?')[0] // Remove any query parameters
              const signedUrl = await generateSignedUrl(`bukti_transfer_output_kas/${fileName}`)
              return { ...item, bukti_transfer_url: signedUrl }
            }
          }
          return item
        })
      )
      
      setPengeluaranList(processedData)
      setProcessedPengeluaranList(processedData)
      await fetchDashboardStats()
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

  const loadTipeIuran = async () => {
    try {
      const data = await fetchTipeIuran()
      setTipeIuranList(data)
    } catch (error) {
      console.error('Error loading tipe iuran:', error)
    }
  }

  useEffect(() => {
    loadKasKeluar()
    loadTipeIuran()
  }, [])

  useEffect(() => {
    let filtered = processedPengeluaranList

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.judul.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by tipe iuran
    if (tipeIuranFilter !== "semua") {
      filtered = filtered.filter(item => item.tipe_iuran === tipeIuranFilter)
    }

    setFilteredPengeluaran(filtered)
  }, [processedPengeluaranList, searchTerm, tipeIuranFilter])

  const handleFileUpload = async (file: File) => {
    if (!file) return ""

    try {
      setUploadingFile(true)
      const selectedTipeIuran = formData.tipe_iuran || "unknown"
      const currentDate = new Date()
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const fileExtension = file.name.split('.').pop()
      const fileName = `bukti_transfer_${selectedTipeIuran}_${month}_${year}_output.${fileExtension}`
      const filePath = `bukti_transfer_output_kas/${fileName}`

      const { data, error } = await supabase.storage
        .from('images-private')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        throw error
      }

      // Generate signed URL for private bucket (expires in 1 hour)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('images-private')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (signedUrlError) {
        throw signedUrlError
      }

      return signedUrlData.signedUrl
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

  const handleNominalKeyDown = (e: React.KeyboardEvent) => {
    if (!/[0-9]/.test(e.key) && 
        !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
    }
  }

  const getWargaDisplayName = (warga: Warga) => {
    const names = []
    if (!warga) return '-'
    if (warga.nama_suami) names.push(warga.nama_suami)
    if (warga.nama_istri) names.push(warga.nama_istri)
    return names.length > 0 ? names.join(' & ') : 'Tidak ada nama'
  }

  const validateForm = () => {
    const errors = {
      tanggal_keluar: "",
      kategori: "",
      judul: "",
      deskripsi: "",
      nominal: "",
      bukti_transaksi_url: "",
      bukti_transfer_url: "",
      tipe_iuran: ""
    }

    let isValid = true

    if (!formData.tanggal_keluar) {
      errors.tanggal_keluar = "Tanggal wajib diisi"
      isValid = false
    }

    if (!formData.kategori) {
      errors.kategori = "Kategori wajib dipilih"
      isValid = false
    }

    if (!formData.tipe_iuran) {
      errors.tipe_iuran = "Tipe iuran wajib dipilih"
      isValid = false
    }

    if (!formData.judul || formData.judul.length < 5) {
      errors.judul = "Judul wajib diisi minimal 5 karakter"
      isValid = false
    }

    if (!formData.deskripsi || formData.deskripsi.length < 5) {
      errors.deskripsi = "Deskripsi wajib diisi minimal 5 karakter"
      isValid = false
    }

    if (!formData.nominal || parseInt(formData.nominal) <= 0) {
      errors.nominal = "Nominal harus lebih dari 0"
      isValid = false
    }

    const nominalValue = parseInt(formData.nominal)
    if (nominalValue > dashboardStats.saldo_kas) {
      errors.nominal = "Saldo Kas Tidak Mencukupi"
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
      await addKasKeluar({
        tanggal_keluar: formData.tanggal_keluar,
        kategori: formData.kategori,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        nominal: parseInt(formData.nominal),
        bukti_transaksi_url: formData.bukti_transaksi_url,
        bukti_transfer_url: buktiTransferUrl,
        tipe_iuran: formData.tipe_iuran
      })

      setFormData({ 
        tanggal_keluar: "", 
        kategori: "", 
        judul: "",
        deskripsi: "", 
        nominal: "", 
        bukti_transaksi_url: "",
        bukti_transfer_url: "",
        tipe_iuran: ""
      })
      setFormErrors({
        tanggal_keluar: "",
        kategori: "",
        judul: "",
        deskripsi: "",
        nominal: "",
        bukti_transaksi_url: "",
        bukti_transfer_url: "",
        tipe_iuran: ""
      })
      setBuktiTransferUrl("")
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

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Output Kas', 14, 22)
    
    const tableData = filteredPengeluaran.map(item => [
      new Date(item.tanggal_keluar).toLocaleDateString('id-ID'),
      item.kategori,
      item.tipe_iuran,
      item.judul,
      item.deskripsi,
      formatCurrency(item.nominal),
      item.status_persetujuan === 'approved' ? 'Disetujui' : 
       item.status_persetujuan === 'pending' ? 'Pending' : 'Ditolak'
    ])

    autoTable(doc, {
      head: [['Tanggal', 'Kategori', 'Tipe Iuran', 'Judul', 'Deskripsi', 'Nominal', 'Status']],
      body: tableData,
      startY: 30,
    })

    doc.save('output-kas.pdf')
    toast({ title: "Berhasil", description: "Laporan PDF berhasil diunduh" })
  }

  const exportToExcel = () => {
    const data = filteredPengeluaran.map(item => ({
      Tanggal: new Date(item.tanggal_keluar).toLocaleDateString('id-ID'),
      Kategori: item.kategori,
      'Tipe Iuran': item.tipe_iuran,
      Judul: item.judul,
      Deskripsi: item.deskripsi,
      Nominal: item.nominal,
      Status: item.status_persetujuan === 'approved' ? 'Disetujui' : 
              item.status_persetujuan === 'pending' ? 'Pending' : 'Ditolak'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Output Kas')
    XLSX.writeFile(wb, 'output-kas.xlsx')
    toast({ title: "Berhasil", description: "Laporan Excel berhasil diunduh" })
  }

  const totalPengeluaran = filteredPengeluaran
    .filter(item => item.status_persetujuan === "approved")
    .reduce((sum, item) => sum + item.nominal, 0)

  const totalPending = filteredPengeluaran
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
                  Tambah Pengeluaran
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Tambah Pengeluaran Kas</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Saldo Kas Tersedia: {formatCurrency(dashboardStats.saldo_kas)}
                  </p>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tanggal">Tanggal *</Label>
                      <Input
                        id="tanggal"
                        type="date"
                        value={formData.tanggal_keluar}
                        onChange={(e) => setFormData({...formData, tanggal_keluar: e.target.value})}
                        className={formErrors.tanggal_keluar ? "border-red-500" : ""}
                      />
                      {formErrors.tanggal_keluar && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.tanggal_keluar}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="tipe_iuran">Tipe Iuran *</Label>
                      <Select value={formData.tipe_iuran} onValueChange={(value) => setFormData({...formData, tipe_iuran: value})}>
                        <SelectTrigger className={formErrors.tipe_iuran ? "border-red-500" : ""}>
                          <SelectValue placeholder="-- Pilih Tipe Iuran --" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipeIuranList.map(tipe => (
                            <SelectItem key={tipe.id} value={tipe.nama}>{tipe.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.tipe_iuran && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.tipe_iuran}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="kategori">Kategori *</Label>
                      <select
                        id="kategori"
                        value={formData.kategori}
                        onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                        className={`w-full p-2 border rounded-md ${formErrors.kategori ? "border-red-500" : ""}`}
                        disabled={kategoriLoading}
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {kategoriList.map(kategori => (
                          <option key={kategori.id} value={kategori.nama}>{kategori.nama}</option>
                        ))}
                      </select>
                      {formErrors.kategori && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.kategori}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="judul">Judul *</Label>
                      <Input
                        id="judul"
                        value={formData.judul}
                        onChange={(e) => setFormData({...formData, judul: e.target.value})}
                        placeholder="Judul pengeluaran"
                        className={formErrors.judul ? "border-red-500" : ""}
                      />
                      {formErrors.judul && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.judul}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="deskripsi">Deskripsi *</Label>
                      <Input
                        id="deskripsi"
                        value={formData.deskripsi}
                        onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                        placeholder="Deskripsi pengeluaran"
                        className={formErrors.deskripsi ? "border-red-500" : ""}
                      />
                      {formErrors.deskripsi && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.deskripsi}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="nominal">Nominal (Rp) *</Label>
                      <Input
                        id="nominal"
                        type="text"
                        value={formData.nominal}
                        onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                        onKeyDown={handleNominalKeyDown}
                        placeholder="150000"
                        className={formErrors.nominal ? "border-red-500" : ""}
                      />
                      {formErrors.nominal && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.nominal}</p>
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
                                 setBuktiTransferUrl(uploadedUrl)
                               }
                             }
                           }}
                           disabled={uploadingFile || !formData.tipe_iuran}
                           className="cursor-pointer"
                         />
                         {uploadingFile && (
                           <div className="flex items-center mt-2 text-sm text-blue-600">
                             <Upload className="w-4 h-4 mr-2 animate-spin" />
                             Mengupload file...
                           </div>
                         )}
                         {buktiTransferUrl && (
                           <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded border">
                             <span className="text-sm text-green-700">File berhasil diupload</span>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => setBuktiTransferUrl("")}
                             >
                               <X className="w-4 h-4" />
                             </Button>
                           </div>
                         )}
                         <p className="text-xs text-gray-500 mt-1">Pilih tipe iuran terlebih dahulu. Format: .jpg, .jpeg, .png, .gif, .pdf (Max 5MB)</p>
                       </div>
                     </div>
                    <div>
                      <Label htmlFor="bukti">Bukti (URL)</Label>
                      <Input
                        id="bukti"
                        value={formData.bukti_transaksi_url}
                        onChange={(e) => setFormData({...formData, bukti_transaksi_url: e.target.value})}
                        placeholder="https://example.com/nota.jpg atau upload file di atas"
                        className={formErrors.bukti_transaksi_url ? "border-red-500" : ""}
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: .jpg, .jpeg, .png, .gif, .pdf</p>
                      {formErrors.bukti_transaksi_url && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.bukti_transaksi_url}</p>
                      )}
                    </div>
                  </div>
                </ScrollArea>
                <div className="mt-4">
                  <Button onClick={handleAdd} className="w-full" disabled={uploadingFile}>
                    {uploadingFile ? "Mengupload..." : "Simpan Pengeluaran"}
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
              <p className="text-2xl font-bold">{filteredPengeluaran.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pengeluaran..."
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
              <TableHead>Tanggal</TableHead>
              <TableHead>Tipe Iuran</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Bukti Transfer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Diinput Oleh</TableHead>
              <TableHead>Disetujui Oleh</TableHead>
              {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPengeluaran.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.tanggal_keluar).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{item.tipe_iuran}</TableCell>
                <TableCell>{item.kategori}</TableCell>
                <TableCell className="font-medium">{item.judul}</TableCell>
                <TableCell>{item.deskripsi}</TableCell>
                <TableCell>{formatCurrency(item.nominal)}</TableCell>
                <TableCell>
                  {item.bukti_transfer_url ? (
                    <ImageZoom 
                      src={item.bukti_transfer_url} 
                      alt="Bukti Transfer"
                      thumbnailClassName="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">Tidak ada</span>
                  )}
                </TableCell>
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
                <TableCell>{getWargaDisplayName(item.diinput_oleh)}</TableCell>
                <TableCell>{getWargaDisplayName(item.disetujui_oleh)}</TableCell>
                {isAdmin && (
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
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
