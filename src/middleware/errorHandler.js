// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${req.method}] ${req.path} → ${status}:`, err.stack);
  }
  res.status(status).json({ message });
};

module.exports = errorHandler;
