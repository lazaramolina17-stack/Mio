const { Router } = require('express');
const db = require('../../db/connection');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { world_id, settlement_id } = req.query;
    let query = 'SELECT * FROM npcs WHERE world_id = $1';
    const params = [world_id];
    if (settlement_id) {
      query += ' AND settlement_id = $2';
      params.push(settlement_id);
    }
    query += ' ORDER BY name ASC';
    const result = await db.query(query, params);
    res.json({ npcs: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM npcs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'NPC not found' });
    res.json({ npc: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
