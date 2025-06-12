import { useState, useEffect } from "react"
import { Upload, X, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ArtikelFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
  uploading?: boolean
}

export function ArtikelFormDialog({ open, onClose, onSave, editData, uploading }: ArtikelFormDialogProps) {
  const [formData, setFormData] = useState({
    judul: '',
    konten: '',
    kategori: '',
    excerpt: '',
    status: 'draft',
    gambar_url: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (editData) {
      setFormData({
        judul: editData.judul || '',
        konten: editData.konten || '',
        kategori: editData.kategori || '',
        excerpt: editData.excerpt || '',
        status: editData.status || 'draft',
        gambar_url: editData.gambar_url || ''
      })
      setPreviewUrl(editData.gambar_url || '')
    } else {
      setFormData({
        judul: '',
        konten: '',
        kategori: '',
        excerpt: '',
        status: 'draft',
        gambar_url: ''
      })
      setPreviewUrl('')
    }
    setSelectedFile(null)
  }, [editData, open])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setFormData(prev => ({
      ...prev,
      gambar_url: ''
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      imageFile: selectedFile // Include the file for upload
    }
    
    onSave(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Artikel' : 'Tambah Artikel Baru'}</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="judul">Judul Artikel</Label>
            <Input
              id="judul"
              value={formData.judul}
              onChange={(e) => handleInputChange('judul', e.target.value)}
              placeholder="Masukkan judul artikel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select value={formData.kategori} onValueChange={(value) => handleInputChange('kategori', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="berita">Berita</SelectItem>
                <SelectItem value="pengumuman">Pengumuman</SelectItem>
                <SelectItem value="kegiatan">Kegiatan</SelectItem>
                <SelectItem value="informasi">Informasi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Ringkasan</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Masukkan ringkasan artikel"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Gambar Artikel</Label>
            <div className="space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Pilih Gambar
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    PNG, JPG, GIF hingga 5MB
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="konten">Konten</Label>
            <Textarea
              id="konten"
              value={formData.konten}
              onChange={(e) => handleInputChange('konten', e.target.value)}
              placeholder="Masukkan konten artikel"
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-card">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Mengupload...
                </>
              ) : (
                editData ? 'Perbarui' : 'Simpan'
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}