const express = require("express");
const router = express.Router();
const { query } = require("../helpers/db");

// POST /contact
router.post("/", async (req, res) => {
  const { full_name, email, phone, subject, message } = req.body;

  try {
    const result = await query(
      `INSERT INTO contact_us 
       (full_name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [full_name, email, phone, subject, message]
    );

    res.json({
      success: true,
      message: "Message saved successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = { contactRouter: router };