const mysql = require('mysql2/promise');
const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_DATABASE,
  MYSQL_USER,
  MYSQL_PASSWORD,
} = require('./env');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  database: MYSQL_DATABASE,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('MySQL connected successfully');
  } catch (error) {
    logger.error(`MySQL connection error: ${error.message}`);
    throw error;
  }
};

module.exports = { pool, connectMySQL };
