import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// mysql connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// helper to get all tables
async function getAllTables() {
  const [tables] = await pool.query("SHOW TABLES");
  return tables.map(row => Object.values(row)[0]);
}

// static react build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "dist")));

// API: fetch all tables
app.get("/api/tables", async (req, res) => {
  try {
    const tables = await getAllTables();
    res.json({ tables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching table list" });
  }
});

// API: fetch all rows from a table
app.get("/api/:table", async (req, res) => {
  try {
    const table = req.params.table;
    const tables = await getAllTables();
    if (!tables.includes(table)) {
      return res.status(404).json({ error: "Table not found" });
    }
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    res.json({ table, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching table data" });
  }
});

// fallback to react router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
