
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WysiwygEditor } from "@/components/WysiwygEditor"

interface ArtikelFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
}

export function ArtikelFormDialog({ 
  open, 
  onClose, 
  onSave, 
  editData 
}: ArtikelFormDialogProps) {
  const [formData, setFormData] = useState({
    judul: "",
    konten: "",
    excerpt: "",
    gambar_url: "",
    kategori: "umum",
    status: "draft"
  })
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          judul: editData.judul || "",
          konten: editData.konten || "",
          excerpt: editData.excerpt || "",
          gambar_url: editData.gambar_url || "",
          kategori: editData.kategori || "umum",
          status: editData.status || "draft"
        })
      } else {
        setFormData({
          judul: "",
          konten: "",
          excerpt: "",
          gambar_url: "",
          kategori: "umum",
          status: "draft"
        })
      }
    }
  }, [open, editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setLoading(false)
    }
  }

  const kategoriOptions = [
    { value: "umum", label: "Umum" },
    { value: "pengumuman", label: "Pengumuman" },
    { value: "kegiatan", label: "Kegiatan" },
    { value: "berita", label: "Berita" },
    { value: "informasi", label: "Informasi" }
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Artikel" : "Tambah Artikel"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="judul">Judul Artikel</Label>
            <Input
              id="judul"
              value={formData.judul}
              onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
              placeholder="Masukkan judul artikel"
              required
            />
          </div>

          <div>
            <Label htmlFor="excerpt">Ringkasan (Excerpt)</Label>
            <Input
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Ringkasan singkat artikel (opsional)"
            />
          </div>

          <div>
            <Label htmlFor="gambar_url">URL Gambar</Label>
            <Input
              id="gambar_url"
              value={formData.gambar_url}
              onChange={(e) => setFormData(prev => ({ ...prev, gambar_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) => setFormData(prev => ({ ...prev, kategori: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriOptions.map((kategori) => (
                    <SelectItem key={kategori.value} value={kategori.value}>
                      {kategori.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="konten">Konten Artikel</Label>
            <div className="mt-2">
              <WysiwygEditor
                value={formData.konten}
                onChange={(value) => setFormData(prev => ({ ...prev, konten: value }))}
                placeholder="Tulis konten artikel di sini..."
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
