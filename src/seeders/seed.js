import dotenv from 'dotenv';
import { sequelize } from '../config/database.js';
import User from '../models/user.model.js';
import { USER_ROLES, GENDER } from '../constants/roles.js';

dotenv.config();

export const seedUsersData = [
  {
    username: 'admin',
    password: 'Password123!',
    nama_lengkap: 'Administrator IT Sekolah',
    nomor_induk: 'ADM-2026-001',
    role: USER_ROLES.ADMIN,
    email: 'admin@sekolah.sch.id',
    no_hp: '081234567890',
    jenis_kelamin: GENDER.LAKI_LAKI,
    status_aktif: true,
    alamat: 'Ruang Server IT Gedung A Lt. 2'
  },
  {
    username: 'kepsek',
    password: 'Password123!',
    nama_lengkap: 'Dr. H. Bambang Sudarsono, M.Pd.',
    nomor_induk: '197203151998021001',
    role: USER_ROLES.KEPALA_SEKOLAH,
    email: 'kepsek@sekolah.sch.id',
    no_hp: '081234567891',
    jenis_kelamin: GENDER.LAKI_LAKI,
    status_aktif: true,
    alamat: 'Jl. Wijaya Kusuma No. 12, Jakarta'
  },
  {
    username: 'guru_siti',
    password: 'Password123!',
    nama_lengkap: 'Siti Rahmawati, S.Pd.',
    nomor_induk: '198506122010012005',
    role: USER_ROLES.GURU,
    email: 'siti.rahma@sekolah.sch.id',
    no_hp: '081234567892',
    jenis_kelamin: GENDER.PEREMPUAN,
    status_aktif: true,
    alamat: 'Jl. Melati Blok C No. 5, Jakarta'
  },
  {
    username: 'tu_budi',
    password: 'Password123!',
    nama_lengkap: 'Budi Santoso, A.Md.',
    nomor_induk: '199004052015031002',
    role: USER_ROLES.TU,
    email: 'tu.budi@sekolah.sch.id',
    no_hp: '081234567893',
    jenis_kelamin: GENDER.LAKI_LAKI,
    status_aktif: true,
    alamat: 'Jl. Kenanga No. 8, Jakarta'
  },
  {
    username: 'siswa_rizky',
    password: 'Password123!',
    nama_lengkap: 'Ahmad Rizky Pratama',
    nomor_induk: '0061234567', // NISN
    role: USER_ROLES.SISWA,
    email: 'rizky.pratama@student.sekolah.sch.id',
    no_hp: '081234567894',
    jenis_kelamin: GENDER.LAKI_LAKI,
    status_aktif: true,
    alamat: 'Jl. Anggrek No. 15, Jakarta'
  },
  {
    username: 'ortu_hendra',
    password: 'Password123!',
    nama_lengkap: 'Hendra Pratama, S.T.',
    nomor_induk: '3271012345678901', // NIK Wali Siswa
    role: USER_ROLES.ORANG_TUA,
    email: 'hendra.pratama@gmail.com',
    no_hp: '081234567895',
    jenis_kelamin: GENDER.LAKI_LAKI,
    status_aktif: true,
    alamat: 'Jl. Anggrek No. 15, Jakarta'
  },
  {
    username: 'bendahara_sri',
    password: 'Password123!',
    nama_lengkap: 'Sri Wahyuni, S.E.',
    nomor_induk: '198811202014022003',
    role: USER_ROLES.BENDAHARA,
    email: 'bendahara@sekolah.sch.id',
    no_hp: '081234567896',
    jenis_kelamin: GENDER.PEREMPUAN,
    status_aktif: true,
    alamat: 'Jl. Flamboyan No. 22, Jakarta'
  },
  {
    username: 'bk_dedi',
    password: 'Password123!',
    nama_lengkap: 'Dedi Kurniawan, S.Psi.',
    nomor_induk: '198708142012011004',
    role: USER_ROLES.BK,
    email: 'bk.dedi@sekolah.sch.id',
    no_hp: '081234567897',
    jenis_kelamin: GENDER.LAKI_LAKI,
    status_aktif: true,
    alamat: 'Jl. Cempaka No. 3, Jakarta'
  }
];

export const runSeed = async () => {
  try {
    console.log('🌱 Menghubungkan ke database...');
    await sequelize.authenticate();

    console.log('🔄 Memastikan tabel tersinkron...');
    await sequelize.sync({ alter: true });

    console.log('🌱 Memulai proses seeding data user...');
    for (const userData of seedUsersData) {
      const existing = await User.findOne({ where: { username: userData.username } });
      if (existing) {
        console.log(`⏩ Akun [${userData.role}] '${userData.username}' sudah ada. Melewati...`);
      } else {
        await User.create(userData);
        console.log(`✅ Berhasil menambahkan akun [${userData.role}]: '${userData.username}'`);
      }
    }

    console.log('\n✨ Seeding data selesai! Password default seluruh akun di atas adalah: Password123!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal melakukan seeding data:', error);
    process.exit(1);
  }
};

runSeed();
