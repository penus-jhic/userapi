import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

/**
 * Ekstraksi token dari 3 sumber:
 * 1. Authorization Header: "Bearer <token>"
 * 2. Cookie: "access_token" atau "token"
 * 3. Body JSON: "access_token"
 */
export const extractToken = (req) => {
  // 1. Cek Authorization Header
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    if (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) {
      return authHeader.split(' ')[1].trim();
    }
    return authHeader.trim();
  }

  // 2. Cek Cookie
  if (req.cookies) {
    if (req.cookies.access_token) return req.cookies.access_token;
    if (req.cookies.token) return req.cookies.token;
  }

  // 3. Cek Body JSON
  if (req.body && req.body.access_token) {
    return req.body.access_token;
  }

  return null;
};

export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi gagal: access_token tidak ditemukan (dapat dikirim melalui Authorization Header, Cookie, atau Body JSON)'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Konfigurasi JWT_SECRET pada server belum tersedia'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
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
        message: 'Akun Anda berstatus non-aktif. Silakan hubungi admin sekolah.'
      });
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
