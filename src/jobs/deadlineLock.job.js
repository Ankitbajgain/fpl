const cron = require('node-cron');
const { pool } = require('../config/mysql');
const logger = require('../utils/logger');

/**
 * Every minute:
 * 1) send deadline alerts 30 minutes before toss
 * 2) lock squads when fixture lock time is reached
 */
const deadlineLockJob = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Alerts for lock in next 30 minutes (and not sent in last 20 minutes)
    await pool.query(
      `INSERT INTO push_notifications (user_id, type, title, body)
       SELECT ms.user_id, 'DEADLINE_ALERT', 'Deadline Approaching',
              CONCAT('Your team for fixture #', f.id, ' locks soon.')
       FROM manager_squads ms
       JOIN fixtures f ON f.id = ms.fixture_id
       WHERE f.status = 'SCHEDULED'
         AND f.lock_at BETWEEN ? AND DATE_ADD(?, INTERVAL 30 MINUTE)
         AND ms.is_locked = 0`,
      [now, now]
    );

    // Lock squads
    const [result] = await pool.query(
      `UPDATE manager_squads ms
       JOIN fixtures f ON f.id = ms.fixture_id
       SET ms.is_locked = 1
       WHERE ms.is_locked = 0
         AND f.lock_at <= ?
         AND f.status IN ('SCHEDULED', 'LIVE')`,
      [now]
    );

    if (result.affectedRows > 0) {
      logger.info(`[DeadlineLockJob] Locked ${result.affectedRows} squads`);
    }
  } catch (error) {
    logger.error(`[DeadlineLockJob] ${error.message}`);
  }
}, { scheduled: false });

module.exports = deadlineLockJob;
