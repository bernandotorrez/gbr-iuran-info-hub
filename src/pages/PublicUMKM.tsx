
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, User, Phone, Eye, Search } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSupabaseData, UMKM } from "@/hooks/useSupabaseData"

export default function PublicUMKM() {
  const navigate = useNavigate()
  const { fetchUMKMPublic, fetchTagUMKM, generateSignedUrlUMKM } = useSupabaseData()
  const [umkmList, setUmkmList] = useState<UMKM[]>([])
  const [filteredUmkm, setFilteredUmkm] = useState<UMKM[]>([])
  const [tagList, setTagList] = useState<any[]>([])
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterUmkm()
  }, [selectedTag, searchQuery, umkmList])

  const loadData = async () => {
    try {
      setLoading(true)
      const [umkmData, tagData] = await Promise.all([
        fetchUMKMPublic(),
        fetchTagUMKM()
      ])
      
      // Generate signed URLs for images
      const umkmWithSignedUrls = await Promise.all(
        umkmData.map(async (umkm) => {
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
      
      setUmkmList(umkmWithSignedUrls)
      setTagList(tagData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUmkm = () => {
    let filtered = umkmList

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(umkm => 
        umkm.nama_umkm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        umkm.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (umkm.warga_new?.nama_suami && umkm.warga_new.nama_suami.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (umkm.warga_new?.nama_istri && umkm.warga_new.nama_istri.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by tag
    if (selectedTag && selectedTag !== "all") {
      filtered = filtered.filter(umkm => 
        umkm.umkm_tags?.some(ut => ut.tag_id === selectedTag)
      )
    }

    setFilteredUmkm(filtered)
  }

  const getTagBadges = (umkmTags: any[]) => {
    if (!umkmTags || umkmTags.length === 0) {
      return null
    }
    
    return (
      <div className="flex flex-wrap gap-1 mb-2">
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
              className="text-xs"
            >
              {tag.nama_tag}
            </Badge>
          )
        })}
      </div>
    )
  }

  const handleViewDetail = (umkm: UMKM) => {
    if (umkm.slug_url) {
      navigate(`/umkm/${umkm.slug_url}`)
    } else {
      // Generate slug from nama_umkm if slug_url doesn't exist
      const slug = umkm.nama_umkm.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      navigate(`/umkm/${slug}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Memuat data UMKM...</div>
        </div>
      </div>
    )
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
                <p className="text-xs sm:text-sm text-gray-600">UMKM Warga</p>
              </div>
            </div>
            <Link to="/">
              <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">Beranda</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Daftar UMKM Warga
          </h2>
          <p className="text-gray-600 mb-6">
            Temukan berbagai usaha mikro, kecil, dan menengah dari warga perumahan
          </p>
          
          {/* Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Cari UMKM atau nama pemilik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filter berdasarkan kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {tagList.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.warna }}
                      />
                      <span>{tag.nama_tag}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* UMKM Grid */}
        {filteredUmkm.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada UMKM ditemukan</h3>
            <p className="text-gray-500">
              {searchQuery.trim() ? 'Tidak ada UMKM yang sesuai dengan pencarian' : 
               selectedTag && selectedTag !== "all" ? 'Tidak ada UMKM dengan kategori yang dipilih' : 
               'Belum ada data UMKM yang tersedia'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUmkm.map((umkm) => (
              <Card key={umkm.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {umkm.gambar_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={umkm.gambar_url}
                      alt={umkm.nama_umkm}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="space-y-2">
                    {getTagBadges(umkm.umkm_tags)}
                    <CardTitle className="text-lg leading-tight">{umkm.nama_umkm}</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {umkm.warga_new && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {umkm.warga_new.nama_suami} {umkm.warga_new.nama_istri && `& ${umkm.warga_new.nama_istri}`}
                        </span>
                      </div>
                    )}
                    
                    {umkm.nomor_telepon && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{umkm.nomor_telepon}</span>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => handleViewDetail(umkm)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
