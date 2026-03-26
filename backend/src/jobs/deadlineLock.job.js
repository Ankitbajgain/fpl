const cron = require('node-cron');
const { pool } = require('../config/mysql');
const logger = require('../utils/logger');
const { finalizeMatchPoints } = require('../modules/gameplay/gameplay.service');

/**
 * Every minute:
 * 1) Send deadline alerts 30 minutes before toss
 * 2) Lock squads when fixture lock_at is reached
 * 3) Finalize completed fixtures (points + leaderboard readiness)
 * 4) Send "transfer window is now open" notifications when a fixture's
 *    transfer_window_opens_at arrives (exactly once, within the same minute)
 */
const deadlineLockJob = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // 1) Alerts for squads whose lock window starts in ≤30 minutes (not yet locked)
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

    // 2) Lock squads whose fixture lock_at has been reached
    const [lockResult] = await pool.query(
      `UPDATE manager_squads ms
       JOIN fixtures f ON f.id = ms.fixture_id
       SET ms.is_locked = 1
       WHERE ms.is_locked = 0
         AND f.lock_at <= ?
         AND f.status IN ('SCHEDULED', 'LIVE')`,
      [now]
    );

    if (lockResult.affectedRows > 0) {
      logger.info(`[DeadlineLockJob] Locked ${lockResult.affectedRows} squads`);
    }

    // 3) Finalize completed fixtures that are not processed yet
    const [completedRows] = await pool.query(
      `SELECT f.id
       FROM fixtures f
       WHERE f.status = 'COMPLETED'
         AND f.ended_at IS NOT NULL
         AND f.ended_at <= ?
         AND f.points_finalized_at IS NULL
       ORDER BY f.ended_at ASC
       LIMIT 25`,
      [now]
    );

    for (const row of completedRows) {
      try {
        const result = await finalizeMatchPoints(Number(row.id));
        logger.info(
          `[DeadlineLockJob] Finalized fixture #${result.fixtureId}: ${result.playersProcessed} players, ${result.squadsProcessed} squads`
        );

        const [users] = await pool.query(
          `SELECT DISTINCT user_id
           FROM manager_squads
           WHERE fixture_id = ?`,
          [Number(row.id)]
        );

        if (users.length) {
          const values = users.map((u) => [
            u.user_id,
            'FINAL_POINTS',
            'Final Points Updated',
            `Final points and leaderboard are updated for fixture #${result.fixtureId}.`,
          ]);
          await pool.query(
            `INSERT INTO push_notifications (user_id, type, title, body) VALUES ?`,
            [values]
          );
        }
      } catch (error) {
        logger.error(`[DeadlineLockJob] Finalization failed for fixture #${row.id}: ${error.message}`);
      }
    }

    // 4) Notify users that the transfer window for the next fixture just opened
    //    (transfer_window_opens_at fell within the last minute)
    const [windowRows] = await pool.query(
      `SELECT f.id AS fixture_id, f.league_season_id, f.transfer_window_opens_at
       FROM fixtures f
       WHERE f.status = 'SCHEDULED'
         AND f.transfer_window_opens_at BETWEEN ? AND ?`,
      [oneMinuteAgo, now]
    );

    for (const fixture of windowRows) {
      // Notify all users who have a squad in this league
      const [userRows] = await pool.query(
        `SELECT DISTINCT ms.user_id
         FROM manager_squads ms
         JOIN fixtures f2 ON f2.id = ms.fixture_id
         WHERE f2.league_season_id = ?`,
        [fixture.league_season_id]
      );

      if (userRows.length) {
        const values = userRows.map((u) => [
          u.user_id,
          'DEADLINE_ALERT',
          'Transfer Window Open',
          `Transfers are now open for fixture #${fixture.fixture_id}. Make your moves before lock!`,
        ]);
        // Batch insert (values is an array of arrays → single query)
        await pool.query(
          `INSERT INTO push_notifications (user_id, type, title, body) VALUES ?`,
          [values]
        );
        logger.info(
          `[DeadlineLockJob] Sent transfer-window-open notification for fixture #${fixture.fixture_id} to ${userRows.length} users`
        );
      }
    }
  } catch (error) {
    logger.error(`[DeadlineLockJob] ${error.message}`);
  }
}, { scheduled: false });

module.exports = deadlineLockJob;
