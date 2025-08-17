import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Trash2, Eye, Phone, Mail, Globe, Clock, Tag, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData, UMKM } from "@/hooks/useSupabaseData"
import { UMKMFormDialog } from "@/components/forms/UMKMFormDialog"
import { useUserRole } from "@/hooks/useUserRole"

export default function MasterUMKM() {
  const { toast } = useToast()
  const { 
    fetchUMKM, 
    addUMKM, 
    updateUMKM, 
    deleteUMKM, 
    uploadImageUMKM, 
    deleteImageUMKM,
    generateSignedUrlUMKM 
  } = useSupabaseData()
  
  const [umkmList, setUmkmList] = useState<UMKM[]>([])
  const [filteredUmkm, setFilteredUmkm] = useState<UMKM[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUmkm, setSelectedUmkm] = useState<UMKM | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Check if user has admin access
  const { userProfile, loading: userLoading } = useUserRole()
  const hasAdminAccess = userProfile?.role?.toLowerCase() === 'admin'

  useEffect(() => {
    if (userLoading) return // Wait for user profile to load
    
    if (!hasAdminAccess) {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki akses untuk halaman ini",
        variant: "destructive"
      })
      return
    }
    
    loadUmkm()
  }, [hasAdminAccess, userLoading])

  useEffect(() => {
    filterUmkm()
  }, [searchTerm, umkmList])

  const loadUmkm = async () => {
    try {
      setLoading(true)
      const data = await fetchUMKM()
      
      // Generate signed URLs for images
      const dataWithSignedUrls = await Promise.all(
        data.map(async (umkm) => {
          if (umkm.gambar_url) {
            try {
              const signedUrl = await generateSignedUrlUMKM(umkm.gambar_url)
              return { ...umkm, gambar_url: signedUrl }
            } catch (error) {
              console.error('Error generating signed URL for UMKM image:', error)
              return umkm
            }
          }
          return umkm
        })
      )
      
      setUmkmList(dataWithSignedUrls)
    } catch (error) {
      console.error('Error loading UMKM:', error)
      toast({
        title: "Error",
        description: "Gagal memuat data UMKM",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUmkm = () => {
    if (!searchTerm) {
      setFilteredUmkm(umkmList)
    } else {
      const filtered = umkmList.filter(umkm => {
        const tagNames = umkm.umkm_tags?.map(ut => ut.tag_umkm?.nama_tag).filter(Boolean).join(' ') || ''
        
        return umkm.nama_umkm.toLowerCase().includes(searchTerm.toLowerCase()) ||
               tagNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
               umkm.alamat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               umkm.warga_new?.nama_suami.toLowerCase().includes(searchTerm.toLowerCase()) ||
               umkm.warga_new?.nama_istri.toLowerCase().includes(searchTerm.toLowerCase())
      })
      setFilteredUmkm(filtered)
    }
  }

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const imageUrl = await uploadImageUMKM(file)
      return imageUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      await deleteImageUMKM(imageUrl)
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const handleAdd = async (formData: any) => {
    try {
      setUploading(true)
      let finalFormData = { ...formData }
      
      // Handle image upload if file is provided
      if (formData.imageFile) {
        const imageUrl = await handleImageUpload(formData.imageFile)
        if (imageUrl) {
          finalFormData.gambar_url = imageUrl
        }
      }
      
      // Remove imageFile from form data before sending to database
      const { imageFile, ...cleanFormData } = finalFormData
      finalFormData = cleanFormData

      await addUMKM(finalFormData)
      setIsAddOpen(false)
      await loadUmkm()
      toast({ title: "Berhasil", description: "UMKM berhasil ditambahkan" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menambahkan UMKM",
        variant: "destructive" 
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async (formData: any) => {
    if (!selectedUmkm) return
    try {
      setUploading(true)
      let finalFormData = { ...formData }
      
      // Handle image upload if new file is provided
      if (formData.imageFile) {
        // Delete old image if exists
        if (selectedUmkm.gambar_url) {
          await handleDeleteImage(selectedUmkm.gambar_url)
        }
        
        const imageUrl = await handleImageUpload(formData.imageFile)
        if (imageUrl) {
          finalFormData.gambar_url = imageUrl
        }
      }
      
      // Remove imageFile from form data before processing
      const { imageFile, ...cleanFormData } = finalFormData
      finalFormData = cleanFormData

      await updateUMKM(selectedUmkm.id, finalFormData)
      setIsEditOpen(false)
      setSelectedUmkm(null)
      await loadUmkm()
      toast({ title: "Berhasil", description: "UMKM berhasil diperbarui" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal memperbarui UMKM",
        variant: "destructive" 
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // Find the UMKM to get the image URL
      const umkm = umkmList.find(u => u.id === id)
      
      // Delete associated image if exists
      if (umkm?.gambar_url) {
        await handleDeleteImage(umkm.gambar_url)
      }
      
      await deleteUMKM(id)
      await loadUmkm()
      toast({ title: "Berhasil", description: "UMKM berhasil dihapus" })
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Gagal menghapus UMKM",
        variant: "destructive" 
      })
    }
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'aktif' ? 'default' : 'secondary'}>
        {status === 'aktif' ? 'Aktif' : 'Non-aktif'}
      </Badge>
    )
  }

  const getTagBadges = (umkmTags: any[]) => {
    if (!umkmTags || umkmTags.length === 0) {
      return <span className="text-gray-400">-</span>
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {umkmTags.map((umkmTag, index) => {
          const tag = umkmTag.tag_umkm
          if (!tag) return null
          
          return (
            <Badge 
              key={index}
              style={{ 
                backgroundColor: tag.warna, 
                color: 'white' 
              }}
            >
              {tag.nama_tag}
            </Badge>
          )
        })}
      </div>
    )
  }

  if (!hasAdminAccess && !userLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
        <p className="text-gray-600 mb-4">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <p className="text-sm text-gray-500">
          Halaman ini hanya dapat diakses oleh Admin.
        </p>

      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Master UMKM</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah UMKM
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari UMKM berdasarkan nama, kategori, alamat, atau pemilik..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Memuat data UMKM...</div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama UMKM</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Pemilik</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUmkm.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {searchTerm ? 'Tidak ada UMKM yang sesuai dengan pencarian' : 'Belum ada data UMKM'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUmkm.map((umkm) => (
                  <TableRow key={umkm.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {umkm.gambar_url && (
                          <img 
                            src={umkm.gambar_url} 
                            alt={umkm.nama_umkm}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{umkm.nama_umkm}</div>
                          {umkm.deskripsi && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {umkm.deskripsi}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTagBadges(umkm.umkm_tags)}</TableCell>
                    <TableCell>
                      {umkm.warga_new ? (
                        <div>
                          <div className="font-medium">{umkm.warga_new.nama_suami} {umkm.warga_new.nama_istri && `& ${umkm.warga_new.nama_istri}`}</div>
                          <div className="text-sm text-gray-500">{umkm.warga_new.nomor_hp}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {umkm.alamat || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {umkm.nomor_telepon && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {umkm.nomor_telepon}
                          </div>
                        )}
                        {umkm.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {umkm.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(umkm.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUmkm(umkm)
                            setIsDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUmkm(umkm)
                            setIsEditOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Apakah Anda yakin ingin menghapus UMKM ini?')) {
                              handleDelete(umkm.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add UMKM Dialog */}
      <UMKMFormDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
        uploading={uploading}
      />

      {/* Edit UMKM Dialog */}
      <UMKMFormDialog
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedUmkm(null)
        }}
        onSave={handleEdit}
        editData={selectedUmkm}
        uploading={uploading}
      />

      {/* Detail UMKM Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail UMKM</DialogTitle>
          </DialogHeader>
          {selectedUmkm && (
            <div className="space-y-4">
              {selectedUmkm.gambar_url && (
                <div className="w-full">
                  <img 
                    src={selectedUmkm.gambar_url} 
                    alt={selectedUmkm.nama_umkm}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedUmkm.nama_umkm}</h3>
                  <div className="flex items-center mt-2">
                    <Tag className="h-4 w-4 mr-2" />
                    {getTagBadges(selectedUmkm.umkm_tags)}
                  </div>
                  <div className="mt-2">{getStatusBadge(selectedUmkm.status)}</div>
                </div>
                
                <div className="space-y-2">
                  {selectedUmkm.warga_new && (
                    <div>
                      <strong>Pemilik:</strong> {selectedUmkm.warga_new.nama_suami} {selectedUmkm.warga_new.nama_istri && `& ${selectedUmkm.warga_new.nama_istri}`}
                    </div>
                  )}
                  {selectedUmkm.alamat && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                      {selectedUmkm.alamat}
                    </div>
                  )}
                  {selectedUmkm.nomor_telepon && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {selectedUmkm.nomor_telepon}
                    </div>
                  )}
                  {selectedUmkm.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {selectedUmkm.email}
                    </div>
                  )}
                  {selectedUmkm.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={selectedUmkm.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedUmkm.website}
                      </a>
                    </div>
                  )}
                  {selectedUmkm.jam_operasional && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {selectedUmkm.jam_operasional}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedUmkm.deskripsi && (
                <div>
                  <strong>Deskripsi:</strong>
                  <div className="mt-1 text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedUmkm.deskripsi }} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}