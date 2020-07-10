import { Router } from "express";
import sql from "../db/sql.js";
import { getRequestUser } from "../middleware/auth.js";

const router = Router();

// POST /api/quiz/generate
router.post("/generate", async (req, res) => {
  const { category_id, count } = req.body;
  if (![5, 10, 20].includes(count))
    return res
      .status(400)
      .json({ error: "Question count must be 5, 10, or 20." });

  try {
    let query = `
      SELECT id, question_text, option_a, option_b, option_c, option_d, category_id
      FROM questions
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      params.push(Number(category_id));
      query += ` AND category_id = $${params.length}`;
    }

    params.push(count);
    query += ` ORDER BY RANDOM() LIMIT $${params.length}`;

    const questions = await sql(query, params);

    if (questions.length < count)
      return res
        .status(400)
        .json({ error: "Not enough questions match your filters." });

    res.json({ questions });
  } catch (err) {
    console.error("Generate quiz error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// POST /api/quiz/submit
router.post("/submit", async (req, res) => {
  const user = getRequestUser(req);
  const { questions, answers } = req.body;
  if (!questions?.length || !answers?.length)
    return res
      .status(400)
      .json({ error: "Questions and answers are required." });

  try {
    const ids = questions.map((q) => q.id);
    const correctRows =
      await sql`SELECT id, correct_option FROM questions WHERE id = ANY(${ids})`;
    const correctMap = Object.fromEntries(
      correctRows.map((r) => [String(r.id), r]),
    );

    let score = 0,
      correctCount = 0;
    const answerRows = answers.map((a) => {
      const correct = correctMap[String(a.question_id)];
      const is_correct = !!(
        correct && a.selected_option === correct.correct_option
      );
      if (is_correct) {
        score++;
        correctCount++;
      }
      return {
        question_id: a.question_id,
        selected_option: a.selected_option ?? null,
        is_correct,
        time_taken_sec: a.time_taken_sec ?? 0,
      };
    });

    const category_id = questions.every(
      (q) => q.category_id === questions[0].category_id,
    )
      ? questions[0].category_id
      : null;

    const [attempt] = await sql`
      INSERT INTO quiz_attempts (user_id, category_id, total_questions, score)
      VALUES (${user?.id ?? null}, ${category_id}, ${questions.length}, ${score})
      RETURNING id, score
    `;

    for (const a of answerRows) {
      await sql`
        INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct, time_taken_sec)
        VALUES (${attempt.id}, ${a.question_id}, ${a.selected_option}, ${a.is_correct}, ${a.time_taken_sec})
      `;
    }

    if (user) {
      await sql`UPDATE users SET total_points = total_points + ${score} WHERE id = ${user.id}`;
      if (category_id) {
        await sql`
          INSERT INTO category_points (user_id, category_id, points)
          VALUES (${user.id}, ${category_id}, ${score})
          ON CONFLICT (user_id, category_id)
          DO UPDATE SET points = category_points.points + ${score}
        `;
      }
    }

    res.json({
      attempt_id: attempt.id,
      score: attempt.score,
      accuracy: attempt.accuracy,
      correct: correctMap,
    });
  } catch (err) {
    console.error("Submit quiz error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/quiz/history
router.get("/history", async (req, res) => {
  const user = getRequestUser(req);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  if (!user) return res.json([]);
  try {
    const history = await sql`
      SELECT qa.id, qa.score, qa.total_questions, qa.completed_at,
             c.name AS category_name
      FROM quiz_attempts qa
      LEFT JOIN categories c ON c.id = qa.category_id
      WHERE qa.user_id = ${user.id}
      ORDER BY qa.completed_at DESC LIMIT ${limit}
    `;
    res.json(history);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
