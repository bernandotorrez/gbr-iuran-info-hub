
import { useState, useEffect } from "react"
import { createSafeHtml } from "@/lib/sanitize"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Eye, ArrowLeft, Building2 } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface Artikel {
  id: string
  judul: string
  konten: string
  excerpt: string | null
  gambar_url: string | null
  kategori: string | null
  published_at: string | null
  author_id: string
  slug_url: string | null
  warga_new: {
    nama_suami: string
  } | null
}

export default function PublicArtikel() {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const { fetchArtikelBySlug } = useSupabaseData()
  const [artikelList, setArtikelList] = useState<Artikel[]>([])
  const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null)
  const [loading, setLoading] = useState(true)
  const [articleLoading, setArticleLoading] = useState(false)

  const fetchArtikel = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artikel_berita')
        .select(`
          *,
          warga_new:author_id(nama_suami)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching artikel:', error)
        return
      }
      
      setArtikelList(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArtikelBySlugUrl = async (slugUrl: string) => {
    try {
      setArticleLoading(true)
      const artikel = await fetchArtikelBySlug(slugUrl)
      if (artikel) {
        setSelectedArtikel(artikel as Artikel)
      } else {
        // Article not found, redirect to article list
        navigate('/public/artikel')
      }
    } catch (error) {
      console.error('Error fetching artikel by slug:', error)
      navigate('/public/artikel')
    } finally {
      setArticleLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      // If there's a slug in the URL, fetch the specific article
      fetchArtikelBySlugUrl(slug)
    } else {
      // Otherwise, fetch the article list and clear selected article
      setSelectedArtikel(null)
      fetchArtikel()
    }
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading || articleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Memuat artikel...</div>
        </div>
      </div>
    )
  }

  if (selectedArtikel) {
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-xs sm:text-sm"
                    onClick={() => navigate('/public/artikel')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                  <Link to="/" className="w-full sm:w-auto">
                    <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">Beranda</Button>
                  </Link>
                </div>
              </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {selectedArtikel.gambar_url && (
              <img
                src={selectedArtikel.gambar_url}
                alt={selectedArtikel.judul}
                className="w-full h-64 md:h-96 object-cover"
              />
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  {selectedArtikel.kategori || 'Umum'}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {selectedArtikel.judul}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{selectedArtikel.warga_new?.nama_suami || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedArtikel.published_at || '')}</span>
                </div>
              </div>
              
              <div 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={createSafeHtml(selectedArtikel.konten.replace(/\n/g, '<br>'))}
              />
            </div>
          </article>
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
                  <p className="text-xs sm:text-sm text-gray-600">Hunian Nyaman dan Asri</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-2">
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
            Artikel & Berita Perumahan GBR
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dapatkan informasi terkini seputar kegiatan dan pengumuman di Perumahan GBR
          </p>
        </div>

        {artikelList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Belum ada artikel yang dipublikasikan
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artikelList.map((artikel) => (
              <Link 
                key={artikel.id}
                to={`/public/artikel/${artikel.slug_url || artikel.id}`}
                className="block"
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                {artikel.gambar_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={artikel.gambar_url}
                      alt={artikel.judul}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {artikel.kategori || 'Umum'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(artikel.published_at || '')}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {artikel.judul}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {artikel.excerpt || artikel.konten.substring(0, 150) + '...'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{artikel.warga_new?.nama_suami || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 font-medium">
                      <Eye className="w-3 h-3" />
                      <span>Baca Selengkapnya</span>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
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
