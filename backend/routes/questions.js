import { Router } from 'express';
import sql from '../db/sql.js';

const router = Router();

// GET /api/questions
router.get('/', async (req, res) => {
  const { search, category_id } = req.query;
  try {
    let query = `
      SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
             q.correct_option, q.category_id, c.name AS category_name
      FROM questions q
      JOIN categories c ON c.id = q.category_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND q.question_text ILIKE $${params.length}`;
    }
    if (category_id) {
      params.push(Number(category_id));
      query += ` AND q.category_id = $${params.length}`;
    }

    query += ` ORDER BY c.name, q.id`;

    const questions = await sql(query, params);
    res.json(questions);
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/questions
router.post('/', async (req, res) => {
  const { category_id, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  if (!category_id || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option)
    return res.status(400).json({ error: 'All fields are required.' });
  if (!['A','B','C','D'].includes(correct_option))
    return res.status(400).json({ error: 'Correct option must be A, B, C, or D.' });
  try {
    const [question] = await sql`
      INSERT INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_option)
      VALUES (${category_id}, ${question_text}, ${option_a}, ${option_b}, ${option_c}, ${option_d}, ${correct_option})
      RETURNING *
    `;
    res.status(201).json(question);
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/questions/:id
router.put('/:id', async (req, res) => {
  const { category_id, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  try {
    const [question] = await sql`
      UPDATE questions SET
        category_id = ${category_id}, question_text = ${question_text},
        option_a = ${option_a}, option_b = ${option_b},
        option_c = ${option_c}, option_d = ${option_d},
        correct_option = ${correct_option}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json(question);
  } catch (err) {
    console.error('Update question error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/questions/:id
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM questions WHERE id = ${req.params.id} RETURNING id`;
    if (!deleted) return res.status(404).json({ error: 'Question not found.' });
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
