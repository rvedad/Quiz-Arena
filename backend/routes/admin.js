import { Router } from "express";
import sql from "../db/sql.js";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [stats] = await sql`
      SELECT
        (SELECT COUNT(*) FROM users WHERE is_admin = false) AS total_users,
        (SELECT COUNT(*) FROM categories) AS total_categories,
        (SELECT COUNT(*) FROM questions) AS total_questions,
        (SELECT COUNT(*) FROM quiz_attempts) AS total_quizzes_played
    `;
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
