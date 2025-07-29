import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { useToast } from "@/hooks/use-toast"

interface Warga {
  id: string
  blok_rumah: string
  nama_suami?: string
  nama_istri?: string
  status_aktif: boolean
}

interface TipeIuran {
  id: string
  nama: string
  nominal: number
}

interface PaymentStatus {
  warga: Warga
  hasPaid: boolean
  tipeIuranPaid: string[]
  totalPaid: number
}

const months = [
  { value: "1", label: "Januari" }, { value: "2", label: "Februari" }, 
  { value: "3", label: "Maret" }, { value: "4", label: "April" }, 
  { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
  { value: "7", label: "Juli" }, { value: "8", label: "Agustus" }, 
  { value: "9", label: "September" }, { value: "10", label: "Oktober" }, 
  { value: "11", label: "November" }, { value: "12", label: "Desember" }
]

const years = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - 5 + i
  return { value: year.toString(), label: year.toString() }
})

export default function PaymentStatusTable() {
  const [wargaList, setWargaList] = useState<Warga[]>([])
  const [tipeIuranList, setTipeIuranList] = useState<TipeIuran[]>([])
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedTipeIuran, setSelectedTipeIuran] = useState<string>("all")
  
  const { fetchWarga, fetchTipeIuran, fetchIuran } = useSupabaseData()
  const { toast } = useToast()

  const loadPaymentStatus = async () => {
    try {
      setLoading(true)
      
      const [wargaData, tipeIuranData, iuranData] = await Promise.all([
        fetchWarga(),
        fetchTipeIuran(),
        fetchIuran()
      ])
      
      setWargaList(wargaData.filter((w: Warga) => w.status_aktif))
      setTipeIuranList(tipeIuranData)
      
      // Filter iuran berdasarkan bulan dan tahun yang dipilih
      const filteredIuran = iuranData.filter((iuran: any) => 
        iuran.bulan === selectedMonth && 
        iuran.tahun === selectedYear &&
        iuran.status_verifikasi === 'verified' &&
        (selectedTipeIuran === "all" || iuran.tipe_iuran.id === selectedTipeIuran)
      )
      
      // Buat status pembayaran untuk setiap warga
      const statuses: PaymentStatus[] = wargaData
        .filter((w: Warga) => w.status_aktif)
        .map((warga: Warga) => {
          const wargaPayments = filteredIuran.filter((iuran: any) => iuran.warga_id === warga.id)
          const tipeIuranPaid = wargaPayments.map((iuran: any) => iuran.tipe_iuran.nama)
          const totalPaid = wargaPayments.reduce((sum: number, iuran: any) => sum + iuran.nominal, 0)
          
          let hasPaid = false
          if (selectedTipeIuran === "all") {
            hasPaid = wargaPayments.length > 0
          } else {
            hasPaid = wargaPayments.some((iuran: any) => iuran.tipe_iuran.id === selectedTipeIuran)
          }
          
          return {
            warga,
            hasPaid,
            tipeIuranPaid,
            totalPaid
          }
        })
      
      setPaymentStatuses(statuses)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat status pembayaran",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPaymentStatus()
  }, [selectedMonth, selectedYear, selectedTipeIuran])

  const getWargaDisplayName = (nama_suami?: string, nama_istri?: string) => {
    const names = []
    if (nama_suami) names.push(nama_suami)
    if (nama_istri) names.push(nama_istri)
    return names.length > 0 ? names.join(' & ') : 'Tidak ada nama'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const totalWarga = paymentStatuses.length
  const wargaSudahBayar = paymentStatuses.filter(status => status.hasPaid).length
  const wargaBelumBayar = totalWarga - wargaSudahBayar
  const persentaseSudahBayar = totalWarga > 0 ? Math.round((wargaSudahBayar / totalWarga) * 100) : 0

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat status pembayaran...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Status Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Bulan</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Tahun</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Tipe Iuran</label>
              <Select value={selectedTipeIuran} onValueChange={setSelectedTipeIuran}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe Iuran</SelectItem>
                  {tipeIuranList.map(tipe => (
                    <SelectItem key={tipe.id} value={tipe.id}>
                      {tipe.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">{totalWarga}</div>
            <p className="text-sm text-muted-foreground">Total Warga</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{wargaSudahBayar}</div>
            <p className="text-sm text-muted-foreground">Sudah Bayar</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{wargaBelumBayar}</div>
            <p className="text-sm text-muted-foreground">Belum Bayar</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{persentaseSudahBayar}%</div>
            <p className="text-sm text-muted-foreground">Tingkat Pembayaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Status Pembayaran {months.find(m => m.value === selectedMonth.toString())?.label} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Warga</TableHead>
                <TableHead>Blok Rumah</TableHead>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead>Tipe Iuran Dibayar</TableHead>
                <TableHead>Total Dibayar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentStatuses.map((status, index) => (
                <TableRow key={status.warga.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {getWargaDisplayName(status.warga.nama_suami, status.warga.nama_istri)}
                  </TableCell>
                  <TableCell>{status.warga.blok_rumah}</TableCell>
                  <TableCell>
                    <Badge variant={status.hasPaid ? "default" : "destructive"}>
                      {status.hasPaid ? "Sudah Bayar" : "Belum Bayar"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {status.tipeIuranPaid.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {status.tipeIuranPaid.map((tipe, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tipe}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {status.totalPaid > 0 ? formatCurrency(status.totalPaid) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}