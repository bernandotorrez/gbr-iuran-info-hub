
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Common validation schemas
export const phoneSchema = z
  .string()
  .min(1, 'Nomor handphone wajib diisi')
  .regex(/^(\+62|62|0)[0-9]{9,13}$/, 'Format nomor handphone tidak valid');

export const nameSchema = z
  .string()
  .min(1, 'Nama wajib diisi')
  .min(2, 'Nama minimal 2 karakter')
  .max(100, 'Nama maksimal 100 karakter');

export const addressSchema = z
  .string()
  .min(1, 'Alamat wajib diisi')
  .min(5, 'Alamat minimal 5 karakter')
  .max(200, 'Alamat maksimal 200 karakter');

export const rtRwSchema = z
  .string()
  .min(1, 'RT/RW wajib diisi')
  .regex(/^RT\s?\d{2,3}\/RW\s?\d{2,3}$/i, 'Format RT/RW tidak valid (contoh: RT 01/RW 02)');

export const emailSchema = z
  .string()
  .min(1, 'Email wajib diisi')
  .email('Format email tidak valid');

export const passwordSchema = z
  .string()
  .min(1, 'Password wajib diisi')
  .min(6, 'Password minimal 6 karakter')
  .max(100, 'Password maksimal 100 karakter');

export const nominalSchema = z
  .string()
  .min(1, 'Nominal wajib diisi')
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Nominal harus berupa angka positif');

export const dateSchema = z
  .string()
  .min(1, 'Tanggal wajib diisi');

// Hook for creating forms with validation
export const useFormValidation = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  defaultValues?: T
) => {
  return useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });
};

// Common form schemas for different pages
export const wargaFormSchema = z.object({
  nama: nameSchema,
  phone_number: phoneSchema,
  alamat: addressSchema,
  rt_rw: rtRwSchema,
  email: emailSchema.optional(),
});

export const tipeIuranFormSchema = z.object({
  nama: nameSchema,
  nominal: nominalSchema,
  deskripsi: z.string().optional(),
});

export const iuranFormSchema = z.object({
  warga_id: z.string().min(1, 'Warga wajib dipilih'),
  tipe_iuran_id: z.string().min(1, 'Tipe iuran wajib dipilih'),
  nominal: nominalSchema,
  tanggal_bayar: dateSchema,
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2020),
  keterangan: z.string().optional(),
});

export const kasKeluarFormSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi').min(5, 'Judul minimal 5 karakter'),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi').min(5, 'Deskripsi minimal 5 karakter'),
  nominal: nominalSchema,
  tanggal_keluar: dateSchema,
  kategori: z.string().min(1, 'Kategori wajib dipilih'),
});

export type WargaFormData = z.infer<typeof wargaFormSchema>;
export type TipeIuranFormData = z.infer<typeof tipeIuranFormSchema>;
export type IuranFormData = z.infer<typeof iuranFormSchema>;
export type KasKeluarFormData = z.infer<typeof kasKeluarFormSchema>;
