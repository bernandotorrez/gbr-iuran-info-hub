import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Calendar, TrendingUp, Users, CreditCard, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

const monthlyData = [
  { bulan: 'Jan', pemasukan: 15000000, pengeluaran: 8000000, saldo: 7000000 },
  { bulan: 'Feb', pemasukan: 14500000, pengeluaran: 7500000, saldo: 7000000 },
  { bulan: 'Mar', pemasukan: 16000000, pengeluaran: 9000000, saldo: 7000000 },
  { bulan: 'Apr', pemasukan: 15500000, pengeluaran: 8500000, saldo: 7000000 },
  { bulan: 'Mei', pemasukan: 15800000, pengeluaran: 8200000, saldo: 7600000 },
  { bulan: 'Jun', pemasukan: 16200000, pengeluaran: 8800000, saldo: 7400000 },
]

const iuranTypeData = [
  { name: 'Iuran Sampah', value: 35, color: '#22c55e' },
  { name: 'Kas Lingkungan', value: 40, color: '#3b82f6' },
  { name: 'Iuran Keamanan', value: 25, color: '#f59e0b' },
]

const recentTransactions = [
  { id: 1, warga: 'Ahmad Budiman', alamat: 'Blok A-12', jenis: 'Iuran Sampah', nominal: 25000, tanggal: '2024-01-15', status: 'Lunas' },
  { id: 2, warga: 'Siti Nurhaliza', alamat: 'Blok B-05', jenis: 'Kas Lingkungan', nominal: 50000, tanggal: '2024-01-15', status: 'Lunas' },
  { id: 3, warga: 'Budi Santoso', alamat: 'Blok C-08', jenis: 'Iuran Keamanan', nominal: 100000, tanggal: '2024-01-14', status: 'Belum Lunas' },
  { id: 4, warga: 'Dewi Sartika', alamat: 'Blok A-05', jenis: 'Iuran Sampah', nominal: 25000, tanggal: '2024-01-14', status: 'Lunas' },
  { id: 5, warga: 'Eko Prasetyo', alamat: 'Blok B-12', jenis: 'Kas Lingkungan', nominal: 50000, tanggal: '2024-01-13', status: 'Lunas' },
]

export default function LaporanIuran() {
  const [filterPeriod, setFilterPeriod] = useState("2024")
  const [filterType, setFilterType] = useState("semua")
  const { toast } = useToast()

  const handleExportPDF = () => {
    toast({ title: "Berhasil", description: "Laporan PDF berhasil diunduh" })
  }

  const handleExportExcel = () => {
    toast({ title: "Berhasil", description: "Laporan Excel berhasil diunduh" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
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
              <p className="text-2xl font-bold">{formatCurrency(92000000)}</p>
              <p className="text-xs text-green-600">+12% dari bulan lalu</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-bold">{formatCurrency(50000000)}</p>
              <p className="text-xs text-red-600">+5% dari bulan lalu</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Saldo Kas</p>
              <p className="text-2xl font-bold">{formatCurrency(42000000)}</p>
              <p className="text-xs text-blue-600">Kondisi sehat</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Tingkat Pembayaran</p>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-purple-600">Target: 90%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls - Updated with better dark mode support */}
      <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-foreground">Periode:</label>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="custom-select text-sm"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-foreground">Jenis Iuran:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="custom-select text-sm"
          >
            <option value="semua">Semua Jenis</option>
            <option value="sampah">Iuran Sampah</option>
            <option value="kas">Kas Lingkungan</option>
            <option value="keamanan">Iuran Keamanan</option>
          </select>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Pemasukan vs Pengeluaran */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Tren Pemasukan vs Pengeluaran</h3>
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={iuranTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {iuranTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafik Saldo Kas */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Tren Saldo Kas</h3>
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
          <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
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
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.warga}</TableCell>
                <TableCell>{transaction.alamat}</TableCell>
                <TableCell>{transaction.jenis}</TableCell>
                <TableCell>{formatCurrency(transaction.nominal)}</TableCell>
                <TableCell>{new Date(transaction.tanggal).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'Lunas' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {transaction.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
