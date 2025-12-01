// src/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  // 🔹 En producción puedes usar SSL; en local lo desactivamos
  ssl: isProduction
    ? { rejectUnauthorized: false } // para RDS / cloud
    : false,                        // local: SIN SSL
});

pool
  .connect()
  .then(() => console.log("Conectado a Postgres"))
  .catch((err) => console.error("Error conectando a Postgres:", err.message));
