import { useState, useEffect } from "react"
import { Plus, Search, Calendar as CalendarIcon, Users, CreditCard, TrendingUp, Filter, Trash2, Upload, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useFormValidation, iuranFormSchema } from "@/hooks/useFormValidation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useUserRole } from "@/hooks/useUserRole"
import { supabase } from "@/integrations/supabase/client"
import { ImageZoom } from "@/components/ui/image-zoom"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
}

interface Iuran {
  id: string
  warga: { nama_suami: string; nama_istri: string; blok_rumah: string }
  tipe_iuran: { nama: string }
  nominal: number
  tanggal_bayar: string
  bulan: string | number,
  tahun: number
  status_verifikasi: string
  bukti_transfer_url?: string
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
  const [uploadingFile, setUploadingFile] = useState(false)
  const [buktiTransferUrl, setBuktiTransferUrl] = useState("")
  const [processedIuranList, setProcessedIuranList] = useState<Iuran[]>([])
  const [processedFilteredIuran, setProcessedFilteredIuran] = useState<Iuran[]>([])
  const { toast } = useToast()
  const { fetchWarga, fetchTipeIuran, fetchIuran, addIuran, deleteIuran } = useSupabaseData()
  const { isAdmin } = useUserRole()

  const form = useFormValidation(iuranFormSchema, {
    warga_id: "",
    tipe_iuran_id: "",
    nominal: "",
    tanggal_bayar: "",
    bulan: (new Date().getMonth() + 1).toString(),
    tahun: new Date().getFullYear(),
    keterangan: ""
  })

  // Function to generate signed URLs for private bucket images
  const generateSignedUrl = async (filePath: string): Promise<string> => {
    if (!filePath) return ""
    
    try {
      // Extract path from full URL if needed
      const pathOnly = filePath.includes('bukti_transfer_input_kas/') 
        ? filePath.split('bukti_transfer_input_kas/')[1] 
          ? `bukti_transfer_input_kas/${filePath.split('bukti_transfer_input_kas/')[1]}`
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
      
      // Process iuran data to generate signed URLs for private images
      const processedData = await Promise.all(
        iuranData.map(async (item: any) => {
          if (item.bukti_transfer_url && item.bukti_transfer_url.includes('images-private')) {
            // Extract the file path from the URL
            const urlParts = item.bukti_transfer_url.split('bukti_transfer_input_kas/')
            if (urlParts.length > 1) {
              const fileName = urlParts[1].split('?')[0] // Remove any query parameters
              const signedUrl = await generateSignedUrl(`bukti_transfer_input_kas/${fileName}`)
              return { ...item, bukti_transfer_url: signedUrl }
            }
          }
          return item
        })
      )
      
      setIuranList(processedData)
      setProcessedIuranList(processedData)
      setFilteredIuran(processedData)
      setProcessedFilteredIuran(processedData)
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

  // Apply filters with processed data
  useEffect(() => {
    let filtered = processedIuranList

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.warga?.nama_suami.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipe_iuran?.nama.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterMonth && filterMonth !== "all") {
      filtered = filtered.filter(item => item.bulan === parseInt(filterMonth))
    }

    if (filterYear && filterYear !== "all") {
      filtered = filtered.filter(item => item.tahun === parseInt(filterYear))
    }

    if (filterTipeIuran && filterTipeIuran !== "all") {
      filtered = filtered.filter(item => item.tipe_iuran?.nama === filterTipeIuran)
    }

    setProcessedFilteredIuran(filtered)
    
  }, [processedIuranList, searchTerm, filterMonth, filterYear, filterTipeIuran])

  const handleFileUpload = async (file: File) => {
    if (!file) return ""

    try {
      setUploadingFile(true)
      const selectedTipeIuran = tipeIuranList.find(t => t.id === form.getValues("tipe_iuran_id"))
      const tipeIuranName = selectedTipeIuran?.nama || "unknown"
      const month = form.getValues("bulan")
      const year = form.getValues("tahun")
      const wargaId = form.getValues("warga_id")
      const selectedWarga = wargaList.find(w => w.id === wargaId)
      const namaSuami = selectedWarga?.nama_suami || ""
      const namaIstri = selectedWarga?.nama_istri || ""
      const wargaName = [namaSuami, namaIstri].filter(Boolean).join("_") || "unknown"
      
      const fileExtension = file.name.split('.').pop()
      const fileName = `bukti_transfer_${tipeIuranName}_${wargaName}_${month}_${year}.${fileExtension}`
      const filePath = `bukti_transfer_input_kas/${fileName}`

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

  const handleTipeIuranChange = (value: string) => {
    form.setValue("tipe_iuran_id", value)
    const selectedTipe = tipeIuranList.find(t => t.id === value)
    if (selectedTipe) {
      form.setValue("nominal", selectedTipe.nominal.toString())
    }
  }

  const handleNominalKeyDown = (e: React.KeyboardEvent) => {
    // Allow only numbers, backspace, delete, tab, escape, enter, arrow keys
    if (!/[0-9]/.test(e.key) && 
        !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteIuran(id)
      await loadData()
      toast({ title: "Berhasil", description: "Iuran berhasil dihapus" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menghapus Iuran",
        variant: "destructive" 
      })
    }
  }

  const onSubmit = async (data: any) => {
    try {
      await addIuran({
        warga_id: data.warga_id,
        tipe_iuran_id: data.tipe_iuran_id,
        nominal: parseInt(data.nominal),
        tanggal_bayar: data.tanggal_bayar,
        bulan: data.bulan,
        tahun: data.tahun,
        keterangan: data.keterangan,
        bukti_transfer_url: buktiTransferUrl
      })

      form.reset({
        warga_id: "",
        tipe_iuran_id: "",
        nominal: "",
        tanggal_bayar: "",
        bulan: data.bulan,
        tahun: new Date().getFullYear(),
        keterangan: ""
      })
      setBuktiTransferUrl("")
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

  const getWargaDisplayName = (nama_suami: string, nama_istri: string) => {
    const names = []
    if (nama_suami) names.push(nama_suami)
    if (nama_istri) names.push(nama_istri)
    return names.length > 0 ? names.join(' & ') : 'Tidak ada nama'
  }

  // Calculate statistics using processed data
  const totalTransaksiFiltered = processedFilteredIuran.length
  const totalNominalFiltered = processedFilteredIuran.reduce((sum, item) => sum + item.nominal, 0)
  
  const selectedTipeIuranName = filterTipeIuran && filterTipeIuran !== "all" ? filterTipeIuran : "Semua Jenis"
  const selectedMonthName = filterMonth && filterMonth !== "all" ? months.find(m => m.value === filterMonth)?.label : "Semua Bulan"
  const selectedYearName = filterYear && filterYear !== "all" ? filterYear : "Semua Tahun"

  // Calculate totals for selected type across all periods using processed data
  const totalTransaksiTipe = filterTipeIuran && filterTipeIuran !== "all"
    ? processedIuranList.filter(item => item.tipe_iuran?.nama === filterTipeIuran).length
    : processedIuranList.length
  
  const totalNominalTipe = filterTipeIuran && filterTipeIuran !== "all"
    ? processedIuranList.filter(item => item.tipe_iuran?.nama === filterTipeIuran).reduce((sum, item) => sum + item.nominal, 0)
    : processedIuranList.reduce((sum, item) => sum + item.nominal, 0)

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
              <DialogTitle>Tambah Pembayaran Iuran</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="warga_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warga</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Warga --" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wargaList.map(warga => (
                              <SelectItem key={warga.id} value={warga.id}>
                                {getWargaDisplayName(warga.nama_suami, warga.nama_istri)} - {warga.blok_rumah}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipe_iuran_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe Iuran</FormLabel>
                        <Select value={field.value} onValueChange={handleTipeIuranChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Tipe Iuran --" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tipeIuranList.map(tipe => (
                              <SelectItem key={tipe.id} value={tipe.id}>
                                {tipe.nama} - {formatCurrency(tipe.nominal)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bulan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bulan</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Bulan --" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map(month => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nominal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominal (Rp)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            onKeyDown={handleNominalKeyDown}
                            placeholder="150000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tanggal_bayar"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Bayar</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "dd/MM/yyyy")
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                        disabled={uploadingFile || !form.getValues("tipe_iuran_id")}
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
                      <p className="text-xs text-gray-500 mt-1">Format: .jpg, .jpeg, .png, .gif, .pdf (Max 5MB)</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keterangan</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Keterangan tambahan (opsional)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </form>
              </Form>
            </ScrollArea>
            <div className="mt-4">
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                className="w-full" 
                disabled={uploadingFile}
              >
                {uploadingFile ? "Mengupload..." : "Simpan Iuran"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
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
            <CalendarIcon className="h-8 w-8 text-blue-600" />
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
              <TableHead>Blok Rumah</TableHead>
              <TableHead>Tipe Iuran</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Tanggal Bayar</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bukti Transfer</TableHead>
              {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedFilteredIuran.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{getWargaDisplayName(item.warga?.nama_suami, item.warga?.nama_istri)}</TableCell>
                <TableCell>{item.warga?.blok_rumah}</TableCell>
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
                <TableCell>
                  {item.bukti_transfer_url ? (
                    <ImageZoom 
                      src={item.bukti_transfer_url} 
                      alt="Bukti Transfer"
                      thumbnailClassName="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Tidak ada</span>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
