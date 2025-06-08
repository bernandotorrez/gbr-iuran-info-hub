
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Phone, User, MapPin, Home } from 'lucide-react';

const wargaFormSchema = z.object({
  blok_rumah: z.string().min(1, 'Blok rumah wajib diisi'),
  nama_suami: z.string().optional(),
  nama_istri: z.string().optional(),
  nomor_hp_suami: z.string().optional(),
  nomor_hp_istri: z.string().optional(),
  status_tinggal: z.enum(['Sudah', 'Kadang-Kadang', 'Belum']),
}).refine((data) => {
  return data.nama_suami || data.nama_istri;
}, {
  message: "Minimal salah satu nama (suami atau istri) harus diisi",
  path: ["nama_suami"]
});

export type WargaFormData = z.infer<typeof wargaFormSchema>;

interface WargaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WargaFormData) => Promise<void>;
  initialData?: Partial<WargaFormData>;
  title: string;
}

export const WargaFormDialog: React.FC<WargaFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
}) => {
  const form = useForm<WargaFormData>({
    resolver: zodResolver(wargaFormSchema),
    defaultValues: {
      blok_rumah: '',
      nama_suami: '',
      nama_istri: '',
      nomor_hp_suami: '',
      nomor_hp_istri: '',
      status_tinggal: 'Belum',
      ...initialData,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        blok_rumah: '',
        nama_suami: '',
        nama_istri: '',
        nomor_hp_suami: '',
        nomor_hp_istri: '',
        status_tinggal: 'Belum',
        ...initialData,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: WargaFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
      toast.success('Data warga berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan data warga');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="blok_rumah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blok Rumah</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Contoh: C1-5" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nama_suami"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Suami</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Nama lengkap suami" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nama_istri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Istri</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Nama lengkap istri" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nomor_hp_suami"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor HP Suami</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="081234567890" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nomor_hp_istri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor HP Istri</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="081234567890" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status_tinggal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sudah tinggal di GBR?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status tinggal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sudah">Sudah</SelectItem>
                      <SelectItem value="Kadang-Kadang">Kadang-Kadang</SelectItem>
                      <SelectItem value="Belum">Belum</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
