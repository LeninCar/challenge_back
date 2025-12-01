import { pool } from "../db.js";

export async function currentUser(req, res, next) {
  try {
    const userId = req.header("x-user-id");

    if (!userId) {
      req.user = null;
      return next();
    }

    const result = await pool.query(
      "SELECT id, name, role, email FROM users WHERE id = $1",
      [userId]
    );

    req.user = result.rows[0] || null;
    return next();
  } catch (err) {
    console.error("Error en currentUser:", err);
    req.user = null;
    return next();
  }
}
