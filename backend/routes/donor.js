const express = require("express");
const pool = require("../db/pool");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireRole("donor"));

// GET /api/donor/profile
router.get("/profile", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dp.*, u.email FROM donor_profiles dp
       JOIN users u ON u.id = dp.user_id
       WHERE dp.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found." });
    }
    return res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error("Get donor profile error:", err);
    return res.status(500).json({ error: "Could not load profile." });
  }
});

// PUT /api/donor/profile
router.put("/profile", async (req, res) => {
  const { organizationName, ownerName, phone, address, city, state, pincode, businessType } =
    req.body;

  if (!organizationName || !ownerName || !phone || !address) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  try {
    const result = await pool.query(
      `UPDATE donor_profiles
       SET organization_name = $1, owner_name = $2, phone = $3, address = $4,
           city = $5, state = $6, pincode = $7, business_type = $8, updated_at = now()
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
        businessType || "Restaurant / Hotel",
        req.user.id,
      ]
    );
    return res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error("Update donor profile error:", err);
    return res.status(500).json({ error: "Could not update profile." });
  }
});

// GET /api/donor/donations - the donor's own donations
router.get("/donations", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM donations WHERE donor_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ donations: result.rows });
  } catch (err) {
    console.error("List donor donations error:", err);
    return res.status(500).json({ error: "Could not load donations." });
  }
});

// POST /api/donor/donations - create a donation
router.post("/donations", async (req, res) => {
  const { restaurantName, foodName, quantity, donationDate, pickupAddress } = req.body;

  if (!restaurantName || !foodName || !quantity || !donationDate || !pickupAddress) {
    return res.status(400).json({ error: "Please fill all donation details." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO donations
        (donor_id, restaurant_name, food_name, quantity, donation_date, pickup_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
       RETURNING *`,
      [req.user.id, restaurantName, foodName, quantity, donationDate, pickupAddress]
    );
    return res.status(201).json({ donation: result.rows[0] });
  } catch (err) {
    console.error("Create donation error:", err);
    return res.status(500).json({ error: "Could not save donation." });
  }
});

// DELETE /api/donor/donations/:id - remove own donation (any status, matches original UI)
router.delete("/donations/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM donations WHERE id = $1 AND donor_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Donation not found." });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete donation error:", err);
    return res.status(500).json({ error: "Could not remove donation." });
  }
});

module.exports = router;
