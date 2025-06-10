import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Filter, Upload, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStrukturPengurus } from "@/hooks/useStrukturPengurus"
import { StrukturPengurusFormDialog } from "@/components/forms/StrukturPengurusFormDialog"

interface StrukturPengurus {
  id: string
  jabatan: string
  level_jabatan: number
  nama_pengurus: string
  warga_id: string | null
  blok_rumah: string | null
  periode_mulai: number
  periode_selesai: number
  status_aktif: boolean
  foto_url?: string | null
}

export default function StrukturPengurus() {
  const { toast } = useToast()
  const { 
    strukturList, 
    loading, 
    fetchStrukturPengurus, 
    addStrukturPengurus, 
    updateStrukturPengurus, 
    deleteStrukturPengurus,
    uploadImageToSupabase,
    deleteImageFromSupabase
  } = useStrukturPengurus()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPeriode, setSelectedPeriode] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StrukturPengurus | null>(null)
  
  // Image upload states
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set())
  const [previewImages, setPreviewImages] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    fetchStrukturPengurus()
  }, [])

  // Create slug from name for file naming
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleImageUpload = async (file: File, pengurusId: string, nama: string) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImages(prev => new Set(prev).add(pengurusId))

    try {
      // Create filename using slug from name
      const slug = createSlug(nama)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${slug}-${Date.now()}.${fileExtension}`

      // Upload to Supabase
      const imageUrl = await uploadImageToSupabase(file, fileName)

      // Update database with new image URL
      const currentItem = strukturList.find(item => item.id === pengurusId)
      if (currentItem) {
        // Delete old image if exists
        if (currentItem.foto_url) {
          const oldFileName = currentItem.foto_url.split('/').pop()
          if (oldFileName) {
            await deleteImageFromSupabase(oldFileName)
          }
        }

        await updateStrukturPengurus(pengurusId, {
          ...currentItem,
          foto_url: imageUrl
        })

        await fetchStrukturPengurus()
        
        toast({
          title: "Berhasil",
          description: "Foto berhasil diupload",
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: "Gagal mengupload foto",
        variant: "destructive",
      })
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(pengurusId)
        return newSet
      })
    }
  }

  const handleDeleteImage = async (pengurusId: string) => {
    const currentItem = strukturList.find(item => item.id === pengurusId)
    if (!currentItem?.foto_url) return

    try {
      // Delete from Supabase storage
      const fileName = currentItem.foto_url.split('/').pop()
      if (fileName) {
        await deleteImageFromSupabase(fileName)
      }

      // Update database
      await updateStrukturPengurus(pengurusId, {
        ...currentItem,
        foto_url: null
      })

      await fetchStrukturPengurus()
      
      toast({
        title: "Berhasil",
        description: "Foto berhasil dihapus",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus foto",
        variant: "destructive",
      })
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: StrukturPengurus) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengurus "${nama}"?`)) {
      try {
        // Delete image first if exists
        const currentItem = strukturList.find(item => item.id === id)
        if (currentItem?.foto_url) {
          const fileName = currentItem.foto_url.split('/').pop()
          if (fileName) {
            await deleteImageFromSupabase(fileName)
          }
        }

        await deleteStrukturPengurus(id)
        await fetchStrukturPengurus()
        toast({
          title: "Berhasil",
          description: "Data pengurus berhasil dihapus",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus data pengurus",
          variant: "destructive",
        })
      }
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await updateStrukturPengurus(editingItem.id, data)
        toast({
          title: "Berhasil",
          description: "Data pengurus berhasil diupdate",
        })
      } else {
        await addStrukturPengurus(data)
        toast({
          title: "Berhasil",
          description: "Data pengurus berhasil ditambahkan",
        })
      }
      
      setIsDialogOpen(false)
      setEditingItem(null)
      await fetchStrukturPengurus()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan data pengurus",
        variant: "destructive",
      })
    }
  }

  const filteredData = strukturList.filter(item => {
    const matchesSearch = item.nama_pengurus.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPeriode = selectedPeriode === "all" || 
                          (selectedPeriode === "active" && item.status_aktif) ||
                          (selectedPeriode === "inactive" && !item.status_aktif)
    
    return matchesSearch && matchesPeriode
  })

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1: return "bg-red-500"
      case 2: return "bg-orange-500"
      case 3: return "bg-yellow-500"
      case 4: return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Memuat data pengurus...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Struktur Pengurus Paguyuban</h1>
          <p className="text-muted-foreground">Kelola struktur organisasi pengurus paguyuban perumahan GBR</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengurus
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cari nama pengurus atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredData.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start flex-1">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {item.foto_url ? (
                        <img 
                          src={item.foto_url} 
                          alt={item.nama_pengurus}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Image Upload/Delete Controls */}
                    <div className="absolute -bottom-1 -right-1">
                      {item.foto_url ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-6 h-6 p-0 rounded-full"
                          onClick={() => handleDeleteImage(item.id)}
                          disabled={uploadingImages.has(item.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      ) : (
                        <label className="cursor-pointer">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-6 h-6 p-0 rounded-full"
                            disabled={uploadingImages.has(item.id)}
                            asChild
                          >
                            <div>
                              {uploadingImages.has(item.id) ? (
                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload className="w-3 h-3" />
                              )}
                            </div>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleImageUpload(file, item.id, item.nama_pengurus)
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.nama_pengurus}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">{item.jabatan}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Badge 
                    className={`${getLevelBadgeColor(item.level_jabatan)} text-white text-xs`}
                  >
                    Level {item.level_jabatan}
                  </Badge>
                  <Badge variant={item.status_aktif ? "default" : "secondary"} className="text-xs">
                    {item.status_aktif ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {item.blok_rumah && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Blok: </span>
                  <span>{item.blok_rumah}</span>
                </div>
              )}
              
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Periode: </span>
                <span>{item.periode_mulai} - {item.periode_selesai}</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(item)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(item.id, item.nama_pengurus)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {searchTerm || selectedPeriode !== "all" 
              ? "Tidak ada data pengurus yang sesuai dengan filter"
              : "Belum ada data pengurus"
            }
          </div>
          {!searchTerm && selectedPeriode === "all" && (
            <Button onClick={handleAdd} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Pengurus Pertama
            </Button>
          )}
        </div>
      )}

      <StrukturPengurusFormDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSave}
        editData={editingItem}
      />
    </div>
  )
}