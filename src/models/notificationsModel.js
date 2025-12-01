import { pool } from "../db.js";

export async function createNotification({ userId, requestId, message }) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, request_id, message)
     VALUES ($1, $2, $3)
     RETURNING *;`,
    [userId, requestId, message]
  );
  return result.rows[0];
}

export async function getNotificationsForUser(userId) {
  const result = await pool.query(
    `SELECT *
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC;`,
    [userId]
  );
  return result.rows;
}

export async function markNotificationRead(id, userId) {
  const result = await pool.query(
    `UPDATE notifications
     SET read_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *;`,
    [id, userId]
  );
  return result.rows[0];
}
