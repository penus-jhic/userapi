import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_NAME = 'school_user_db',
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
  DB_HOST = '127.0.0.1',
  DB_PORT = 5432,
  DATABASE_URL,
  NODE_ENV = 'development'
} = process.env;

export const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      logging: NODE_ENV === 'development' ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: Number(DB_PORT),
      dialect: 'postgres',
      logging: NODE_ENV === 'development' ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

export const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Berhasil terhubung ke database PostgreSQL.');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database PostgreSQL:', error.message);
    throw error;
  }
};
