export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err);

  // JSON syntax error di body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Format payload JSON tidak valid'
    });
  }

  // Sequelize Unique Constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Data sudah ada (duplikat)',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message }))
    });
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validasi database gagal',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message }))
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
