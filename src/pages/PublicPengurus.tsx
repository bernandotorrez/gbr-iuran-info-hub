
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Calendar } from "lucide-react"
import { useStrukturPengurus } from "@/hooks/useStrukturPengurus"

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Memuat struktur pengurus...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Struktur Pengurus Perumahan GBR
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Struktur organisasi pengurus Perumahan GBR periode {new Date().getFullYear()}-{new Date().getFullYear() + 1}
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
            {Object.keys(groupedByLevel)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(level => (
                <div key={level} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge 
                      className={`${getLevelBadgeColor(parseInt(level))} text-white px-3 py-1 text-sm`}
                    >
                      Level {level}
                    </Badge>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {parseInt(level) === 1 ? "Pimpinan Utama" :
                       parseInt(level) === 2 ? "Pimpinan" :
                       parseInt(level) === 3 ? "Koordinator" :
                       parseInt(level) === 4 ? "Anggota" : "Pengurus"}
                    </h2>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupedByLevel[parseInt(level)].map((pengurus) => (
                      <Card key={pengurus.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{pengurus.nama_pengurus}</CardTitle>
                              <p className="text-sm text-primary font-medium">{pengurus.jabatan}</p>
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
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">Warga:</p>
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
    </div>
  )
}
