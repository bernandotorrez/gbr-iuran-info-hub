import { useState, useEffect } from "react"
import { createSafeHtml } from '@/lib/sanitize'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe, Clock, MapPin, Tag, ArrowLeft, Building2, User } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useSupabaseData, UMKM } from "@/hooks/useSupabaseData"

export default function PublicUMKMDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { fetchUMKMBySlug, generateSignedUrlUMKM } = useSupabaseData()
  const [umkm, setUmkm] = useState<UMKM | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchUMKMBySlugUrl(slug)
    } else {
      navigate('/public/umkm')
    }
  }, [slug])

  const fetchUMKMBySlugUrl = async (slugUrl: string) => {
    try {
      setLoading(true)
      const data = await fetchUMKMBySlug(slugUrl)
      if (data) {
        // Generate signed URL for image if exists
        if (data.gambar_url) {
          const signedUrl = await generateSignedUrlUMKM(data.gambar_url)
          data.gambar_url = signedUrl
        }
        setUmkm(data as UMKM)
      } else {
        // UMKM not found, redirect to UMKM list
        navigate('/public/umkm')
      }
    } catch (error) {
      console.error('Error fetching UMKM by slug:', error)
      navigate('/public/umkm')
    } finally {
      setLoading(false)
    }
  }

  const displayPhoneNumber = (phone: string) => {
    // Format phone number for display (convert 62 to 0)
    let formatted = phone.replace(/\D/g, '') // Remove non-digits
    if (formatted.startsWith('62')) {
      formatted = '0' + formatted.substring(2) // Replace leading 62 with 0
    } else if (!formatted.startsWith('0')) {
      formatted = '0' + formatted // Add leading 0 if not present
    }
    return formatted
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

  const getTagBadges = (tagString: string) => {
    if (!tagString) return null
    
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Memuat detail UMKM...</div>
        </div>
      </div>
    )
  }

  if (!umkm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">UMKM tidak ditemukan</div>
          <Button onClick={() => navigate('/public/umkm')} className="mt-4">
            Kembali ke Daftar UMKM
          </Button>
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
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
                onClick={() => navigate('/public/umkm')}
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
          {umkm.gambar_url && (
            <>
              <img
                src={umkm.gambar_url}
                alt={umkm.nama_umkm}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="border-b border-gray-200"></div>
            </>
          )}
          
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {umkm.nama_umkm}
              </h1>
              
              {umkm.tag && (
                <div className="mb-4">
                  {getTagBadges(umkm.tag)}
                </div>
              )}
              
              {umkm.warga_new && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Pemilik: {umkm.warga_new.nama_suami} {umkm.warga_new.nama_istri && `& ${umkm.warga_new.nama_istri}`}</span>
                </div>
              )}
            </div>
            
            {umkm.deskripsi && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Deskripsi</h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={createSafeHtml(umkm.deskripsi)} />
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Informasi Kontak */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kontak</h3>
                <div className="space-y-3">
                  {umkm.nomor_telepon && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>{displayPhoneNumber(umkm.nomor_telepon)}</span>
                    </div>
                  )}
                  
                  {umkm.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{umkm.email}</span>
                    </div>
                  )}
                  
                  {umkm.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-5 w-5 mr-3 flex-shrink-0" />
                      <a 
                        href={umkm.website.startsWith('http') ? umkm.website : `https://${umkm.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate"
                      >
                        {umkm.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Informasi Lokasi & Operasional */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Lokasi & Operasional</h3>
                <div className="space-y-3">
                  {umkm.alamat && (
                    <div className="flex items-start text-gray-600">
                      <MapPin className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                      <span>{umkm.alamat}</span>
                    </div>
                  )}
                  
                  {umkm.jam_operasional && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>{umkm.jam_operasional}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            {umkm.nomor_telepon && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.open(getWhatsAppLink(umkm.nomor_telepon!, umkm.nama_umkm), '_blank')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Hubungi via WhatsApp
                  </Button>
                  
                  {umkm.email && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`mailto:${umkm.email}`, '_blank')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Kirim Email
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}