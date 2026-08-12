// Applies db/schema.sql against DATABASE_URL. Safe to re-run: every
// statement uses CREATE TABLE/INDEX IF NOT EXISTS, so this both bootstraps
// a fresh database and is a no-op against an already-migrated one.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./pool");

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  const client = await pool.connect();
  try {
    console.log("Applying schema.sql ...");
    await client.query(sql);
    console.log("Migration complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
