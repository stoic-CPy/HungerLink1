const express = require("express");
const pool = require("../db/pool");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireRole("ngo"));

// GET /api/ngo/profile
router.get("/profile", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT np.*, u.email FROM ngo_profiles np
       JOIN users u ON u.id = np.user_id
       WHERE np.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }
    return res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error("Get ngo profile error:", err);
    return res.status(500).json({ error: "Could not load profile." });
  }
});

// PUT /api/ngo/profile
router.put("/profile", async (req, res) => {
  const { organizationName, ownerName, phone, address, city, state, pincode, establishmentYear } =
    req.body;

  if (!organizationName || !ownerName || !phone || !address) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  try {
    const result = await pool.query(
      `UPDATE ngo_profiles
       SET organization_name = $1, owner_name = $2, phone = $3, address = $4,
           city = $5, state = $6, pincode = $7, establishment_year = $8, updated_at = now()
       WHERE user_id = $9
       RETURNING *`,
      [
        organizationName,
        ownerName,
        phone,
        address,
        city || null,
        state || null,
        pincode || null,
        establishmentYear || null,
        req.user.id,
      ]
    );
    return res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error("Update ngo profile error:", err);
    return res.status(500).json({ error: "Could not update profile." });
  }
});

// GET /api/ngo/donations - donations available to claim, plus ones this NGO has accepted
router.get("/donations", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.email AS donor_email
       FROM donations d
       JOIN users u ON u.id = d.donor_id
       WHERE d.status = 'Pending' OR d.accepted_by_ngo_id = $1
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );
    return res.json({ donations: result.rows });
  } catch (err) {
    console.error("List ngo donations error:", err);
    return res.status(500).json({ error: "Could not load donations." });
  }
});

// POST /api/ngo/donations/:id/accept
router.post("/donations/:id/accept", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE donations
       SET status = 'Accepted', accepted_by_ngo_id = $1, updated_at = now()
       WHERE id = $2 AND status = 'Pending'
       RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res
        .status(409)
        .json({ error: "This donation is no longer available (already accepted or removed)." });
    }
    return res.json({ donation: result.rows[0] });
  } catch (err) {
    console.error("Accept donation error:", err);
    return res.status(500).json({ error: "Could not accept donation." });
  }
});

// POST /api/ngo/donations/:id/complete - mark a donation this NGO accepted as collected
router.post("/donations/:id/complete", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE donations
       SET status = 'Completed', updated_at = now()
       WHERE id = $1 AND accepted_by_ngo_id = $2 AND status = 'Accepted'
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ error: "This donation cannot be marked completed." });
    }
    return res.json({ donation: result.rows[0] });
  } catch (err) {
    console.error("Complete donation error:", err);
    return res.status(500).json({ error: "Could not update donation." });
  }
});

module.exports = router;
