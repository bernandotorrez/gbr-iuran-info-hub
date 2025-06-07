
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, MapPin, Calendar, ArrowLeft, Building2 } from "lucide-react"
import { useStrukturPengurus } from "@/hooks/useStrukturPengurus"
import { Link } from "react-router-dom"
import { useSettings } from "@/hooks/useSettings"

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
  warga?: {
    nama: string
    alamat: string
    rt_rw: string
  }
}

export default function PublicPengurus() {
  const { strukturList, loading, fetchStrukturPengurus } = useStrukturPengurus()
  const { settings } = useSettings()

  const namaPerumahan = settings.nama_perumahan || "Perumahan GBR"

  useEffect(() => {
    fetchStrukturPengurus()
  }, [])

  const getLevelBadgeColor = (level: number) => {
    switch (level) {
      case 1: return "bg-red-500"
      case 2: return "bg-orange-500" 
      case 3: return "bg-yellow-500"
      case 4: return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  // Group by level for better organization
  const groupedByLevel = strukturList.reduce((acc, item) => {
    if (!acc[item.level_jabatan]) {
      acc[item.level_jabatan] = []
    }
    acc[item.level_jabatan].push(item)
    return acc
  }, {} as Record<number, StrukturPengurus[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Memuat struktur pengurus...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{namaPerumahan}</h1>
                <p className="text-sm text-gray-600">Struktur Pengurus</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Button>
              </Link>
              <Link to="/public/artikel">
                <Button variant="outline">Artikel & Berita</Button>
              </Link>
              <Link to="/cms/login">
                <Button>Login Sistem</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Struktur Pengurus {namaPerumahan}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Struktur organisasi pengurus {namaPerumahan} periode {new Date().getFullYear()}-{new Date().getFullYear() + 1}
            </p>
          </div>

          {strukturList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                Belum ada struktur pengurus yang dipublikasikan
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.keys(groupedByLevel)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(level => (
                  <div key={level} className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Badge 
                        className={`${getLevelBadgeColor(parseInt(level))} text-white px-4 py-2 text-base`}
                      >
                        Level {level}
                      </Badge>
                      <h3 className="text-2xl font-semibold text-gray-800">
                        {parseInt(level) === 1 ? "Pimpinan Utama" :
                         parseInt(level) === 2 ? "Pimpinan" :
                         parseInt(level) === 3 ? "Koordinator" :
                         parseInt(level) === 4 ? "Anggota" : "Pengurus"}
                      </h3>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {groupedByLevel[parseInt(level)].map((pengurus) => (
                        <Card key={pengurus.id} className="hover:shadow-lg transition-shadow bg-white">
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-primary" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg text-gray-900">{pengurus.nama_pengurus}</CardTitle>
                                <p className="text-sm text-primary font-medium mt-1">{pengurus.jabatan}</p>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-3">
                            {pengurus.blok_rumah && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>Blok {pengurus.blok_rumah}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Periode {pengurus.periode_mulai} - {pengurus.periode_selesai}</span>
                            </div>
                            
                            {pengurus.warga && (
                              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <p className="font-medium text-gray-800">Warga:</p>
                                <p className="text-xs">{pengurus.warga.rt_rw}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold">{namaPerumahan}</div>
                <div className="text-sm text-gray-400">Hunian Nyaman dan Asri</div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-sm text-gray-400 mb-1">
                © 2024 {namaPerumahan}. All rights reserved.
              </div>
              <div className="text-xs text-gray-500">
                Created by: Bernand Dayamuntari Hermawan (Blok C1-5)
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
