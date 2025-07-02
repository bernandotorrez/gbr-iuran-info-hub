
import { useState, useEffect } from "react"
import { Plus, Search, Users, Clock, Upload, X, Eye, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useUserRole } from "@/hooks/useUserRole"
import { useSupabaseData, BukuTamu } from "@/hooks/useSupabaseData"

export default function BukuTamu() {
  const [bukuTamuList, setBukuTamuList] = useState<BukuTamu[]>([])
  const [filteredBukuTamu, setFilteredBukuTamu] = useState<BukuTamu[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [ktpFileUrl, setKtpFileUrl] = useState("")
  const [statusFilter, setStatusFilter] = useState("semua")
  const { toast } = useToast()
  const { isAdmin } = useUserRole()
  const { fetchBukuTamu, addBukuTamu, updateBukuTamu } = useSupabaseData()

  // Form state
  const [formData, setFormData] = useState({
    nama_pengunjung: "",
    instansi: "",
    keperluan: "",
    nomor_hp: "",
    email: "",
    catatan: ""
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchBukuTamu()
      setBukuTamuList(data)
      setFilteredBukuTamu(data)
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat data buku tamu",
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
    let filtered = bukuTamuList

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama_pengunjung.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keperluan.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "semua") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredBukuTamu(filtered)
  }, [bukuTamuList, searchTerm, statusFilter])

  const handleFileUpload = async (file: File) => {
    if (!file) return ""

    try {
      setUploadingFile(true)
      
      // Generate unique filename
      const timestamp = new Date().getTime()
      const fileExtension = file.name.split('.').pop()
      const fileName = `ktp_${timestamp}.${fileExtension}`
      const filePath = `buku_tamu/${fileName}`

      const { data, error } = await supabase.storage
        .from('images_private')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
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
        description: "Gagal mengupload file KTP",
        variant: "destructive"
      })
      return ""
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.nama_pengunjung.trim() || !formData.keperluan.trim()) {
      toast({
        title: "Error",
        description: "Nama pengunjung dan keperluan harus diisi",
        variant: "destructive"
      })
      return
    }

    try {
      await addBukuTamu({
        ...formData,
        ktp_file_url: ktpFileUrl || null
      })

      setFormData({
        nama_pengunjung: "",
        instansi: "",
        keperluan: "",
        nomor_hp: "",
        email: "",
        catatan: ""
      })
      setKtpFileUrl("")
      setIsAddOpen(false)
      await loadData()
      toast({ title: "Berhasil", description: "Data pengunjung berhasil dicatat" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal mencatat data pengunjung",
        variant: "destructive" 
      })
    }
  }

  const handleCheckOut = async (id: string) => {
    try {
      await updateBukuTamu(id, {
        status: 'keluar',
        waktu_keluar: new Date().toISOString()
      })

      await loadData()
      toast({ title: "Berhasil", description: "Pengunjung berhasil checkout" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal melakukan checkout",
        variant: "destructive" 
      })
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('id-ID')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Buku Tamu</h1>
          <p className="text-muted-foreground">Kelola data kunjungan tamu</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengunjung
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Tambah Data Pengunjung</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nama_pengunjung">Nama Pengunjung *</Label>
                  <Input
                    id="nama_pengunjung"
                    value={formData.nama_pengunjung}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama_pengunjung: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <Label htmlFor="instansi">Instansi/Perusahaan</Label>
                  <Input
                    id="instansi"
                    value={formData.instansi}
                    onChange={(e) => setFormData(prev => ({ ...prev, instansi: e.target.value }))}
                    placeholder="Nama instansi atau perusahaan"
                  />
                </div>

                <div>
                  <Label htmlFor="keperluan">Keperluan *</Label>
                  <Textarea
                    id="keperluan"
                    value={formData.keperluan}
                    onChange={(e) => setFormData(prev => ({ ...prev, keperluan: e.target.value }))}
                    placeholder="Tujuan kunjungan"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="nomor_hp">Nomor HP</Label>
                  <Input
                    id="nomor_hp"
                    value={formData.nomor_hp}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomor_hp: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="ktp_upload">Upload Foto KTP</Label>
                  <div className="mt-2">
                    <Input
                      id="ktp_upload"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const uploadedUrl = await handleFileUpload(file)
                          if (uploadedUrl) {
                            setKtpFileUrl(uploadedUrl)
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
                    {ktpFileUrl && (
                      <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded border">
                        <span className="text-sm text-green-700">File KTP berhasil diupload</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setKtpFileUrl("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Format: .jpg, .jpeg, .png (Max 5MB)</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="catatan">Catatan</Label>
                  <Textarea
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                    placeholder="Catatan tambahan (opsional)"
                    rows={2}
                  />
                </div>
              </div>
            </ScrollArea>
            <div className="mt-4">
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={uploadingFile}
              >
                {uploadingFile ? "Mengupload..." : "Simpan Data Pengunjung"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="masuk">Sedang Berkunjung</SelectItem>
              <SelectItem value="keluar">Sudah Keluar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pengunjung Hari Ini</p>
              <p className="text-2xl font-bold">
                {bukuTamuList.filter(item => 
                  new Date(item.created_at).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Sedang Berkunjung</p>
              <p className="text-2xl font-bold">
                {bukuTamuList.filter(item => item.status === 'masuk').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Kunjungan</p>
              <p className="text-2xl font-bold">{bukuTamuList.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, instansi, atau keperluan..."
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
              <TableHead>Nama Pengunjung</TableHead>
              <TableHead>Instansi</TableHead>
              <TableHead>Keperluan</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Waktu Masuk</TableHead>
              <TableHead>Waktu Keluar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBukuTamu.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nama_pengunjung}</TableCell>
                <TableCell>{item.instansi || '-'}</TableCell>
                <TableCell>{item.keperluan}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {item.nomor_hp && <div>{item.nomor_hp}</div>}
                    {item.email && <div>{item.email}</div>}
                  </div>
                </TableCell>
                <TableCell>{formatDateTime(item.waktu_masuk)}</TableCell>
                <TableCell>{item.waktu_keluar ? formatDateTime(item.waktu_keluar) : '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'masuk' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status === 'masuk' ? 'Sedang Berkunjung' : 'Sudah Keluar'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {item.ktp_file_url && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(item.ktp_file_url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {item.status === 'masuk' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCheckOut(item.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
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
