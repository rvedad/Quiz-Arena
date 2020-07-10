import { Router } from 'express';
import sql from '../db/sql.js';

const router = Router();

// GET /api/categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await sql`
      SELECT id, name, description, question_count FROM categories ORDER BY name
    `;
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Category name is required.' });
  try {
    const [category] = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name.trim()}, ${description})
      RETURNING id, name, description, question_count
    `;
    res.status(201).json(category);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A category with that name already exists.' });
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Category name is required.' });
  try {
    const [category] = await sql`
      UPDATE categories SET name = ${name.trim()}, description = ${description}
      WHERE id = ${req.params.id}
      RETURNING id, name, description, question_count
    `;
    if (!category) return res.status(404).json({ error: 'Category not found.' });
    res.json(category);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A category with that name already exists.' });
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM categories WHERE id = ${req.params.id} RETURNING id`;
    if (!deleted) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
