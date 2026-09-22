import dotenv from 'dotenv';
import { sequelize } from '../config/database.js';
import '../models/user.model.js'; // pastikan model teregister

dotenv.config();

const syncDatabase = async () => {
  try {
    console.log('🔄 Memulai sinkronisasi tabel database PostgreSQL...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Sinkronisasi tabel database berhasil diselesaikan.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal menyinkronkan database:', error);
    process.exit(1);
  }
};

syncDatabase();
