const app = require('./src/app');
const { mysql } = require('./src/config');
const { PORT } = require('./src/config/env');
const logger = require('./src/utils/logger');

// Start background jobs
const deadlineLockJob = require('./src/jobs/deadlineLock.job');

const startServer = async () => {
  await mysql.connectMySQL();
  deadlineLockJob.start();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.warn(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
