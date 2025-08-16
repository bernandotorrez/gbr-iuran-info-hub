import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, CreditCard, AlertCircle, Wallet, Calendar, Filter } from "lucide-react"
import { useSupabaseData, DashboardStats } from "@/hooks/useSupabaseData"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Dashboard() {
  const { dashboardStats, loading, fetchDashboardStats, fetchTipeIuran } = useSupabaseData();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedTipeIuran, setSelectedTipeIuran] = useState<string>("semua");
  const [tipeIuranList, setTipeIuranList] = useState<any[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState<DashboardStats>({
    total_warga: 0,
    total_kas_masuk: 0,
    total_kas_keluar: 0,
    saldo_kas: 0,
    iuran_bulan_ini: 0,
    filter_month: new Date().getMonth() + 1,
    filter_year: new Date().getFullYear(),
    tingkat_pembayaran: 0,
    total_warga_sudah_bayar: 0,
    total_warga_belum_bayar: 0,
    percent_warga_sudah_bayar: 0,
    percent_warga_belum_bayar: 0,
    sisa_saldo_kas: 0
  })

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const statusData = [
    { name: 'Sudah Bayar', value: dashboardStats.total_warga_sudah_bayar || 0, color: '#22c55e' },
    { name: 'Belum Bayar', value: dashboardStats.total_warga_belum_bayar || 0, color: '#ef4444' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const loadTipeIuran = async () => {
    try {
      const data = await fetchTipeIuran();
      setTipeIuranList(data);
    } catch (error) {
      console.error('Error loading tipe iuran:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    loadTipeIuran();
    // Load initial dashboard stats
    fetchDashboardStats();
  }, []);

  // Auto-refresh data when filter values change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const loadDashboardData = async () => {
        setIsFiltering(true);
        try {
          const dashboardStatsResult = await fetchDashboardStats(
            selectedMonth, 
            selectedYear, 
            selectedTipeIuran !== "semua" ? selectedTipeIuran : undefined
          );

          if (dashboardStatsResult) {
            setDashboardFilter(dashboardStatsResult)
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setIsFiltering(false);
        }
      };

      loadDashboardData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [selectedMonth, selectedYear, selectedTipeIuran]);

  const handleFilterChange = async () => {
    console.log('Applying filter:', { selectedMonth, selectedYear, selectedTipeIuran });
    setIsFiltering(true);
    
    try {
      // Pass the correct parameters to fetchDashboardStats
      await fetchDashboardStats(
        selectedMonth, 
        selectedYear, 
        selectedTipeIuran !== "semua" ? selectedTipeIuran : undefined
      );
    } catch (error) {
      console.error('Error applying filter:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  const resetFilter = async () => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSelectedTipeIuran("semua");
    setIsFiltering(true);
    
    try {
      await fetchDashboardStats(currentMonth, currentYear);
    } catch (error) {
      console.error('Error resetting filter:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  const months = [
    { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, 
    { value: 3, label: "Maret" }, { value: 4, label: "April" }, 
    { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
    { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, 
    { value: 9, label: "September" }, { value: 10, label: "Oktober" }, 
    { value: 11, label: "November" }, { value: 12, label: "Desember" }
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 md:p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Overview data iuran sampah dan kas perumahan GBR
        </p>
      </div>

      {/* Filter Section */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTipeIuran} onValueChange={setSelectedTipeIuran}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipe Iuran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Tipe Iuran</SelectItem>
                {tipeIuranList.map((tipe) => (
                  <SelectItem key={tipe.id} value={tipe.id}>
                    {tipe.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={resetFilter} variant="outline" size="sm" disabled={isFiltering}>
              {isFiltering ? 'Memuat...' : 'Reset'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Total Warga
            </CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{dashboardStats.total_warga}</div>
            <p className="text-xs text-muted-foreground">
              Total semua warga
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Kas Masuk
            </CardTitle>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm md:text-2xl font-bold text-primary">
              {formatCurrency(dashboardStats.total_kas_masuk)}
            </div>
            <p className="text-xs text-muted-foreground">
              Periode {months.find(m => m.value === dashboardStats.filter_month)?.label} {dashboardStats.filter_year}
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Kas Keluar
            </CardTitle>
            <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm md:text-2xl font-bold text-destructive">
              {formatCurrency(dashboardStats.total_kas_keluar)}
            </div>
            <p className="text-xs text-muted-foreground">
              Periode {months.find(m => m.value === dashboardStats.filter_month)?.label} {dashboardStats.filter_year}
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">
              Saldo Kas
            </CardTitle>
            <Wallet className="h-3 w-3 md:h-4 md:w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm md:text-2xl font-bold text-primary">
              {formatCurrency(dashboardStats.saldo_kas)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo {months.find(m => m.value === dashboardStats.filter_month)?.label} {dashboardStats.filter_year}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Status Pembayaran</CardTitle>
            <CardDescription className="text-sm">
              Persentase warga yang sudah/belum bayar iuran periode ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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
                <Tooltip 
                  formatter={(value, name) => [`${value} Warga`, name]}
                  labelFormatter={() => "Status Pembayaran"}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Ringkasan Keuangan</CardTitle>
            <CardDescription className="text-sm">
              Total iuran yang masuk periode ini: {dashboardStats.iuran_bulan_ini} transaksi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 md:p-4 border rounded-lg">
              <div>
                <p className="font-medium text-sm md:text-base">Total Kas Masuk</p>
                <p className="text-xs md:text-sm text-muted-foreground">Periode {months.find(m => m.value === dashboardStats.filter_month)?.label} {dashboardStats.filter_year}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-primary text-sm md:text-base">
                  {formatCurrency(dashboardStats.total_kas_masuk)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 md:p-4 border rounded-lg">
              <div>
                <p className="font-medium text-sm md:text-base">Total Kas Keluar</p>
                <p className="text-xs md:text-sm text-muted-foreground">Periode {months.find(m => m.value === dashboardStats.filter_month)?.label} {dashboardStats.filter_year}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-destructive text-sm md:text-base">
                  {formatCurrency(dashboardStats.total_kas_keluar)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 md:p-4 border rounded-lg bg-primary/5">
              <div>
                <p className="font-medium text-sm md:text-base">Saldo Akhir</p>
                <p className="text-xs md:text-sm text-muted-foreground">Kas masuk - kas keluar</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-sm md:text-base">
                  {formatCurrency(dashboardStats.saldo_kas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
