
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Home, Phone, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(1, 'Nomor handphone wajib diisi')
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor handphone tidak valid')
    .transform((val) => {
      // Normalize phone number format
      if (val.startsWith('0')) {
        return '62' + val.slice(1);
      } else if (val.startsWith('+62')) {
        return val.slice(1);
      }
      return val;
    }),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phone: '',
    },
  });

  // Load reCAPTCHA script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => setRecaptchaLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const onSubmit = async (data: ForgotPasswordForm) => {
    if (!recaptchaLoaded) {
      toast.error('reCAPTCHA belum dimuat, silakan coba lagi');
      return;
    }

    // Verify reCAPTCHA
    const recaptchaResponse = (window as any).grecaptcha?.getResponse();
    if (!recaptchaResponse) {
      toast.error('Silakan verifikasi reCAPTCHA terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Link reset password telah dikirim ke nomor handphone Anda');
      navigate('/login');
    } catch (error) {
      toast.error('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setLoading(false);
      if ((window as any).grecaptcha) {
        (window as any).grecaptcha.reset();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lupa Password</h1>
          <p className="text-gray-600 mt-2">Masukkan nomor handphone untuk reset password</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl md:text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Kami akan mengirimkan link reset password ke nomor handphone Anda
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

                <div className="space-y-2">
                  <Label>Verifikasi reCAPTCHA</Label>
                  <div 
                    className="g-recaptcha" 
                    data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  ></div>
                  {!recaptchaLoaded && (
                    <p className="text-sm text-gray-500">Memuat reCAPTCHA...</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !recaptchaLoaded}
                >
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
