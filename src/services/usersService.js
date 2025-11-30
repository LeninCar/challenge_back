import { getAllUsers, createUser } from "../models/userModel.js";

export async function listUsers() {
  return await getAllUsers();
}

export async function addUser(data) {
  // Aquí podrías validar datos
  return await createUser(data);
}
