import { listUsers, addUser } from "../services/usersService.js";
import { pool } from "../db.js";

export async function getUsers(req, res) {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    console.error("Error getUsers:", err);
    res.status(500).json({ error: "Error listando usuarios" });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, role } = req.body;
    const user = await addUser({ name, email, role });
    res.status(201).json(user);
  } catch (err) {
    console.error("Error createUser:", err);
    res.status(500).json({ error: "Error creando usuario" });
  }
}

export async function updateUserRole(req, res) {
  const userId = req.params.id;
  const { role } = req.body;

  if (!["solicitante", "aprobador"].includes(role)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, name, email, role, google_id`,
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error actualizando rol:", err);
    res.status(500).json({ error: "Error actualizando rol" });
  }
}