
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
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
            <Route path="/warga" element={<div>Master Data Warga - Coming Soon</div>} />
            <Route path="/tipe-iuran" element={<div>Master Tipe Iuran - Coming Soon</div>} />
            <Route path="/input-iuran" element={<div>Input Iuran - Coming Soon</div>} />
            <Route path="/output-kas" element={<div>Output Kas - Coming Soon</div>} />
            <Route path="/laporan" element={<div>Laporan Iuran - Coming Soon</div>} />
            <Route path="/artikel" element={<div>Artikel Berita - Coming Soon</div>} />
            <Route path="/settings" element={<div>Pengaturan - Coming Soon</div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
