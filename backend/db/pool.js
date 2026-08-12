const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.error(
    "DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Most managed Postgres providers require SSL but use a self-signed
  // certificate chain. This is the standard permissive setting for that
  // case; tighten it if your provider supports full certificate validation.
  ssl:
    process.env.DATABASE_SSL === "false"
      ? false
      : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Unexpected PostgreSQL pool error", err);
});

module.exports = pool;
