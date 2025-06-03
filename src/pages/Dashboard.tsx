
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, CreditCard, AlertCircle } from "lucide-react"

const iuranData = [
  { bulan: 'Jan', sampah: 4000000, kas: 2000000 },
  { bulan: 'Feb', sampah: 3000000, kas: 1800000 },
  { bulan: 'Mar', sampah: 4500000, kas: 2200000 },
  { bulan: 'Apr', sampah: 4200000, kas: 2100000 },
  { bulan: 'Mei', sampah: 3800000, kas: 1900000 },
  { bulan: 'Jun', sampah: 4100000, kas: 2000000 },
]

const statusData = [
  { name: 'Sudah Bayar', value: 85, color: '#22c55e' },
  { name: 'Belum Bayar', value: 15, color: '#ef4444' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview data iuran sampah dan kas perumahan GBR
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Warga
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground">
              +2 dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Iuran Bulan Ini
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 6.1 Jt</div>
            <p className="text-xs text-muted-foreground">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tingkat Pembayaran
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +5% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tunggakan
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">18</div>
            <p className="text-xs text-muted-foreground">
              Warga belum bayar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Trend Iuran Bulanan</CardTitle>
            <CardDescription>
              Perbandingan iuran sampah dan kas 6 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={iuranData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`Rp ${(value as number).toLocaleString('id-ID')}`, '']}
                  labelFormatter={(label) => `Bulan ${label}`}
                />
                <Legend />
                <Bar dataKey="sampah" fill="#22c55e" name="Iuran Sampah" />
                <Bar dataKey="kas" fill="#16a34a" name="Iuran Kas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
            <CardDescription>
              Persentase warga yang sudah/belum bayar iuran bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Transaksi iuran terbaru yang masuk sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { warga: "Budi Santoso", blok: "A-01", jenis: "Iuran Sampah", nominal: "Rp 50.000", waktu: "2 jam lalu" },
              { warga: "Siti Aminah", blok: "B-05", jenis: "Iuran Kas", nominal: "Rp 100.000", waktu: "3 jam lalu" },
              { warga: "Ahmad Fauzi", blok: "C-12", jenis: "Iuran Sampah", nominal: "Rp 50.000", waktu: "5 jam lalu" },
              { warga: "Rina Sari", blok: "A-08", jenis: "Iuran Kas", nominal: "Rp 100.000", waktu: "1 hari lalu" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{item.warga}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.blok} • {item.jenis}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{item.nominal}</p>
                  <p className="text-sm text-muted-foreground">{item.waktu}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
