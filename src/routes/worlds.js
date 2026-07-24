const { Router } = require('express');
const Joi = require('joi');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');

const router = Router();

const createWorldSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).required(),
  settings: Joi.object().default({}),
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, slug, settings } = await createWorldSchema.validateAsync(req.body);
    const result = await db.query(
      `INSERT INTO worlds (name, slug, owner_id, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, slug, req.user.id, JSON.stringify(settings)]
    );
    await db.query(
      'INSERT INTO world_members (world_id, user_id, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, req.user.id, 'dm']
    );
    res.status(201).json({ world: result.rows[0] });
  } catch (err) {
    if (err.isJoi) return res.status(400).json({ error: 'ValidationError', details: err.details.map(d => d.message) });
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already taken' });
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT w.* FROM worlds w
       JOIN world_members wm ON wm.world_id = w.id
       WHERE wm.user_id = $1
       ORDER BY w.updated_at DESC`,
      [req.user.id]
    );
    res.json({ worlds: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT w.* FROM worlds w
       JOIN world_members wm ON wm.world_id = w.id
       WHERE w.id = $1 AND wm.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'World not found' });
    res.json({ world: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { name, settings } = req.body;
    const result = await db.query(
      `UPDATE worlds SET name = COALESCE($1, name), settings = COALESCE($2, settings), updated_at = NOW()
       WHERE id = $3 AND owner_id = $4
       RETURNING *`,
      [name, settings ? JSON.stringify(settings) : null, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'World not found or not owner' });
    res.json({ world: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/join', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      'INSERT INTO world_members (world_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *',
      [req.params.id, req.user.id, 'player']
    );
    if (result.rows.length === 0) return res.status(409).json({ error: 'Already a member' });
    res.status(201).json({ membership: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
