const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

function normalizeRole(accountType) {
  const value = String(accountType || "").toLowerCase();
  if (value === "donor") return "donor";
  if (value === "ngo") return "ngo";
  return null;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const {
    accountType,
    restaurantName, // used for both donor org name and ngo org name (frontend field name)
    ownerName,
    registerEmail,
    registerPassword,
    phone,
    address,
    city,
    state,
    pincode,
    establishmentYear,
  } = req.body;

  const role = normalizeRole(accountType);
  const email = (registerEmail || "").trim().toLowerCase();
  const password = registerPassword || "";

  if (!role) {
    return res.status(400).json({ error: "Please select DONOR or NGO." });
  }
  if (!restaurantName || !ownerName || !email || !password || !phone || !address) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, passwordHash, role]
    );
    const user = userResult.rows[0];

    if (role === "donor") {
      await client.query(
        `INSERT INTO donor_profiles
          (user_id, organization_name, owner_name, phone, address, city, state, pincode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, restaurantName, ownerName, phone, address, city || null, state || null, pincode || null]
      );
    } else {
      await client.query(
        `INSERT INTO ngo_profiles
          (user_id, organization_name, owner_name, phone, address, city, state, pincode, establishment_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          user.id,
          restaurantName,
          ownerName,
          phone,
          address,
          city || null,
          state || null,
          pincode || null,
          establishmentYear || null,
        ]
      );
    }

    await client.query("COMMIT");

    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    await client.query("ROLLBACK");
    // eslint-disable-next-line no-console
    console.error("Register error:", err);
    return res.status(500).json({ error: "Could not create account. Please try again." });
  } finally {
    client.release();
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { accountType, email, password } = req.body;
  const role = normalizeRole(accountType);
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!role) {
    return res.status(400).json({ error: "Please select DONOR or NGO." });
  }
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1 AND role = $2",
      [normalizedEmail, role]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email, password, or account type." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email, password, or account type." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, role FROM users WHERE id = $1", [
      req.user.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Me error:", err);
    return res.status(500).json({ error: "Could not load session." });
  }
});

module.exports = router;
