import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Mail, Globe, Clock } from "lucide-react"
import { useSupabaseData } from "@/hooks/useSupabaseData"

export default function PublicUMKMDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { fetchUMKMBySlug } = useSupabaseData()
  const [umkm, setUmkm] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUMKM = async () => {
      if (!slug) return
      
      try {
        setLoading(true)
        const data = await fetchUMKMBySlug(slug)
        setUmkm(data)
      } catch (error) {
        console.error('Error loading UMKM:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUMKM()
  }, [slug, fetchUMKMBySlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!umkm) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">UMKM Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">UMKM yang Anda cari tidak ditemukan atau tidak aktif.</p>
          <Button onClick={() => navigate('/public/umkm')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar UMKM
          </Button>
        </div>
      </div>
    )
  }

  const wargaName = umkm.warga_new 
    ? `${umkm.warga_new.nama_suami}${umkm.warga_new.nama_istri ? ` & ${umkm.warga_new.nama_istri}` : ''}`
    : ''

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/public/umkm')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar UMKM
        </Button>

        <div className="space-y-6">
          {umkm.gambar_url && (
            <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg">
              <img 
                src={umkm.gambar_url} 
                alt={umkm.nama_umkm}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">{umkm.nama_umkm}</CardTitle>
              {wargaName && (
                <p className="text-muted-foreground">
                  Pemilik: {wargaName}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informasi Kontak</h3>
                  
                  {umkm.nomor_telepon && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{umkm.nomor_telepon}</span>
                    </div>
                  )}

                  {umkm.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>{umkm.email}</span>
                    </div>
                  )}

                  {umkm.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={umkm.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {umkm.website}
                      </a>
                    </div>
                  )}

                  {umkm.jam_operasional && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span>{umkm.jam_operasional}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Status</h3>
                  <Badge variant={umkm.status === 'aktif' ? 'default' : 'secondary'}>
                    {umkm.status === 'aktif' ? 'Aktif' : 'Non-aktif'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {umkm.deskripsi && (
            <Card>
              <CardHeader>
                <CardTitle>Tentang {umkm.nama_umkm}</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-slate max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: umkm.deskripsi }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}