import { Router } from "express";
import sql from "../db/sql.js";

const router = Router();

router.get("/global", async (req, res) => {
  try {
    const rankings = await sql`
      SELECT id, username, total_points,
             RANK() OVER (ORDER BY total_points DESC) AS rank
      FROM users WHERE is_admin = false
      ORDER BY total_points DESC LIMIT 50
    `;
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

router.get("/category/:id", async (req, res) => {
  try {
    const rankings = await sql`
      SELECT u.id, u.username, cp.points,
             RANK() OVER (ORDER BY cp.points DESC) AS rank
      FROM category_points cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.category_id = ${req.params.id}
      ORDER BY cp.points DESC LIMIT 50
    `;
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
