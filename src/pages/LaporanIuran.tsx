
import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Calendar, TrendingUp, Users, CreditCard, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface Transaction {
  id: string
  warga: { nama: string; alamat: string; rt_rw: string }
  tipe_iuran: { nama: string }
  nominal: number
  tanggal_bayar: string
  status_verifikasi: string
}

export default function LaporanIuran() {
  const [filterPeriod, setFilterPeriod] = useState(new Date().getFullYear().toString())
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [kasKeluarData, setKasKeluarData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { fetchIuran, fetchKasKeluar, fetchDashboardStats, dashboardStats } = useSupabaseData()

  useEffect(() => {
    loadData()
  }, [filterPeriod, filterMonth])

  const loadData = async () => {
    try {
      setLoading(true)
      const month = parseInt(filterMonth)
      const year = parseInt(filterPeriod)
      
      const [iuranData, kasKeluarTransactions] = await Promise.all([
        fetchIuran(month, year),
        fetchKasKeluar(month, year)
      ])
      
      await fetchDashboardStats(month, year)
      
      setTransactions(iuranData)
      setKasKeluarData(kasKeluarTransactions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(18)
    doc.text('Laporan Iuran', 14, 22)
    
    // Period info
    doc.setFontSize(12)
    const monthName = months.find(m => m.value === filterMonth)?.label
    doc.text(`Periode: ${monthName} ${filterPeriod}`, 14, 35)
    
    // Summary statistics
    doc.text(`Total Pemasukan: ${formatCurrency(totalPemasukan)}`, 14, 48)
    doc.text(`Total Pengeluaran: ${formatCurrency(totalPengeluaran)}`, 14, 55)
    doc.text(`Saldo Kas: ${formatCurrency(saldoKas)}`, 14, 62)
    
    // Table data
    const tableData = transactions.map(transaction => [
      transaction.warga?.nama || '',
      transaction.warga?.alamat || '',
      transaction.tipe_iuran?.nama || '',
      formatCurrency(transaction.nominal),
      new Date(transaction.tanggal_bayar).toLocaleDateString('id-ID'),
      transaction.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'
    ])

    ;(doc as any).autoTable({
      head: [['Warga', 'Alamat', 'Jenis Iuran', 'Nominal', 'Tanggal', 'Status']],
      body: tableData,
      startY: 75,
    })

    doc.save(`laporan-iuran-${monthName}-${filterPeriod}.pdf`)
    toast({ title: "Berhasil", description: "Laporan PDF berhasil diunduh" })
  }

  const handleExportExcel = () => {
    const monthName = months.find(m => m.value === filterMonth)?.label
    
    // Summary data
    const summaryData = [
      { Keterangan: 'Total Pemasukan', Nilai: totalPemasukan },
      { Keterangan: 'Total Pengeluaran', Nilai: totalPengeluaran },
      { Keterangan: 'Saldo Kas', Nilai: saldoKas },
      { Keterangan: 'Tingkat Pembayaran', Nilai: `${tingkatPembayaran}%` }
    ]

    // Transaction data
    const transactionData = transactions.map(transaction => ({
      Warga: transaction.warga?.nama,
      Alamat: transaction.warga?.alamat,
      'Jenis Iuran': transaction.tipe_iuran?.nama,
      Nominal: transaction.nominal,
      Tanggal: new Date(transaction.tanggal_bayar).toLocaleDateString('id-ID'),
      Status: transaction.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'
    }))

    const wb = XLSX.utils.book_new()
    
    // Add summary sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')
    
    // Add transactions sheet
    const wsTransactions = XLSX.utils.json_to_sheet(transactionData)
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transaksi')
    
    XLSX.writeFile(wb, `laporan-iuran-${monthName}-${filterPeriod}.xlsx`)
    toast({ title: "Berhasil", description: "Laporan Excel berhasil diunduh" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const months = [
    { value: "1", label: "Januari" }, { value: "2", label: "Februari" }, 
    { value: "3", label: "Maret" }, { value: "4", label: "April" }, 
    { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "Agustus" }, 
    { value: "9", label: "September" }, { value: "10", label: "Oktober" }, 
    { value: "11", label: "November" }, { value: "12", label: "Desember" }
  ]

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString())

  // Calculate stats from real data
  const totalPemasukan = transactions.reduce((sum, t) => sum + t.nominal, 0)
  const totalPengeluaran = kasKeluarData.filter(k => k.status_persetujuan === 'approved').reduce((sum, k) => sum + k.nominal, 0)
  const saldoKas = totalPemasukan - totalPengeluaran
  const tingkatPembayaran = Math.round((transactions.length / Math.max(dashboardStats.total_warga, 1)) * 100)

  // Create chart data from real transactions
  const monthlyData = [
    { 
      bulan: months.find(m => m.value === filterMonth)?.label || filterMonth, 
      pemasukan: totalPemasukan, 
      pengeluaran: totalPengeluaran, 
      saldo: saldoKas 
    }
  ]

  // Group transactions by type for pie chart
  const iuranTypeData = transactions.reduce((acc: any[], transaction) => {
    const existing = acc.find(item => item.name === transaction.tipe_iuran.nama)
    if (existing) {
      existing.value += transaction.nominal
    } else {
      acc.push({
        name: transaction.tipe_iuran.nama,
        value: transaction.nominal,
        color: '#22c55e'
      })
    }
    return acc
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-48">Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Laporan Iuran</h1>
          <p className="text-muted-foreground">Dashboard dan laporan keuangan perumahan</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pemasukan</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPemasukan)}</p>
              <p className="text-xs text-green-600">Periode ini</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPengeluaran)}</p>
              <p className="text-xs text-red-600">Periode ini</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Saldo Kas</p>
              <p className="text-2xl font-bold">{formatCurrency(saldoKas)}</p>
              <p className="text-xs text-blue-600">Saldo periode</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Tingkat Pembayaran</p>
              <p className="text-2xl font-bold">{tingkatPembayaran}%</p>
              <p className="text-xs text-purple-600">Dari total warga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-foreground">Bulan:</label>
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-foreground">Tahun:</label>
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Pemasukan vs Pengeluaran */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Pemasukan vs Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="pemasukan" fill="#22c55e" name="Pemasukan" />
              <Bar dataKey="pengeluaran" fill="#ef4444" name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart Jenis Iuran */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Distribusi Jenis Iuran</h3>
          {iuranTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={iuranTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {iuranTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Tidak ada data untuk periode ini
            </div>
          )}
        </div>
      </div>

      {/* Grafik Saldo Kas */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Saldo Kas Periode</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" />
            <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#22c55e" 
              strokeWidth={3}
              name="Saldo Kas"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Transaksi Periode Ini</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Warga</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Jenis Iuran</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.warga?.nama}</TableCell>
                  <TableCell>{transaction.warga?.alamat}</TableCell>
                  <TableCell>{transaction.tipe_iuran?.nama}</TableCell>
                  <TableCell>{formatCurrency(transaction.nominal)}</TableCell>
                  <TableCell>{new Date(transaction.tanggal_bayar).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status_verifikasi === 'verified' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {transaction.status_verifikasi === 'verified' ? 'Terverifikasi' : 'Pending'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Tidak ada transaksi untuk periode ini
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
