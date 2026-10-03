import { Router } from 'express';
import {
  login,
  verify,
  updateProfile,
  changePassword
} from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  loginSchema,
  verifySchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validations/user.validation.js';

const router = Router();

/**
 * @route   POST /api/user/login
 * @desc    Autentikasi akun pengguna dan mendapatkan access_token (JWT)
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route   POST /api/user/verify
 * @desc    Verifikasi access_token dan mengambil data record pengguna dari database
 * @access  Public (menerima token dari Body, Header Bearer, atau Cookie)
 */
router.post('/verify', validate(verifySchema), verify);

/**
 * @route   PUT /api/user/profile
 * @desc    Mengubah field profil pengguna yang sedang login
 * @access  Protected (Header, Cookie, Body)
 */
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

/**
 * @route   PUT /api/user/password
 * @desc    Mengubah kata sandi pengguna yang sedang login
 * @access  Protected (Header, Cookie, Body)
 */
router.put('/password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
