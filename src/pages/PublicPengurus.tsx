import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  foto_url?: string | null
}

export default function PublicPengurus() {
  const { strukturList, loading, fetchAvailablePeriods, fetchStrukturByPeriode } = useStrukturPengurus()
  const { settings } = useSettings()
  const [selectedPeriode, setSelectedPeriode] = useState<string>("")
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])

  const namaPerumahan = settings.nama_perumahan || "Perumahan GBR"

  // Load available periods on component mount
  useEffect(() => {
    const loadPeriods = async () => {
      const periods = await fetchAvailablePeriods()
      setAvailablePeriods(periods)
      
      // Set default period based on current year
      if (periods.length > 0) {
        const currentYear = new Date().getFullYear()
        
        // Find period that includes current year
        const currentPeriod = periods.find(period => {
          const [startYear, endYear] = period.split('-').map(Number)
          return currentYear >= startYear && currentYear <= endYear
        })
        
        // If current year period exists, use it; otherwise use the most recent one
        setSelectedPeriode(currentPeriod || periods[0])
      }
    }
    
    loadPeriods()
  }, [])

  // Load struktur data when selected period changes
  useEffect(() => {
    if (selectedPeriode) {
      fetchStrukturByPeriode(selectedPeriode)
    }
  }, [selectedPeriode])

  // Handle period change
  const handlePeriodeChange = (periode: string) => {
    setSelectedPeriode(periode)
  }

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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">{namaPerumahan}</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Struktur Pengurus Paguyuban</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-2">
                <Link to="/" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Beranda
                  </Button>
                </Link>
                <Link to="/public/artikel" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    Artikel & Berita
                  </Button>
                </Link>
                <Link to="/cms/login" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">Login Sistem</Button>
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
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Bagan organisasi pengurus paguyuban {namaPerumahan}
            </p>
            
            {/* Periode Dropdown */}
            {availablePeriods.length > 0 && (
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-3">
                  <label htmlFor="periode-select" className="text-sm font-medium text-gray-700">
                    Pilih Periode:
                  </label>
                  <Select value={selectedPeriode} onValueChange={handlePeriodeChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Pilih periode kepengurusan" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePeriods.map(periode => (
                        <SelectItem key={periode} value={periode}>
                          {periode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {strukturList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {selectedPeriode 
                  ? `Belum ada struktur pengurus untuk periode ${selectedPeriode}`
                  : "Belum ada struktur pengurus yang dipublikasikan"
                }
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
                              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden border-2 border-primary/20">
                                {pengurus.foto_url ? (
                                  <img 
                                    src={pengurus.foto_url}
                                    alt={`Foto ${pengurus.nama_pengurus}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to avatar with initials if photo fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'block';
                                    }}
                                  />
                                ) : null}
                                <img 
                                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(pengurus.nama_pengurus)}&background=3b82f6&color=ffffff&size=80&bold=true`}
                                  alt={`Avatar ${pengurus.nama_pengurus}`}
                                  className={`w-full h-full object-cover ${pengurus.foto_url ? 'hidden' : 'block'}`}
                                  onError={(e) => {
                                    // Final fallback to User icon if avatar service also fails
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                                <div className="w-full h-full hidden items-center justify-center">
                                  <User className="w-10 h-10 text-primary" />
                                </div>
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
                © 2025 {namaPerumahan}. All rights reserved.
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