import dotenv from 'dotenv';
import app from './app.js';
import { testDbConnection } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`📡 Endpoint prefix: http://localhost:${PORT}/api/user`);
      console.log(`🔑 Login:  POST http://localhost:${PORT}/api/user/login`);
      console.log(`🛡️ Verify: POST http://localhost:${PORT}/api/user/verify`);
    });
  } catch (error) {
    console.error('❌ Server gagal dijalankan:', error.message);
    process.exit(1);
  }
};

startServer();
