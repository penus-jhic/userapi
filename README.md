# School User REST API (`/api/user`)

REST API Khusus Autentikasi dan Manajemen Pengguna (Warga Sekolah) dengan Tech Stack:
- **Express.js** (Web Framework)
- **Sequelize ORM** (Object-Relational Mapping)
- **PostgreSQL** (Relational Database)
- **Zod** (Request Validation)
- **JWT (JSON Web Token)**, **Cookie Parser** & **Bcryptjs** (Security & Auth)
- **ES Modules** (`import` / `export`)

---

## 📋 Daftar Role Warga Sekolah

Tabel pengguna mendukung tipe ENUM Role:
1. `ADMIN`: Administrator Sistem & IT Sekolah
2. `KEPALA_SEKOLAH`: Kepala Sekolah
3. `GURU`: Tenaga Pendidik / Guru
4. `TU`: Tenaga Kependidikan / Tata Usaha
5. `SISWA`: Peserta Didik
6. `ORANG_TUA`: Orang Tua / Wali Murid
7. `BENDAHARA`: Bagian Keuangan / SPP
8. `BK`: Guru Bimbingan Konseling

---

## 🗄️ Struktur Database (`users`)

| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `UUID` (v4) | Primary Key unik (otomatis di-generate) |
| `username` | `VARCHAR(50)` | Username unik untuk login |
| `password` | `VARCHAR(255)` | Hash password (dienkripsi dengan bcrypt) |
| `nama_lengkap` | `VARCHAR(150)` | Nama lengkap warga sekolah |
| `nomor_induk` | `VARCHAR(50)` | Nomor Induk unik (NIP / NUPTK / NIS / NISN / NIK) |
| `role` | `ENUM` | Salah satu dari 8 role di atas |
| `email` | `VARCHAR(100)` | Alamat email (unik, nullable) |
| `no_hp` | `VARCHAR(20)` | Nomor telepon / WhatsApp (nullable) |
| `jenis_kelamin` | `ENUM` | `LAKI_LAKI` / `PEREMPUAN` (nullable) |
| `status_aktif` | `BOOLEAN` | Status akun aktif (`true`) atau dinonaktifkan (`false`) |
| `foto_profil` | `TEXT` | URL atau path foto profil (nullable) |
| `alamat` | `TEXT` | Alamat tempat tinggal (nullable) |
| `createdAt` | `TIMESTAMP` | Waktu pembuatan akun |
| `updatedAt` | `TIMESTAMP` | Waktu pembaharuan terakhir akun |

---

## 🔑 Fleksibilitas Autentikasi (JWT Token)

Untuk endpoint yang membutuhkan autentikasi (`/verify`, `/profile`, `/password`), token dapat dikirim melalui salah satu dari 3 cara berikut:

1. **HTTP Authorization Header** (Standar REST):
   ```http
   Authorization: Bearer <access_token>
   ```
2. **HTTP Cookie**:
   ```http
   Cookie: access_token=<access_token>
   ```
3. **JSON Request Body**:
   ```json
   {
     "access_token": "<access_token>"
   }
   ```

---

## 📡 Daftar Endpoint API

Base URL: `http://localhost:3000/api/user`

### 1. Login
Mengautentikasi pengguna dan mengembalikan JWT `access_token`.

- **Method**: `POST`
- **URL**: `/api/user/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "kepsek",
  "password": "Password123!"
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Login berhasil",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "24h"
}
```

---

### 2. Verify
Memverifikasi `access_token` dan mengembalikan seluruh record database pengguna (password hash otomatis disembunyikan).

- **Method**: `POST`
- **URL**: `/api/user/verify`
- **Request Body** (atau gunakan Header / Cookie):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Token terverifikasi dengan valid",
  "data": {
    "id": "e36e4f3a-86f7-4f9e-990a-1df8bb1c58e1",
    "username": "kepsek",
    "nama_lengkap": "Dr. H. Bambang Sudarsono, M.Pd.",
    "nomor_induk": "197203151998021001",
    "role": "KEPALA_SEKOLAH",
    "email": "kepsek@sekolah.sch.id",
    "no_hp": "081234567891",
    "jenis_kelamin": "LAKI_LAKI",
    "status_aktif": true,
    "foto_profil": null,
    "alamat": "Jl. Wijaya Kusuma No. 12, Jakarta",
    "createdAt": "2026-09-22T06:50:00.000Z",
    "updatedAt": "2026-09-22T06:50:00.000Z"
  }
}
```

---

### 3. Change Field / Update Profile
Memperbarui data field profil pengguna yang sedang login.
- **Allowed Fields**: `nama_lengkap`, `email`, `no_hp`, `jenis_kelamin`, `foto_profil`, `alamat` (minimal 1 field diisi).
- **Protected Fields**: `id`, `role`, `nomor_induk`, `username`, `status_aktif` dikunci demi integritas data sekolah.

- **Method**: `PUT`
- **URL**: `/api/user/profile`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` *(atau kirim via Cookie / Body)*
- **Request Body**:
```json
{
  "nama_lengkap": "Dr. H. Bambang Sudarsono, M.Pd., Ph.D.",
  "no_hp": "081299998888",
  "alamat": "Jl. Senayan Baru No. 10, Jakarta Selatan"
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": "e36e4f3a-86f7-4f9e-990a-1df8bb1c58e1",
    "username": "kepsek",
    "nama_lengkap": "Dr. H. Bambang Sudarsono, M.Pd., Ph.D.",
    "nomor_induk": "197203151998021001",
    "role": "KEPALA_SEKOLAH",
    "email": "kepsek@sekolah.sch.id",
    "no_hp": "081299998888",
    "jenis_kelamin": "LAKI_LAKI",
    "status_aktif": true,
    "foto_profil": null,
    "alamat": "Jl. Senayan Baru No. 10, Jakarta Selatan",
    "createdAt": "2026-09-22T06:50:00.000Z",
    "updatedAt": "2026-09-22T07:15:00.000Z"
  }
}
```

---

### 4. Change Password
Memperbarui kata sandi akun pengguna yang sedang login dengan memverifikasi kata sandi lama terlebih dahulu.

- **Method**: `PUT`
- **URL**: `/api/user/password`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` *(atau kirim via Cookie / Body)*
- **Request Body**:
```json
{
  "old_password": "Password123!",
  "new_password": "NewSecretPass456!"
}
```
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Password berhasil diperbarui"
}
```
- **Response Gagal (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Password lama yang Anda masukkan tidak sesuai"
}
```

---

## 👥 Akun Demo Siap Pakai (Hasil Seeder)

Semua akun berikut menggunakan password default: **`Password123!`**

| Username | Role | Nama Lengkap | Nomor Induk (NIP/NIS/NIK) |
| :--- | :--- | :--- | :--- |
| `admin` | `ADMIN` | Administrator IT Sekolah | ADM-2026-001 |
| `kepsek` | `KEPALA_SEKOLAH` | Dr. H. Bambang Sudarsono, M.Pd. | 197203151998021001 |
| `guru_siti` | `GURU` | Siti Rahmawati, S.Pd. | 198506122010012005 |
| `tu_budi` | `TU` | Budi Santoso, A.Md. | 199004052015031002 |
| `siswa_rizky` | `SISWA` | Ahmad Rizky Pratama | 0061234567 |
| `ortu_hendra` | `ORANG_TUA` | Hendra Pratama, S.T. | 3271012345678901 |
| `bendahara_sri`| `BENDAHARA` | Sri Wahyuni, S.E. | 198811202014022003 |
| `bk_dedi` | `BK` | Dedi Kurniawan, S.Psi. | 198708142012011004 |

---

## 🚀 Panduan Instalasi & Penggunaan

```bash
# 1. Install dependensi
npm install

# 2. Setup .env
cp .env.example .env
# Sesuaikan parameter database PostgreSQL Anda

# 3. Jalankan Seeder
npm run db:seed

# 4. Jalankan Server
npm run dev

# 5. Jalankan Automated Tests
npm test
```
