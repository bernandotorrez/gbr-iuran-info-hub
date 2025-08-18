import { useState, useEffect } from "react"
import { Upload, X, Image, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { supabase } from "@/integrations/supabase/client"
import { WysiwygEditor } from "@/components/WysiwygEditor"

interface TagUMKM {
  id: string
  nama_tag: string
  deskripsi?: string
  warna: string
}

interface UMKMFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  editData?: any
  uploading?: boolean
}

export function UMKMFormDialog({ open, onClose, onSave, editData, uploading }: UMKMFormDialogProps) {
  const { fetchWarga, fetchTagUMKM } = useSupabaseData()
  const [formData, setFormData] = useState({
    nama_umkm: '',
    deskripsi: '',
    nomor_telepon: '',
    phone_source: '',
    email: '',
    website: '',
    jam_operasional: '',
    tag: '',
    status: 'aktif',
    warga_id: '',
    gambar_url: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [wargaList, setWargaList] = useState<any[]>([])
  const [tagList, setTagList] = useState<TagUMKM[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [openTagCombobox, setOpenTagCombobox] = useState(false)
  const [openWargaCombobox, setOpenWargaCombobox] = useState(false)

  useEffect(() => {
    loadWarga()
    loadTags()
  }, [])

  useEffect(() => {
    if (editData) {
      setFormData({
        nama_umkm: editData.nama_umkm || '',
        deskripsi: editData.deskripsi || '',
        nomor_telepon: editData.nomor_telepon || '',
        phone_source: editData.phone_source || '',
        email: editData.email || '',
        website: editData.website || '',
        jam_operasional: editData.jam_operasional || '',
        tag: editData.tag || '',
        status: editData.status || 'aktif',
        warga_id: editData.warga_id || '',
        gambar_url: editData.gambar_url || ''
      })
      setPreviewUrl(editData.gambar_url || '')
      
      if (editData.id) {
        loadExistingTags(editData.id)
      }
    } else {
      setFormData({
        nama_umkm: '',
        deskripsi: '',
        nomor_telepon: '',
        phone_source: '',
        email: '',
        website: '',
        jam_operasional: '',
        tag: '',
        status: 'aktif',
        warga_id: '',
        gambar_url: ''
      })
      setSelectedFile(null)
      setPreviewUrl('')
      setSelectedTags([])
    }
  }, [editData, open])

  const loadWarga = async () => {
    try {
      const data = await fetchWarga()
      setWargaList(data)
    } catch (error) {
      console.error('Error loading warga:', error)
    }
  }

  const loadTags = async () => {
    try {
      const data = await fetchTagUMKM()
      setTagList(data)
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const loadExistingTags = async (umkmId: string) => {
    try {
      const { data, error } = await supabase
        .from('umkm_tags')
        .select('tag_id')
        .eq('umkm_id', umkmId)
      
      if (error) throw error
      setSelectedTags(data?.map(item => item.tag_id) || [])
    } catch (error) {
      console.error('Error loading existing tags:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleWargaChange = (wargaId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      warga_id: wargaId,
      nomor_telepon: '',
      phone_source: ''
    }))
  }

  const handlePhoneSourceChange = (source: string) => {
    const selectedWarga = wargaList.find(w => w.id === formData.warga_id)
    if (selectedWarga) {
      const phoneNumber = source === 'suami' ? selectedWarga.nomor_hp_suami : selectedWarga.nomor_hp_istri
      setFormData(prev => ({
        ...prev,
        phone_source: source,
        nomor_telepon: phoneNumber || ''
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setFormData(prev => ({ ...prev, gambar_url: '' }))
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      selectedTags,
      imageFile: selectedFile
    }
    
    onSave(submitData)
  }

  const selectedWarga = wargaList.find(w => w.id === formData.warga_id)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit UMKM' : 'Tambah UMKM'}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama_umkm">Nama UMKM</Label>
              <Input
                id="nama_umkm"
                value={formData.nama_umkm}
                onChange={(e) => handleInputChange('nama_umkm', e.target.value)}
                placeholder="Nama UMKM"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <WysiwygEditor
                value={formData.deskripsi}
                onChange={(value) => handleInputChange('deskripsi', value)}
                placeholder="Deskripsi UMKM..."
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori/Tag</Label>
              <Popover open={openTagCombobox} onOpenChange={setOpenTagCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTagCombobox}
                    className="w-full justify-between"
                  >
                    {selectedTags.length > 0 
                      ? `${selectedTags.length} tag dipilih`
                      : "Pilih kategori/tag..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Cari tag..." />
                    <CommandEmpty>Tag tidak ditemukan.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {tagList.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => handleTagToggle(tag.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: tag.warna }}
                            />
                            <span>{tag.nama_tag}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTags.map(tagId => {
                    const tag = tagList.find(t => t.id === tagId)
                    return tag ? (
                      <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        style={{ backgroundColor: tag.warna, color: 'white' }}
                      >
                        {tag.nama_tag}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pemilik (Warga)</Label>
              <Popover open={openWargaCombobox} onOpenChange={setOpenWargaCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openWargaCombobox}
                    className="w-full justify-between"
                  >
                    {selectedWarga 
                      ? `${selectedWarga.nama_suami}${selectedWarga.nama_istri ? ` & ${selectedWarga.nama_istri}` : ''}`
                      : "Pilih pemilik..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Cari warga..." />
                    <CommandEmpty>Warga tidak ditemukan.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {wargaList.map((warga) => (
                        <CommandItem
                          key={warga.id}
                          onSelect={() => {
                            handleWargaChange(warga.id)
                            setOpenWargaCombobox(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.warga_id === warga.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{warga.nama_suami}{warga.nama_istri ? ` & ${warga.nama_istri}` : ''}</span>
                            {warga.blok_rumah && (
                              <span className="text-sm text-muted-foreground">
                                Blok {warga.blok_rumah}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Nomor Telepon (dari data pemilik)</Label>
              <div className="space-y-2">
                <Select 
                  value={formData.phone_source} 
                  onValueChange={handlePhoneSourceChange}
                  disabled={!formData.warga_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.warga_id ? "Pilih nomor telepon" : "Pilih pemilik terlebih dahulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.warga_id && (() => {
                      const selectedWarga = wargaList.find(w => w.id === formData.warga_id)
                      if (!selectedWarga) return null
                      
                      const options = []
                      if (selectedWarga.nomor_hp_suami) {
                        options.push(
                          <SelectItem key="suami" value="suami">
                            Suami: {selectedWarga.nomor_hp_suami}
                          </SelectItem>
                        )
                      }
                      if (selectedWarga.nomor_hp_istri) {
                        options.push(
                          <SelectItem key="istri" value="istri">
                            Istri: {selectedWarga.nomor_hp_istri}
                          </SelectItem>
                        )
                      }
                      
                      return options.length > 0 ? options : (
                        <SelectItem value="" disabled>
                          Tidak ada nomor telepon tersedia
                        </SelectItem>
                      )
                    })()} 
                  </SelectContent>
                </Select>
                
                {formData.nomor_telepon && (
                  <div className="text-sm text-muted-foreground">
                    Nomor terpilih: {formData.nomor_telepon}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email UMKM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (opsional)</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="Website UMKM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jam_operasional">Jam Operasional</Label>
              <Input
                id="jam_operasional"
                value={formData.jam_operasional}
                onChange={(e) => handleInputChange('jam_operasional', e.target.value)}
                placeholder="Contoh: Senin-Jumat 08:00-17:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Non-aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gambar UMKM</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {previewUrl ? (
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
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Klik untuk upload gambar
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  editData ? 'Update' : 'Simpan'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}