const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,

  // Database
  MYSQL_HOST: process.env.MYSQL_HOST || '127.0.0.1',
  MYSQL_PORT: Number(process.env.MYSQL_PORT) || 3306,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'new_fpl',
  MYSQL_USER: process.env.MYSQL_USER || 'root',
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Redis (for caching & leaderboard)
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Notifications
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Payment Gateway
  PAYMENT_GATEWAY_KEY: process.env.PAYMENT_GATEWAY_KEY,
  PAYMENT_GATEWAY_SECRET: process.env.PAYMENT_GATEWAY_SECRET,
};
