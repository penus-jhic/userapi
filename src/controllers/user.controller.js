import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { extractToken } from '../middlewares/auth.middleware.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET belum dikonfigurasi di file environment (.env)');
  }
  return secret;
};

/**
 * Endpoint: POST /api/user/login
 * Body: { username, password }
 * Response: { access_token, ... }
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    if (!user.status_aktif) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda berstatus non-aktif. Silakan hubungi bagian Tata Usaha / Admin sekolah.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    const jwtSecret = getJwtSecret();
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint: POST /api/user/verify
 * Request: access_token di Body, Header (Authorization: Bearer <token>), atau Cookie
 * Response: Seluruh field DB user (tanpa password)
 */
export const verify = async (req, res, next) => {
  try {
    // Jika sudah diverifikasi oleh middleware authenticate
    if (req.user) {
      return res.status(200).json({
        success: true,
        message: 'Token terverifikasi dengan valid',
        data: req.user.toJSON()
      });
    }

    // Ekstraksi token fleksibel (Header, Cookie, Body)
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi gagal: access_token tidak ditemukan'
      });
    }

    const jwtSecret = getJwtSecret();
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'access_token telah kedaluwarsa'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'access_token tidak valid'
      });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Data user dari token tidak ditemukan di database'
      });
    }

    if (!user.status_aktif) {
      return res.status(403).json({
        success: false,
        message: 'Akun user saat ini tidak aktif'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token terverifikasi dengan valid',
      data: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint: PUT /api/user/profile
 * Request: Header Authorization, Cookie, atau Body access_token + field yang ingin diubah
 * Allowed Fields: nama_lengkap, email, no_hp, jenis_kelamin, foto_profil, alamat
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { nama_lengkap, email, no_hp, jenis_kelamin, foto_profil, alamat } = req.body;

    // Filter field yang diizinkan untuk diubah
    const fieldsToUpdate = {};
    if (nama_lengkap !== undefined) fieldsToUpdate.nama_lengkap = nama_lengkap;
    if (no_hp !== undefined) fieldsToUpdate.no_hp = no_hp;
    if (jenis_kelamin !== undefined) fieldsToUpdate.jenis_kelamin = jenis_kelamin;
    if (foto_profil !== undefined) fieldsToUpdate.foto_profil = foto_profil;
    if (alamat !== undefined) fieldsToUpdate.alamat = alamat;

    // Pengecekan keunikan email bila email diubah
    if (email !== undefined && email !== user.email) {
      if (email !== null) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail && existingEmail.id !== user.id) {
          return res.status(409).json({
            success: false,
            message: 'Email sudah terdaftar oleh pengguna lain'
          });
        }
      }
      fieldsToUpdate.email = email;
    }

    await user.update(fieldsToUpdate);

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint: PUT /api/user/password
 * Request: Header Authorization, Cookie, atau Body access_token + { old_password, new_password }
 */
export const changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { old_password, new_password } = req.body;

    // Cek kesesuaian password lama
    const isOldPasswordMatch = await user.comparePassword(old_password);
    if (!isOldPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password lama yang Anda masukkan tidak sesuai'
      });
    }

    // Set password baru (hook beforeUpdate akan otomatis melakukan hashing bcrypt)
    user.password = new_password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui'
    });
  } catch (error) {
    next(error);
  }
};
