import { z } from 'zod';
import { GENDER_ARRAY } from '../constants/roles.js';

export const loginSchema = z.object({
  username: z
    .string({
      required_error: 'Username wajib diisi',
      invalid_type_error: 'Username harus berupa teks'
    })
    .trim()
    .min(1, 'Username tidak boleh kosong'),
  password: z
    .string({
      required_error: 'Password wajib diisi',
      invalid_type_error: 'Password harus berupa teks'
    })
    .min(1, 'Password tidak boleh kosong')
});

export const verifySchema = z.object({
  access_token: z
    .string({
      invalid_type_error: 'access_token harus berupa string token JWT'
    })
    .trim()
    .min(1, 'access_token tidak boleh kosong')
    .optional()
});

export const updateProfileSchema = z
  .object({
    access_token: z.string().optional(), // opsional jika dikirim via body
    nama_lengkap: z
      .string({ invalid_type_error: 'Nama lengkap harus berupa string' })
      .trim()
      .min(1, 'Nama lengkap tidak boleh kosong')
      .max(150, 'Nama lengkap maksimal 150 karakter')
      .optional(),
    email: z
      .string({ invalid_type_error: 'Email harus berupa string' })
      .trim()
      .email('Format email tidak valid')
      .max(100, 'Email maksimal 100 karakter')
      .nullable()
      .optional(),
    no_hp: z
      .string({ invalid_type_error: 'Nomor HP harus berupa string' })
      .trim()
      .max(20, 'Nomor HP maksimal 20 karakter')
      .nullable()
      .optional(),
    jenis_kelamin: z
      .enum(GENDER_ARRAY, {
        errorMap: () => ({
          message: `Jenis kelamin harus salah satu dari: ${GENDER_ARRAY.join(', ')}`
        })
      })
      .nullable()
      .optional(),
    foto_profil: z
      .string({ invalid_type_error: 'Foto profil harus berupa URL/teks string' })
      .nullable()
      .optional(),
    alamat: z
      .string({ invalid_type_error: 'Alamat harus berupa string' })
      .nullable()
      .optional()
  })
  .refine(
    (data) => {
      const { access_token, ...profileFields } = data;
      return Object.keys(profileFields).some((key) => profileFields[key] !== undefined);
    },
    {
      message: 'Minimal satu field profil harus disertakan untuk diperbarui (nama_lengkap, email, no_hp, jenis_kelamin, foto_profil, alamat)'
    }
  );

export const changePasswordSchema = z
  .object({
    access_token: z.string().optional(), // opsional jika dikirim via body
    old_password: z
      .string({
        required_error: 'Password lama (old_password) wajib diisi',
        invalid_type_error: 'Password lama harus berupa teks'
      })
      .min(1, 'Password lama tidak boleh kosong'),
    new_password: z
      .string({
        required_error: 'Password baru (new_password) wajib diisi',
        invalid_type_error: 'Password baru harus berupa teks'
      })
      .min(6, 'Password baru minimal harus 6 karakter')
  })
  .refine((data) => data.old_password !== data.new_password, {
    message: 'Password baru tidak boleh sama dengan password lama saat ini',
    path: ['new_password']
  });
