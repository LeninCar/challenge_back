import { listUsers, addUser } from "../services/usersService.js";

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
