
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
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Toaster />
          <Sonner />
          <SpeedInsights />
          <PWAInstallPrompt />
          <Routes>
            <Route path="/" element={<CompanyProfile />} />
            <Route path="/cms/login" element={<LoginPage />} />
            <Route path="/cms/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/public/artikel" element={<PublicArtikel />} />
            <Route path="/public/pengurus" element={<PublicPengurus />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/cms" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/warga" element={
              <ProtectedRoute>
                <Layout>
                  <MasterWarga />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/tipe-iuran" element={
              <ProtectedRoute>
                <Layout>
                  <MasterTipeIuran />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/master-kategori-kas" element={
              <ProtectedRoute>
                <Layout>
                  <MasterKategoriKas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/input-iuran" element={
              <ProtectedRoute>
                <Layout>
                  <InputIuran />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/output-kas" element={
              <ProtectedRoute>
                <Layout>
                  <OutputKas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/laporan" element={
              <ProtectedRoute>
                <Layout>
                  <LaporanIuran />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/artikel" element={
              <ProtectedRoute>
                <Layout>
                  <ArtikelBerita />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/buku-tamu" element={
              <ProtectedRoute>
                <Layout>
                  <BukuTamu />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/struktur-pengurus" element={
              <ProtectedRoute>
                <Layout>
                  <StrukturPengurus />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cms/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
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
