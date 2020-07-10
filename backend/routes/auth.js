import { Router } from "express";
import { createHash } from "crypto";
import sql from "../db/sql.js";
import { getRequestUser } from "../middleware/auth.js";

const router = Router();

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res
      .status(400)
      .json({ error: "Username, email, and password are required." });
  if (password.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });

  try {
    const existing = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${email}
    `;
    if (existing.length > 0)
      return res
        .status(409)
        .json({ error: "Username or email already taken." });

    const [user] = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${hashPassword(password)})
      RETURNING id, username, email, is_admin, total_points, created_at
    `;

    res.status(201).json({ user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  try {
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!user || user.password_hash !== hashPassword(password))
      return res.status(401).json({ error: "Invalid email or password." });

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/auth/profile
router.get("/profile", async (req, res) => {
  const user = getRequestUser(req);
  if (!user) return res.status(400).json({ error: "Not logged in." });

  try {
    const [profile] = await sql`
      WITH ranked_users AS (
        SELECT id, RANK() OVER (ORDER BY total_points DESC) AS global_rank
        FROM users WHERE is_admin = false
      )
      SELECT
        u.id, u.username, u.email, u.is_admin,
        u.total_points, u.created_at,
        COUNT(DISTINCT qa.id)      AS quizzes_completed,
        ru.global_rank
      FROM users u
      LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
      LEFT JOIN ranked_users  ru ON ru.id = u.id
      WHERE u.id = ${user.id}
      GROUP BY u.id, ru.global_rank
    `;

    if (!profile) return res.status(404).json({ error: "User not found." });
    res.json(profile);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
