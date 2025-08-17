import { useState, useEffect } from "react"
import { Search, Phone, Mail, Globe, Clock, MapPin, Tag, Filter, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from "react-router-dom"
import { useSupabaseData, UMKM } from "@/hooks/useSupabaseData"

export default function PublicUMKM() {
  const { fetchUMKMPublic } = useSupabaseData()
  
  const [umkmList, setUmkmList] = useState<UMKM[]>([])
  const [filteredUmkm, setFilteredUmkm] = useState<UMKM[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')

  // Tag options for filtering
  const tagOptions = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'gas', label: 'Gas' },
    { value: 'galon', label: 'Galon' },
    { value: 'siomay', label: 'Siomay' },
    { value: 'makanan', label: 'Makanan' },
    { value: 'minuman', label: 'Minuman' },
    { value: 'jasa', label: 'Jasa' },
    { value: 'elektronik', label: 'Elektronik' },
    { value: 'pakaian', label: 'Pakaian' },
    { value: 'kecantikan', label: 'Kecantikan' },
    { value: 'kesehatan', label: 'Kesehatan' },
    { value: 'pendidikan', label: 'Pendidikan' },
    { value: 'otomotif', label: 'Otomotif' },
    { value: 'lainnya', label: 'Lainnya' }
  ]

  useEffect(() => {
    loadUmkm()
  }, [selectedTag])

  // Load all UMKM data when page first opens
  useEffect(() => {
    loadUmkm()
  }, [])

  useEffect(() => {
    filterUmkm()
  }, [searchTerm, umkmList])

  const loadUmkm = async () => {
    try {
      setLoading(true)
      const data = await fetchUMKMPublic(selectedTag === 'all' ? undefined : selectedTag)
      setUmkmList(data)
    } catch (error) {
      console.error('Error loading UMKM:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUmkm = () => {
    if (!searchTerm) {
      setFilteredUmkm(umkmList)
    } else {
      const filtered = umkmList.filter(umkm => 
        umkm.nama_umkm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        umkm.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        umkm.alamat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        umkm.warga_new?.nama_suami.toLowerCase().includes(searchTerm.toLowerCase()) ||
        umkm.warga_new?.nama_istri.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUmkm(filtered)
    }
  }

  const getTagBadge = (tag: string) => {
    const colors: { [key: string]: string } = {
      'gas': 'bg-red-100 text-red-800',
      'galon': 'bg-blue-100 text-blue-800',
      'siomay': 'bg-yellow-100 text-yellow-800',
      'makanan': 'bg-green-100 text-green-800',
      'minuman': 'bg-purple-100 text-purple-800',
      'jasa': 'bg-indigo-100 text-indigo-800',
      'elektronik': 'bg-gray-100 text-gray-800',
      'pakaian': 'bg-pink-100 text-pink-800',
      'kecantikan': 'bg-rose-100 text-rose-800',
      'kesehatan': 'bg-emerald-100 text-emerald-800',
      'pendidikan': 'bg-cyan-100 text-cyan-800',
      'otomotif': 'bg-orange-100 text-orange-800',
      'lainnya': 'bg-slate-100 text-slate-800'
    }
    
    return (
      <Badge className={colors[tag] || colors['lainnya']}>
        {tag.charAt(0).toUpperCase() + tag.slice(1)}
      </Badge>
    )
  }

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for WhatsApp link
    let formatted = phone.replace(/\D/g, '') // Remove non-digits
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substring(1) // Replace leading 0 with 62
    }
    return formatted
  }

  const getWhatsAppLink = (phone: string, umkmName: string) => {
    const formattedPhone = formatPhoneNumber(phone)
    const message = encodeURIComponent(`Halo, saya tertarik dengan ${umkmName}. Bisa minta informasi lebih lanjut?`)
    return `https://wa.me/${formattedPhone}?text=${message}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Perumahan GBR</h1>
                <p className="text-xs sm:text-sm text-gray-600">Hunian Nyaman dan Asri</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-2">
              <Link to="/public/artikel" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  Artikel & Berita
                </Button>
              </Link>
              <Link to="/public/pengurus" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  Struktur Pengurus
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">Beranda</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            UMKM Perumahan GBR
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temukan berbagai usaha mikro, kecil, dan menengah dari warga Perumahan GBR
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari UMKM berdasarkan nama, deskripsi, alamat, atau pemilik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter kategori" />
                </SelectTrigger>
                <SelectContent>
                  {tagOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Memuat data UMKM...</div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Menampilkan {filteredUmkm.length} UMKM
                {selectedTag && ` dalam kategori "${tagOptions.find(t => t.value === selectedTag)?.label}"`}
                {searchTerm && ` dengan pencarian "${searchTerm}"`}
              </p>
            </div>

            {/* UMKM Grid */}
            {filteredUmkm.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                  {searchTerm || selectedTag ? 'Tidak ada UMKM yang sesuai dengan filter' : 'Belum ada data UMKM'}
                </div>
                <p className="text-gray-400">
                  {searchTerm || selectedTag ? 'Coba ubah kata kunci pencarian atau filter kategori' : 'Data UMKM akan ditampilkan di sini'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUmkm.map((umkm) => (
                  <Card key={umkm.id} className="hover:shadow-lg transition-shadow duration-200">
                    {umkm.gambar_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img 
                          src={umkm.gambar_url} 
                          alt={umkm.nama_umkm}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {umkm.nama_umkm}
                        </CardTitle>
                        <div className="ml-2 flex-shrink-0">
                          {getTagBadge(umkm.tag)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {umkm.deskripsi && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {umkm.deskripsi}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        {umkm.alamat && (
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{umkm.alamat}</span>
                          </div>
                        )}
                        
                        {umkm.jam_operasional && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{umkm.jam_operasional}</span>
                          </div>
                        )}
                        
                        {umkm.warga_new && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Tag className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>Pemilik: {umkm.warga_new.nama_suami} {umkm.warga_new.nama_istri && `& ${umkm.warga_new.nama_istri}`}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {umkm.nomor_telepon && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(getWhatsAppLink(umkm.nomor_telepon!, umkm.nama_umkm), '_blank')}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>
                        )}
                        
                        {umkm.email && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(`mailto:${umkm.email}`, '_blank')}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                        )}
                        
                        {umkm.website && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(umkm.website, '_blank')}
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            Website
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold">Perumahan GBR</div>
                <div className="text-sm text-gray-400">Hunian Nyaman dan Asri</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Perumahan GBR. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}