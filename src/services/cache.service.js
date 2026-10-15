import NodeCache from 'node-cache';

/**
 * Cache instance untuk token verification
 * stdTTL: 0 (default infinite, namun setiap entry diset TTL eksplisit sesuai waktu exp JWT)
 * checkperiod: 60 (pemeriksaan berkala token expired setiap 60 detik)
 */
export const verifyCache = new NodeCache({
  stdTTL: 0,
  checkperiod: 60,
  useClones: true
});

// Mapping userId -> Set of tokens yang sedang aktif di cache
const userIdToTokens = new Map();

/**
 * Helper untuk menghapus token dari mapping user
 */
const removeTokenFromUserMap = (userId, token) => {
  if (!userId) return;
  const tokens = userIdToTokens.get(userId);
  if (tokens) {
    tokens.delete(token);
    if (tokens.size === 0) {
      userIdToTokens.delete(userId);
    }
  }
};

// Event listener saat token expired secara alami
verifyCache.on('expired', (token, value) => {
  if (value && value.id) {
    removeTokenFromUserMap(value.id, token);
  }
});

// Event listener saat token dihapus secara eksplisit
verifyCache.on('del', (token, value) => {
  if (value && value.id) {
    removeTokenFromUserMap(value.id, token);
  }
});

/**
 * Mengambil data user dari cache verifikasi berdasarkan token JWT
 * @param {string} token - Raw JWT token
 * @returns {object|null}
 */
export const getVerifyCache = (token) => {
  if (!token) return null;
  const cached = verifyCache.get(token);
  return cached !== undefined ? cached : null;
};

/**
 * Menyimpan data user ke dalam cache verifikasi dengan TTL dinamis
 * @param {string} token - Raw JWT token
 * @param {object} userData - Data user (POJO tanpa password)
 * @param {number} ttlInSeconds - Sisa waktu expired JWT (dalam detik)
 * @param {string} [userId] - ID user pemilik token
 */
export const setVerifyCache = (token, userData, ttlInSeconds, userId) => {
  if (!token || !userData) return;
  const ttl = Math.max(1, Math.floor(ttlInSeconds));
  verifyCache.set(token, userData, ttl);

  const uid = userId || userData.id;
  if (uid) {
    if (!userIdToTokens.has(uid)) {
      userIdToTokens.set(uid, new Set());
    }
    userIdToTokens.get(uid).add(token);
  }
};

/**
 * Menghapus seluruh token cache milik suatu user (misal saat profil diubah / ganti password)
 * @param {string} userId - UUID user
 */
export const invalidateUserCache = (userId) => {
  if (!userId) return;
  const tokens = userIdToTokens.get(userId);
  if (tokens && tokens.size > 0) {
    // Salin token ke array agar iterasi aman saat penghapusan
    const tokenList = Array.from(tokens);
    for (const token of tokenList) {
      verifyCache.del(token);
    }
    userIdToTokens.delete(userId);
  }
};

/**
 * Menghapus cache untuk token spesifik
 * @param {string} token - Raw JWT token
 */
export const invalidateTokenCache = (token) => {
  if (!token) return;
  verifyCache.del(token);
};

/**
 * Mengosongkan seluruh cache dan mapping (digunakan untuk setup/teardown unit test)
 */
export const clearAllCache = () => {
  verifyCache.flushAll();
  userIdToTokens.clear();
};
