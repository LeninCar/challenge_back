import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: false, // 🔹 importante para RDS (equivale a sslmode=require)
  },
});

pool.connect()
  .then(() => console.log("Conectado a Postgres"))
  .catch((err) => console.error("Error conectando a Postgres:", err.message));
