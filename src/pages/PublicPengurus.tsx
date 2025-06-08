
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

  // Group by level for organization chart
  const groupedByLevel = strukturList.reduce((acc, item) => {
    if (!acc[item.level_jabatan]) {
      acc[item.level_jabatan] = []
    }
    acc[item.level_jabatan].push(item)
    return acc
  }, {} as Record<number, StrukturPengurus[]>)

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 1: return "Ketua Paguyuban"
      case 2: return "Wakil Ketua"
      case 3: return "Koordinator"
      case 4: return "Anggota"
      default: return "Pengurus"
    }
  }

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
                <p className="text-sm text-gray-600">Struktur Pengurus Paguyuban</p>
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
              Struktur Pengurus Paguyuban {namaPerumahan}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Bagan organisasi pengurus paguyuban {namaPerumahan} periode {new Date().getFullYear()}-{new Date().getFullYear() + 1}
            </p>
          </div>

          {strukturList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                Belum ada struktur pengurus yang dipublikasikan
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Organization Chart Layout */}
              {Object.keys(groupedByLevel)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(level => (
                  <div key={level} className="relative">
                    {/* Level Title */}
                    <div className="text-center mb-6">
                      <Badge 
                        className={`${getLevelBadgeColor(parseInt(level))} text-white px-6 py-3 text-lg`}
                      >
                        {getLevelTitle(parseInt(level))}
                      </Badge>
                    </div>
                    
                    {/* Organization Chart Cards */}
                    <div className={`flex justify-center items-start gap-4 flex-wrap ${
                      parseInt(level) === 1 ? 'justify-center' : 
                      parseInt(level) === 2 ? 'justify-center max-w-4xl mx-auto' :
                      'justify-center'
                    }`}>
                      {groupedByLevel[parseInt(level)].map((pengurus, index) => (
                        <div key={pengurus.id} className="relative">
                          {/* Connecting Lines for org chart */}
                          {parseInt(level) > 1 && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
                          )}
                          
                          <Card className="hover:shadow-xl transition-all duration-300 bg-white border-2 border-gray-100 w-72">
                            <CardHeader className="text-center pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
                              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <User className="w-10 h-10 text-primary" />
                              </div>
                              <CardTitle className="text-xl text-gray-900 font-bold">{pengurus.nama_pengurus}</CardTitle>
                              <p className="text-primary font-semibold text-lg">{pengurus.jabatan}</p>
                            </CardHeader>
                            
                            <CardContent className="space-y-3 text-center">
                              {pengurus.blok_rumah && (
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>Blok {pengurus.blok_rumah}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
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
                        </div>
                      ))}
                    </div>

                    {/* Connecting lines between levels */}
                    {parseInt(level) < Math.max(...Object.keys(groupedByLevel).map(k => parseInt(k))) && (
                      <div className="flex justify-center mt-8">
                        <div className="w-px h-8 bg-gray-300"></div>
                      </div>
                    )}
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
