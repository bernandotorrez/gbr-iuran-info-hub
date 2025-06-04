
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Home, Lock, Phone } from 'lucide-react';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(phone, password);
    
    if (error) {
      setError('Nomor telepon atau password salah');
      toast.error('Login gagal!');
    } else {
      toast.success('Login berhasil!');
      navigate('/');
    }
    
    setLoading(false);
  };

  const fillDemoCredentials = (type: 'admin' | 'warga') => {
    if (type === 'admin') {
      setPhone('081234567890');
      setPassword('admin123');
    } else {
      setPhone('081234567891');
      setPassword('warga123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">SI Iuran GBR</h1>
          <p className="text-gray-600 mt-2">Sistem Informasi Iuran Perumahan GBR</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl md:text-2xl">Login</CardTitle>
            <CardDescription>
              Masukkan nomor telepon dan password Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Akun Demo:</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('admin')}
                  className="text-xs"
                >
                  Demo Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('warga')}
                  className="text-xs"
                >
                  Demo Warga
                </Button>
              </div>
              
              <div className="text-center text-xs text-gray-500 mt-2">
                <p>Admin: 081234567890 / admin123</p>
                <p>Warga: 081234567891 / warga123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
