
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider"; // Add this import
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SecurityRoute from "./components/auth/SecurityRoute";
import LoginPage from "./components/auth/LoginPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import Dashboard from "./pages/Dashboard";
import MasterWarga from "./pages/MasterWarga";
import MasterTipeIuran from "./pages/MasterTipeIuran";
import MasterKategoriKas from "./pages/MasterKategoriKas";
import InputIuran from "./pages/InputIuran";
import OutputKas from "./pages/OutputKas";
import LaporanIuran from "./pages/LaporanIuran";
import ArtikelBerita from "./pages/ArtikelBerita";
import PublicArtikel from "./pages/PublicArtikel";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CompanyProfile from "./pages/CompanyProfile";
import StrukturPengurus from "./pages/StrukturPengurus";
import PublicPengurus from "./pages/PublicPengurus";
import BukuTamu from "./pages/BukuTamu";
import { SpeedInsights } from "@vercel/speed-insights/react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Toaster />
          <Sonner />
          <SpeedInsights />
          <Routes>
            <Route path="/" element={<CompanyProfile />} />
            <Route path="/cms/login" element={<LoginPage />} />
            <Route path="/cms/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/public/artikel" element={<PublicArtikel />} />
            <Route path="/public/pengurus" element={<PublicPengurus />} />
            <Route path="/cms/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/warga" element={<MasterWarga />} />
                    <Route path="/tipe-iuran" element={<MasterTipeIuran />} />
                    <Route path="/master-kategori-kas" element={<MasterKategoriKas />} />
                    <Route path="/input-iuran" element={<InputIuran />} />
                    <Route path="/output-kas" element={<OutputKas />} />
                    <Route path="/laporan" element={<LaporanIuran />} />
                    <Route path="/artikel" element={<ArtikelBerita />} />
                    <Route path="/buku-tamu" element={
                      <SecurityRoute>
                        <BukuTamu />
                      </SecurityRoute>
                    } />
                    <Route path="/struktur-pengurus" element={<StrukturPengurus />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
