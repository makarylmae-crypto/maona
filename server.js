import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// full path to React build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.join(__dirname, "dist");
app.use(express.static(DIST_PATH));

// helper to get all tables
async function getAllTables() {
  const [tables] = await pool.query("SHOW TABLES");
  return tables.map(row => Object.values(row)[0]);
}

// API: fetch any table dynamically
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

// fallback to React
app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
