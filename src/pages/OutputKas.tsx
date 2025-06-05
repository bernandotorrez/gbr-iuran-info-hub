import { useState, useEffect } from "react"
import { Plus, Search, TrendingDown, Calendar, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useAuth } from "@/contexts/AuthContext"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

  const [formErrors, setFormErrors] = useState({
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

  const handleNominalKeyDown = (e: React.KeyboardEvent) => {
    // Allow only numbers, backspace, delete, tab, escape, enter
    if (!/[0-9]/.test(e.key) && 
        !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
    }
  }

  const validateForm = () => {
    const errors = {
      tanggal_keluar: "",
      kategori: "",
      judul: "",
      deskripsi: "",
      nominal: "",
      bukti_transaksi_url: ""
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

    if (formData.bukti_transaksi_url) {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
      const hasValidExtension = validExtensions.some(ext => 
        formData.bukti_transaksi_url.toLowerCase().endsWith(ext)
      )
      if (!hasValidExtension) {
        errors.bukti_transaksi_url = "File harus berupa gambar (.jpg, .jpeg, .png, .gif) atau PDF (.pdf)"
        isValid = false
      }
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
      setFormErrors({
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

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Output Kas', 14, 22)
    
    const tableData = filteredPengeluaran.map(item => [
      new Date(item.tanggal_keluar).toLocaleDateString('id-ID'),
      item.kategori,
      item.judul,
      item.deskripsi,
      formatCurrency(item.nominal),
      item.status_persetujuan === 'approved' ? 'Disetujui' : 
       item.status_persetujuan === 'pending' ? 'Pending' : 'Ditolak'
    ])

    ;(doc as any).autoTable({
      head: [['Tanggal', 'Kategori', 'Judul', 'Deskripsi', 'Nominal', 'Status']],
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
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
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
                  <Label htmlFor="kategori">Kategori *</Label>
                  <select
                    id="kategori"
                    value={formData.kategori}
                    onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                    className={`w-full p-2 border rounded-md ${formErrors.kategori ? "border-red-500" : ""}`}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {kategoriOptions.map(kategori => (
                      <option key={kategori} value={kategori}>{kategori}</option>
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
                  <Label htmlFor="bukti">Bukti (URL)</Label>
                  <Input
                    id="bukti"
                    value={formData.bukti_transaksi_url}
                    onChange={(e) => setFormData({...formData, bukti_transaksi_url: e.target.value})}
                    placeholder="https://example.com/nota.jpg"
                    className={formErrors.bukti_transaksi_url ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: .jpg, .jpeg, .png, .gif, .pdf</p>
                  {formErrors.bukti_transaksi_url && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.bukti_transaksi_url}</p>
                  )}
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Simpan Pengeluaran
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
