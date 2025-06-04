
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Home, Lock, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Nomor handphone wajib diisi')
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor handphone tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);

    const { error } = await signIn(data.phone, data.password);
    
    if (error) {
      toast.error('Nomor handphone atau password salah');
      form.setError('root', { message: 'Nomor handphone atau password salah' });
    } else {
      toast.success('Login berhasil!');
      navigate('/');
    }
    
    setLoading(false);
  };

  const fillDemoCredentials = (type: 'admin' | 'warga') => {
    if (type === 'admin') {
      form.setValue('phone', '081234567890');
      form.setValue('password', 'admin123');
    } else {
      form.setValue('phone', '081234567891');
      form.setValue('password', 'warga123');
    }
    form.clearErrors();
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
              Masukkan nomor handphone dan password Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Handphone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="081234567890"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="Masukkan password"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <Alert variant="destructive">
                    <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
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
            </Form>

            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

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
                  type="button"
                >
                  Demo Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('warga')}
                  className="text-xs"
                  type="button"
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
