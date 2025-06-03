
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MasterWarga from "./pages/MasterWarga";
import MasterTipeIuran from "./pages/MasterTipeIuran";
import InputIuran from "./pages/InputIuran";
import OutputKas from "./pages/OutputKas";
import LaporanIuran from "./pages/LaporanIuran";
import ArtikelBerita from "./pages/ArtikelBerita";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/warga" element={<MasterWarga />} />
            <Route path="/tipe-iuran" element={<MasterTipeIuran />} />
            <Route path="/input-iuran" element={<InputIuran />} />
            <Route path="/output-kas" element={<OutputKas />} />
            <Route path="/laporan" element={<LaporanIuran />} />
            <Route path="/artikel" element={<ArtikelBerita />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
