
import { useState, useEffect } from "react";
import { Building2, Users, Shield, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";

export default function CompanyProfile() {
  const { settings, loading: settingsLoading } = useSettings();

  // Default values that will be overridden by settings
  const contactInfo = {
    nama_perumahan: settings.nama_perumahan || "Perumahan GBR",
    alamat_perumahan: settings.alamat_perumahan || "Jl. Perumahan GBR No. 1, Jakarta",
    email_kontak: settings.email_kontak || "info@perumahangbr.com",
    telepon_kontak: settings.telepon_kontak || "+62 21 1234 5678",
    ketua_rt: settings.ketua_rt || "Bapak Ahmad Budiman",
    sekretaris_rt: settings.sekretaris_rt || "Ibu Siti Nurhaliza",
    ketua_paguyuban: settings.ketua_paguyuban || "Bapak Anto",
    sekretaris_paguyuban: settings.sekretaris_paguyuban || "Bapak Anto",
  };

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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">{contactInfo.nama_perumahan}</h1>
                <p className="text-xs sm:text-sm text-gray-600">Hunian Nyaman dan Asri</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-2">
              <Link to="/public/artikel" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  Artikel & Berita
                </Button>
              </Link>
              <Link to="/public/pengurus" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  Struktur Pengurus
                </Button>
              </Link>
              <Link to="/public/umkm" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  Direktori UMKM
                </Button>
              </Link>
              <Link to="/cms/login" className="w-full sm:w-auto">
                <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  Login Sistem
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Selamat Datang di
            <span className="text-primary block">{contactInfo.nama_perumahan}</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Kompleks perumahan modern dengan fasilitas lengkap dan sistem manajemen iuran yang transparan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/public/artikel">
              <Button size="lg" className="w-full sm:w-auto">
                Lihat Artikel & Berita
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/cms/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Akses Sistem Iuran
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Fasilitas & Layanan</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {contactInfo.nama_perumahan} menyediakan berbagai fasilitas modern untuk kenyamanan seluruh penghuni
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Sistem Manajemen Warga</CardTitle>
                <CardDescription>
                  Database warga yang terorganisir dengan baik untuk memudahkan komunikasi dan koordinasi
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Transparansi Keuangan</CardTitle>
                <CardDescription>
                  Sistem iuran digital yang transparan dengan laporan keuangan yang dapat diakses setiap saat
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Fasilitas Umum</CardTitle>
                <CardDescription>
                  Taman bermain, area olahraga, dan fasilitas umum lainnya yang terawat dengan baik
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Tentang {contactInfo.nama_perumahan}</h3>
              <p className="text-gray-600 mb-4">
                {contactInfo.nama_perumahan} adalah kompleks hunian modern yang mengutamakan kenyamanan, keamanan, dan 
                transparansi dalam pengelolaan. Dengan sistem informasi iuran yang terintegrasi, kami 
                memastikan setiap penghuni mendapatkan pelayanan terbaik.
              </p>
              <p className="text-gray-600 mb-6">
                Lokasi strategis dengan akses mudah ke berbagai fasilitas publik seperti sekolah, 
                rumah sakit, dan pusat perbelanjaan membuat {contactInfo.nama_perumahan} menjadi pilihan ideal 
                untuk keluarga modern.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-gray-600">Unit Rumah</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-gray-600">Keamanan</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-6">Informasi Kontak</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">{contactInfo.alamat_perumahan}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">{contactInfo.telepon_kontak}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">{contactInfo.email_kontak}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h5 className="font-semibold text-gray-900 mb-3">Pengurus Paguyuban</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Ketua Paguyuban:</strong> {contactInfo.ketua_paguyuban}</div>
                  <div><strong>Wakil Ketua Paguyuban:</strong> {contactInfo.sekretaris_paguyuban}</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h5 className="font-semibold text-gray-900 mb-3">Jam Operasional Kantor</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Senin - Jumat: 08:00 - 17:00</div>
                  <div>Sabtu: 08:00 - 12:00</div>
                  <div>Minggu: Tutup</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold">{contactInfo.nama_perumahan}</div>
                <div className="text-base text-gray-400">Hunian Nyaman dan Asri</div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-base mb-1">
                © 2025 {contactInfo.nama_perumahan}. All rights reserved.
              </div>
              <div className="text-base text-green-600">
                Created by: Bernand Dayamuntari Hermawan (Blok C1-5)
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
