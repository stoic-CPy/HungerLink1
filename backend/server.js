require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donor");
const ngoRoutes = require("./routes/ngo");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/ngo", ngoRoutes);

// 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Central error handler - never leak stack traces / internals to clients
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong." });
});

const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET is not set. Set it in backend/.env before running in production."
  );
}

app.listen(PORT, () => {
  console.log(`HungerLink API listening on port ${PORT}`);
});
